import Foundation
import ScriptingBridge

struct Snapshot: Codable {
    let state: String
    let name: String?
    let artist: String?
    let album: String?
    let albumArtist: String?
    let duration: Double?
    let position: Double?
    let persistentId: String?
}

func stringValue(_ object: NSObject, _ key: String) -> String? {
    object.value(forKey: key) as? String
}

func doubleValue(_ object: NSObject, _ key: String) -> Double? {
    if let value = object.value(forKey: key) as? NSNumber { return value.doubleValue }
    return object.value(forKey: key) as? Double
}

func fourCharacterCode(_ text: String) -> UInt32 {
    text.utf8.reduce(0) { ($0 << 8) | UInt32($1) }
}

func playerState(_ application: NSObject) -> String {
    guard let number = application.value(forKey: "playerState") as? NSNumber else { return "stopped" }
    switch number.uint32Value {
    case fourCharacterCode("kPSP"), fourCharacterCode("kPSF"), fourCharacterCode("kPSR"):
        return "playing"
    case fourCharacterCode("kPSp"):
        return "paused"
    default:
        return "stopped"
    }
}

func readSnapshot() -> Snapshot {
    guard let music = SBApplication(bundleIdentifier: "com.apple.Music") else {
        return Snapshot(state: "unavailable", name: nil, artist: nil, album: nil, albumArtist: nil, duration: nil, position: nil, persistentId: nil)
    }
    guard music.isRunning else {
        return Snapshot(state: "stopped", name: nil, artist: nil, album: nil, albumArtist: nil, duration: nil, position: nil, persistentId: nil)
    }

    let application = music as NSObject
    let state = playerState(application)
    guard state != "stopped", let track = application.value(forKey: "currentTrack") as? NSObject else {
        return Snapshot(state: state, name: nil, artist: nil, album: nil, albumArtist: nil, duration: nil, position: nil, persistentId: nil)
    }

    return Snapshot(
        state: state,
        name: stringValue(track, "name"),
        artist: stringValue(track, "artist"),
        album: stringValue(track, "album"),
        albumArtist: stringValue(track, "albumArtist"),
        duration: doubleValue(track, "duration"),
        position: doubleValue(application, "playerPosition"),
        persistentId: stringValue(track, "persistentID")
    )
}

let encoder = JSONEncoder()
let arguments = CommandLine.arguments
let once = arguments.contains("--once")
let intervalMilliseconds: UInt32 = {
    guard let index = arguments.firstIndex(of: "--interval-ms"), index + 1 < arguments.count,
          let value = UInt32(arguments[index + 1]) else { return 1000 }
    return max(250, value)
}()

repeat {
    autoreleasepool {
        let data = try! encoder.encode(readSnapshot())
        FileHandle.standardOutput.write(data)
        FileHandle.standardOutput.write(Data([0x0a]))
    }
    if !once { usleep(intervalMilliseconds * 1000) }
} while !once
