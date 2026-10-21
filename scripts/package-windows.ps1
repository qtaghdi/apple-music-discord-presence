$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$packageName = "apple-music-discord-presence-windows-x64"
$releaseDirectory = Join-Path $root "release"
$packageDirectory = Join-Path $releaseDirectory $packageName
$archive = Join-Path $releaseDirectory "$packageName.zip"

Remove-Item -Recurse -Force $packageDirectory, $archive -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path (Join-Path $packageDirectory "runtime") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $packageDirectory "native") | Out-Null
Copy-Item (Get-Command node).Source (Join-Path $packageDirectory "runtime\node.exe")
New-Item -ItemType Directory -Force -Path (Join-Path $packageDirectory "dist") | Out-Null
Copy-Item -Recurse (Join-Path $root "dist\src") (Join-Path $packageDirectory "dist\src")
Copy-Item (Join-Path $root "native\MusicMetadata.ps1") (Join-Path $packageDirectory "native\MusicMetadata.ps1")
Copy-Item (Join-Path $root "config.example.json"), (Join-Path $root "LICENSE") $packageDirectory
Copy-Item (Join-Path $root "packaging\windows\README.txt") (Join-Path $packageDirectory "README.txt")
Copy-Item (Join-Path $root "packaging\windows\*.ps1"), (Join-Path $root "packaging\windows\*.cmd") $packageDirectory
Compress-Archive -Path $packageDirectory -DestinationPath $archive -CompressionLevel Optimal
Write-Output $archive
