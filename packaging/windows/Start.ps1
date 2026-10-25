$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$mutex = New-Object System.Threading.Mutex($false, "Local\AppleMusicDiscordPresenceTray")
$owned = $false
try { $owned = $mutex.WaitOne(0) } catch [System.Threading.AbandonedMutexException] { $owned = $true }
if (-not $owned) { Start-Process "http://127.0.0.1:47621/"; $mutex.Dispose(); exit }
$root = $PSScriptRoot
$logDirectory = Join-Path $env:LOCALAPPDATA "Apple Music Discord Presence\Logs"
New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
$script:node = $null
function Start-Worker {
    $script:node = Start-Process (Join-Path $root "runtime\node.exe") -ArgumentList "`"$(Join-Path $root 'dist\src\index.js')`"" -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDirectory 'app.log') -RedirectStandardError (Join-Path $logDirectory 'error.log') -PassThru
}
function Stop-Worker {
    if ($script:node -and -not $script:node.HasExited) {
        # Terminate the owned process tree, including the Windows metadata helper.
        & taskkill.exe /PID $script:node.Id /T /F | Out-Null
        $script:node.WaitForExit()
    }
    $script:node = $null
}
$runKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
$runName = 'AppleMusicDiscordPresence'
$runCommand = "powershell.exe -STA -NoLogo -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$(Join-Path $root 'Start.ps1')`""
$tray = New-Object System.Windows.Forms.NotifyIcon
$appIcon = [System.Drawing.Icon]::new((Join-Path $root 'settings\assets\brand-mark.ico'), 32, 32)
$tray.Icon = $appIcon
$tray.Text = 'Apple Music Discord Presence'
$menu = New-Object System.Windows.Forms.ContextMenuStrip
$status = $menu.Items.Add('Waiting for Discord')
$status.Enabled = $false
$settings = $menu.Items.Add('Open Settings')
$settings.add_Click({ Start-Process 'http://127.0.0.1:47621/' })
$tray.add_DoubleClick({ Start-Process 'http://127.0.0.1:47621/' })
$restart = $menu.Items.Add('Reconnect')
$restart.add_Click({ Stop-Worker; Start-Worker })
$login = $menu.Items.Add('Launch at login')
$login.Checked = $null -ne (Get-ItemProperty -Path $runKey -Name $runName -ErrorAction SilentlyContinue)
$login.add_Click({
    if ($login.Checked) { Remove-ItemProperty -Path $runKey -Name $runName -ErrorAction SilentlyContinue; $login.Checked = $false }
    else { if (-not (Test-Path $runKey)) { New-Item -Path $runKey -Force | Out-Null }; New-ItemProperty -Path $runKey -Name $runName -Value $runCommand -PropertyType String -Force | Out-Null; $login.Checked = $true }
})
$logs = $menu.Items.Add('Open Logs')
$logs.add_Click({ Start-Process explorer.exe -ArgumentList "`"$logDirectory`"" })
$quit = $menu.Items.Add('Quit')
$quit.add_Click({ [System.Windows.Forms.Application]::ExitThread() })
$tray.ContextMenuStrip = $menu
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 3000
$timer.add_Tick({
    if (-not $script:node -or $script:node.HasExited) { $status.Text = 'App stopped - choose Reconnect'; return }
    try {
        $health = Invoke-RestMethod 'http://127.0.0.1:47621/health' -TimeoutSec 1
        $status.Text = if ($health.discordConnected) { 'Connected to Discord' } else { 'Waiting for Discord' }
    } catch { $status.Text = 'Waiting for app' }
})
try {
    Start-Worker
    $tray.Visible = $true
    $timer.Start()
    [System.Windows.Forms.Application]::Run()
} finally {
    $timer.Stop(); $timer.Dispose()
    $tray.Visible = $false; $tray.Dispose(); $menu.Dispose()
    $appIcon.Dispose()
    Stop-Worker
    if ($owned) { $mutex.ReleaseMutex() }
    $mutex.Dispose()
}
