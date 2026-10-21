[CmdletBinding()]
param(
    [ValidateRange(250, 60000)]
    [int]$IntervalMs = 1000,
    [switch]$Once
)

$ErrorActionPreference = "Stop"
$utf8 = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = $utf8
$OutputEncoding = $utf8

Add-Type -AssemblyName System.Runtime.WindowsRuntime

function Wait-WinRtOperation {
    param(
        [Parameter(Mandatory = $true)]$Operation,
        [Parameter(Mandatory = $true)][Type]$ResultType
    )

    $asTask = [System.WindowsRuntimeSystemExtensions].GetMethods() |
        Where-Object {
            $_.Name -eq "AsTask" -and
            $_.IsGenericMethod -and
            $_.GetParameters().Count -eq 1
        } |
        Select-Object -First 1
    $task = $asTask.MakeGenericMethod($ResultType).Invoke($null, @($Operation))
    $task.Wait()
    return $task.Result
}

$managerType = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType = WindowsRuntime]
$propertiesType = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties, Windows.Media.Control, ContentType = WindowsRuntime]
$managerOperation = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType = WindowsRuntime]::RequestAsync()
$manager = Wait-WinRtOperation -Operation $managerOperation -ResultType $managerType

function Write-Snapshot {
    $session = $manager.GetSessions() |
        Where-Object { $_.SourceAppUserModelId -match "(?i)(AppleMusic|AppleInc\.AppleMusic|iTunes)" } |
        Select-Object -First 1

    if ($null -eq $session) {
        [ordered]@{ state = "stopped" } | ConvertTo-Json -Compress
        return
    }

    $playback = $session.GetPlaybackInfo()
    $timeline = $session.GetTimelineProperties()
    $properties = Wait-WinRtOperation -Operation $session.TryGetMediaPropertiesAsync() -ResultType $propertiesType
    $state = switch ($playback.PlaybackStatus.ToString()) {
        "Playing" { "playing" }
        "Paused" { "paused" }
        default { "stopped" }
    }

    [ordered]@{
        state = $state
        name = $properties.Title
        artist = $properties.Artist
        album = $properties.AlbumTitle
        albumArtist = $properties.AlbumArtist
        duration = [Math]::Max(0, $timeline.EndTime.TotalSeconds)
        position = [Math]::Max(0, $timeline.Position.TotalSeconds)
        persistentId = "$($session.SourceAppUserModelId)|$($properties.Artist)|$($properties.AlbumTitle)|$($properties.Title)"
    } | ConvertTo-Json -Compress
}

do {
    try {
        Write-Snapshot
    } catch {
        [Console]::Error.WriteLine("Apple Music media session error: $($_.Exception.Message)")
        [ordered]@{ state = "unavailable" } | ConvertTo-Json -Compress
    }
    if (-not $Once) { Start-Sleep -Milliseconds $IntervalMs }
} while (-not $Once)
