# One-time: encrypt and save the VM sudo password using Windows DPAPI.
# Only the CURRENT Windows user on THIS machine can decrypt the file.
param(
  [string]$OutFile = (Join-Path $PSScriptRoot ".deploy-credential.xml")
)

$ErrorActionPreference = "Stop"

Write-Host "Enter the sudo/SSH password for charles@57.158.25.229 (input is hidden):" -ForegroundColor Cyan
$secure = Read-Host -AsSecureString
$cred = [PSCustomObject]@{ Password = $secure }
$cred | Export-Clixml -Path $OutFile -Force

Write-Host "Saved encrypted credential to: $OutFile" -ForegroundColor Green
Write-Host "Only the current Windows user can decrypt this file (Windows DPAPI)." -ForegroundColor Yellow
