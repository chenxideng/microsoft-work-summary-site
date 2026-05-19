param(
  [string]$VmAddress = "57.158.25.229",
  [string]$User = "charles",
  [Parameter(Mandatory = $true)]
  [securestring]$Password,
  [string]$RemotePath = "/home/charles/microsoft-workspace"
)

$ErrorActionPreference = "Stop"
$plink = "C:\Program Files\PuTTY\plink.exe"
$pscp = "C:\Program Files\PuTTY\pscp.exe"
$passwordBstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password)
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto($passwordBstr)

$files = @(
  "index.html",
  "profile.html",
  "styles.css",
  "script.js",
  "content.json",
  "profile-avatar.svg",
  "package.json",
  "server.js",
  "README.md",
  "pmx-workbook.html"
)

$existingFiles = $files | Where-Object { Test-Path $_ }
if (-not $existingFiles) {
  throw "No deployable files found in current folder."
}

try {
  $remoteTarget = "{0}@{1}:{2}/" -f $User, $VmAddress, $RemotePath
  & $pscp -batch -pw $passwordPlain @existingFiles $remoteTarget
  & $plink -ssh -batch -l $User -pw $passwordPlain $VmAddress "cd $RemotePath && npm install --omit=dev && echo '$passwordPlain' | sudo -S systemctl restart microsoft-workspace.service && systemctl is-active microsoft-workspace.service"
}
finally {
  if ($passwordBstr -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordBstr)
  }
}

Write-Host ("Deployment completed to {0}:{1}" -f $VmAddress, $RemotePath)
