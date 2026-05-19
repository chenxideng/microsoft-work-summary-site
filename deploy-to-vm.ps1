param(
  [string]$VmHost = "57.158.25.229",
  [string]$User = "charles",
  [Parameter(Mandatory = $true)]
  [string]$Password,
  [string]$RemotePath = "/home/charles/microsoft-workspace"
)

$ErrorActionPreference = "Stop"
$plink = "C:\Program Files\PuTTY\plink.exe"
$pscp = "C:\Program Files\PuTTY\pscp.exe"

$files = @(
  "index.html",
  "styles.css",
  "script.js",
  "content.json",
  "package.json",
  "server.js",
  "README.md"
)

$existingFiles = $files | Where-Object { Test-Path $_ }
if (-not $existingFiles) {
  throw "No deployable files found in current folder."
}

& $pscp -batch -pw $Password @existingFiles "${User}@${VmHost}:${RemotePath}/"
& $plink -ssh -batch -l $User -pw $Password $VmHost "cd $RemotePath && npm install --omit=dev && echo '$Password' | sudo -S systemctl restart microsoft-workspace.service && systemctl is-active microsoft-workspace.service"

Write-Host "Deployment completed to ${VmHost}:${RemotePath}"
