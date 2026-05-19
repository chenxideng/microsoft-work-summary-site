# Register/refresh the Windows Scheduled Task that runs auto-sync.ps1 daily at 02:00.
# Run once as the current user (no elevation required).

$ErrorActionPreference = "Stop"

$TaskName = "MicrosoftWorkSummary-AutoSync"
$ScriptPath = Join-Path $PSScriptRoot "auto-sync.ps1"
$WorkDir = $PSScriptRoot

if (-not (Test-Path $ScriptPath)) { throw "auto-sync.ps1 not found at $ScriptPath" }

$action = New-ScheduledTaskAction `
  -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`"" `
  -WorkingDirectory $WorkDir

$trigger = New-ScheduledTaskTrigger -Daily -At 2:00am

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -ExecutionTimeLimit (New-TimeSpan -Hours 1)

$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

# Re-register if exists
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Principal $principal `
  -Description "Daily auto-sync of Microsoft Work Summary site (PMX export, PPTX photos, source files) and deploy to Azure VM." | Out-Null

Write-Host "Scheduled task '$TaskName' registered. Runs daily at 02:00." -ForegroundColor Green
Write-Host "Test it now with:  Start-ScheduledTask -TaskName $TaskName" -ForegroundColor Cyan
Write-Host "View log:           Get-Content `"$(Join-Path $WorkDir 'auto-sync.log')`" -Tail 30" -ForegroundColor Cyan
