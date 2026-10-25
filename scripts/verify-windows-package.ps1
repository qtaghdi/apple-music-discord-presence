param([Parameter(Mandatory = $true)][string]$Archive)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$directory = Join-Path ([System.IO.Path]::GetTempPath()) ('AM Presence package test ' + [guid]::NewGuid().ToString('N'))
try {
    Expand-Archive -LiteralPath $Archive -DestinationPath $directory
    $root = Join-Path $directory 'apple-music-discord-presence-windows-x64'
    foreach ($file in @('Start.ps1', 'Install.ps1', 'Install.cmd', 'runtime\node.exe', 'dist\src\index.js', 'settings\assets\brand-mark.ico')) {
        if (-not (Test-Path -LiteralPath (Join-Path $root $file) -PathType Leaf)) { throw "Missing packaged file: $file" }
    }
    $iconPath = Join-Path $root 'settings\assets\brand-mark.ico'
    foreach ($size in @(16, 32, 48)) {
        $icon = [System.Drawing.Icon]::new($iconPath, $size, $size)
        try {
            $bitmap = $icon.ToBitmap()
            try { if ($bitmap.Width -lt 16 -or $bitmap.Height -lt 16) { throw 'Invalid icon dimensions' } }
            finally { $bitmap.Dispose() }
        } finally { $icon.Dispose() }
    }
    $shell = New-Object -ComObject WScript.Shell
    $shortcutPath = Join-Path $directory 'AM Presence.lnk'
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
    $shortcut.IconLocation = $iconPath + ',0'
    $shortcut.Save()
    $reloaded = $shell.CreateShortcut($shortcutPath)
    if ($reloaded.IconLocation -ne ($iconPath + ',0')) { throw 'Shortcut icon did not survive saving' }
    Write-Output 'Packaged icon decodes at tray sizes and survives shortcut creation in a path with spaces.'
} finally {
    Remove-Item -LiteralPath $directory -Recurse -Force -ErrorAction SilentlyContinue
}
