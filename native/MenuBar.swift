import AppKit

final class AppDelegate: NSObject, NSApplicationDelegate {
    let name = "Apple Music Discord Presence"
    let status = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
    let connection = NSMenuItem(title: "연결 준비 중…", action: nil, keyEquivalent: "")
    let login = NSMenuItem(title: "로그인 시 자동 실행", action: #selector(toggleLogin), keyEquivalent: "")
    let fm = FileManager.default
    var worker: Process?
    var timer: Timer?
    var quitting = false
    var checking = false
    let base = FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent("Library/Application Support/Apple Music Discord Presence")
    var loginFile: URL { fm.homeDirectoryForCurrentUser.appendingPathComponent("Library/LaunchAgents/io.github.apple-music-discord-presence.plist") }

    func applicationDidFinishLaunching(_ notification: Notification) {
        if NSRunningApplication.runningApplications(withBundleIdentifier: Bundle.main.bundleIdentifier!).contains(where: { $0.processIdentifier != ProcessInfo.processInfo.processIdentifier }) {
            NSWorkspace.shared.open(URL(string: "http://127.0.0.1:47621/")!)
            NSApp.terminate(nil)
            return
        }
        status.button?.image = NSImage(systemSymbolName: "music.note", accessibilityDescription: name)
        let menu = NSMenu()
        menu.addItem(connection)
        menu.addItem(.separator())
        for (title, action) in [("설정 열기", #selector(openSettings)), ("다시 연결", #selector(restart)), ("로그 폴더 열기", #selector(openLogs))] {
            let item = NSMenuItem(title: title, action: action, keyEquivalent: "")
            item.target = self
            menu.addItem(item)
        }
        login.target = self
        login.state = fm.fileExists(atPath: loginFile.path) ? .on : .off
        menu.addItem(login)
        menu.addItem(.separator())
        let quit = NSMenuItem(title: "종료", action: #selector(quitApp), keyEquivalent: "q")
        quit.target = self
        menu.addItem(quit)
        status.menu = menu
        do {
            try configure()
            if login.state == .on { try setLoginEnabled(true) }
            try startWorker()
        } catch { showError(error) }
        timer = Timer.scheduledTimer(withTimeInterval: 3, repeats: true) { [weak self] _ in self?.refreshStatus() }
        refreshStatus()
    }

    func configure() throws {
        let file = base.appendingPathComponent("config.json")
        guard !fm.fileExists(atPath: file.path) else { return }
        NSApp.activate(ignoringOtherApps: true)
        let alert = NSAlert()
        alert.messageText = "Apple Music을 Discord에 표시하기"
        alert.informativeText = "Discord 개발자 포털에서 만든 앱의 Application ID를 입력하세요. 비밀번호나 봇 토큰은 필요하지 않습니다."
        let input = NSTextField(frame: NSRect(x: 0, y: 0, width: 360, height: 24))
        input.placeholderString = "Application ID (17–20자리 숫자)"
        alert.accessoryView = input
        alert.addButton(withTitle: "연결")
        alert.addButton(withTitle: "개발자 포털 열기")
        alert.addButton(withTitle: "종료")
        while true {
            let result = alert.runModal()
            if result == .alertSecondButtonReturn {
                NSWorkspace.shared.open(URL(string: "https://discord.com/developers/applications")!)
                continue
            }
            guard result == .alertFirstButtonReturn else { NSApp.terminate(nil); return }
            let id = input.stringValue.trimmingCharacters(in: .whitespacesAndNewlines)
            guard id.range(of: "^[0-9]{17,20}$", options: .regularExpression) != nil else {
                alert.informativeText = "Application ID는 17–20자리 숫자입니다. 다시 확인해 주세요."
                continue
            }
            try fm.createDirectory(at: base, withIntermediateDirectories: true)
            let data = try JSONSerialization.data(withJSONObject: ["discordClientId": id, "showPaused": false, "artwork": ["enabled": true, "country": "US"]], options: [.prettyPrinted])
            try data.write(to: file, options: .atomic)
            try fm.setAttributes([.posixPermissions: 0o600], ofItemAtPath: file.path)
            return
        }
    }

    var logs: URL { fm.homeDirectoryForCurrentUser.appendingPathComponent("Library/Logs/Apple Music Discord Presence") }
    func startWorker() throws {
        guard worker?.isRunning != true else { return }
        let root = Bundle.main.resourceURL!
        let process = Process()
        process.executableURL = root.appendingPathComponent("runtime/bin/node")
        process.arguments = [root.appendingPathComponent("dist/src/index.js").path]
        process.currentDirectoryURL = root
        try fm.createDirectory(at: logs, withIntermediateDirectories: true)
        func output(_ name: String) throws -> FileHandle {
            let path = logs.appendingPathComponent(name).path
            if !fm.fileExists(atPath: path) { fm.createFile(atPath: path, contents: nil) }
            let handle = try FileHandle(forWritingTo: URL(fileURLWithPath: path))
            handle.seekToEndOfFile()
            return handle
        }
        let out = try output("app.log")
        let err = try output("error.log")
        defer { out.closeFile(); err.closeFile() }
        process.standardOutput = out
        process.standardError = err
        process.terminationHandler = { [weak self] _ in
            DispatchQueue.main.async {
                guard let self = self, !self.quitting else { return }
                self.connection.title = "앱 중지됨 · 다시 연결을 눌러 주세요"
            }
        }
        try process.run()
        worker = process
    }
    func stopWorker() {
        if let process = worker, process.isRunning { process.terminate(); process.waitUntilExit() }
        worker = nil
    }
    func refreshStatus() {
        guard worker?.isRunning == true, !checking else { return }
        checking = true
        var request = URLRequest(url: URL(string: "http://127.0.0.1:47621/health")!)
        request.timeoutInterval = 2
        URLSession.shared.dataTask(with: request) { [weak self] data, _, _ in
            let body = data.flatMap { try? JSONSerialization.jsonObject(with: $0) as? [String: Any] }
            DispatchQueue.main.async {
                guard let self = self else { return }
                self.checking = false
                guard self.worker?.isRunning == true else { return }
                self.connection.title = body == nil ? "앱 응답 대기 중…" : (body?["discordConnected"] as? Bool == true ? "Discord 연결됨" : "Discord 연결 대기 중")
            }
        }.resume()
    }
    @objc func openSettings() { NSWorkspace.shared.open(URL(string: "http://127.0.0.1:47621/")!) }
    @objc func openLogs() { NSWorkspace.shared.open(logs) }
    @objc func restart() {
        stopWorker()
        connection.title = "연결 준비 중…"
        do { try startWorker() } catch { showError(error) }
    }
    func setLoginEnabled(_ enabled: Bool) throws {
        if enabled {
            let plist: [String: Any] = ["Label": "io.github.apple-music-discord-presence", "ProgramArguments": ["/usr/bin/open", "-a", Bundle.main.bundlePath], "RunAtLoad": true]
            try fm.createDirectory(at: loginFile.deletingLastPathComponent(), withIntermediateDirectories: true)
            try PropertyListSerialization.data(fromPropertyList: plist, format: .xml, options: 0).write(to: loginFile, options: .atomic)
        } else if fm.fileExists(atPath: loginFile.path) {
            try fm.removeItem(at: loginFile)
        }
        login.state = enabled ? .on : .off
    }
    @objc func toggleLogin() {
        do { try setLoginEnabled(login.state != .on) } catch { showError(error) }
    }
    func showError(_ error: Error) {
        NSApp.activate(ignoringOtherApps: true)
        let alert = NSAlert()
        alert.messageText = "앱을 실행할 수 없습니다"
        alert.informativeText = error.localizedDescription
        alert.runModal()
    }
    @objc func quitApp() { NSApp.terminate(nil) }
    func applicationWillTerminate(_ notification: Notification) {
        quitting = true
        timer?.invalidate()
        stopWorker()
    }
}
let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)
app.run()
