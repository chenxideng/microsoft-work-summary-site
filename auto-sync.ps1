# Periodic auto-sync for Microsoft Work Summary site.
# - Refreshes PMX workbook from local PMX-tool export (with dark-bg inject)
# - Re-extracts photos from the Partner Enablement PPTX (does NOT touch text)
# - Deploys to VM if any tracked source file changed since last successful deploy
#
# Run manually:   powershell -ExecutionPolicy Bypass -File .\auto-sync.ps1
# Schedule:       see register-auto-sync.ps1

param(
  [string]$LogFile = (Join-Path $PSScriptRoot "auto-sync.log"),
  [string]$StateFile = (Join-Path $PSScriptRoot ".auto-sync-state.json"),
  [string]$CredentialFile = (Join-Path $PSScriptRoot ".deploy-credential.xml"),
  [switch]$Force
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Write-Log {
  param([string]$Message, [string]$Level = "INFO")
  $line = "{0} [{1}] {2}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Level, $Message
  $line | Tee-Object -FilePath $LogFile -Append | Out-Host
}

function Load-State {
  if (Test-Path $StateFile) {
    try { return Get-Content $StateFile -Raw | ConvertFrom-Json }
    catch { return [PSCustomObject]@{} }
  }
  return [PSCustomObject]@{}
}

function Save-State {
  param($State)
  $State | ConvertTo-Json -Depth 4 | Set-Content -Path $StateFile -Encoding UTF8
}

function Get-Mtime {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return $null }
  return (Get-Item $Path).LastWriteTimeUtc.Ticks
}

# ====== Config ======
$PmxSource         = "C:\Users\chenxideng\Documents\pmx-tool\output\pmx-my-work.html"
$PmxTarget         = Join-Path $PSScriptRoot "pmx-workbook.html"
$PptxEnablement    = "C:\Users\chenxideng\OneDrive - Microsoft\11 - Achievement\Partner Enablement & Engagement Activities Review - Charles Deng.pptx"
$PptxSolution      = "C:\Users\chenxideng\OneDrive - Microsoft\11 - Achievement\ASP & Solution Build Review - Charles Deng.pptx"
$EnablementPhotos  = Join-Path $PSScriptRoot "enablement-photos"
$SolutionPhotos    = Join-Path $PSScriptRoot "solution-build-photos"

# Files watched for redeploy (matches deploy-to-vm.ps1 list)
$WatchFiles = @(
  "index.html", "profile.html", "enablement.html",
  "styles.css", "script.js", "content.json",
  "profile-avatar.svg", "profile-avatar.jpg",
  "package.json", "server.js", "README.md",
  "pmx-workbook.html"
)

function Extract-PptxPhotos {
  param(
    [string]$PptxPath,
    [string]$OutDir,
    [string]$EventPrefix = "event"
  )
  $tmp = Join-Path $env:TEMP ("pptx-extract-" + [Guid]::NewGuid().ToString("N"))
  New-Item -ItemType Directory -Path $tmp | Out-Null
  try {
    $zip = Join-Path $tmp "source.zip"
    Copy-Item $PptxPath $zip
    Expand-Archive -Path $zip -DestinationPath $tmp -Force

    $slides = Get-ChildItem (Join-Path $tmp "ppt\slides") -Filter "slide*.xml" |
      Sort-Object { [int]([regex]::Match($_.Name, "\d+").Value) }

    # Count image occurrences across all slides to detect template images
    $imageUsage = @{}
    $slideImages = @{}
    foreach ($s in $slides) {
      $n = [int]([regex]::Match($s.Name, "\d+").Value)
      $relPath = Join-Path $tmp "ppt\slides\_rels\$($s.Name).rels"
      if (-not (Test-Path $relPath)) { $slideImages[$n] = @(); continue }
      $rx = [xml](Get-Content $relPath -Raw)
      $imgs = @($rx.Relationships.Relationship |
        Where-Object { $_.Type -like "*image*" } |
        ForEach-Object { ($_.Target -replace "\.\./media/", "") -replace "&.*$", "" })
      $slideImages[$n] = $imgs
      foreach ($i in $imgs) {
        if ($imageUsage.ContainsKey($i)) { $imageUsage[$i]++ } else { $imageUsage[$i] = 1 }
      }
    }
    # Treat an image as a template ONLY if it appears on every content slide
    $contentSlideCount = ($slideImages.Values | Where-Object { $_.Count -gt 0 }).Count
    $templateThreshold = [Math]::Max(2, $contentSlideCount)

    if (Test-Path $OutDir) { Remove-Item $OutDir -Recurse -Force }
    New-Item -ItemType Directory -Path $OutDir | Out-Null

    foreach ($n in ($slideImages.Keys | Sort-Object)) {
      if ($n -lt 2) { continue }
      $imgs = $slideImages[$n]
      $i = 0
      foreach ($img in $imgs) {
        if ($imageUsage[$img] -ge $templateThreshold) { continue }
        $srcPath = Join-Path $tmp "ppt\media\$img"
        if (-not (Test-Path $srcPath)) { continue }
        $i++
        $ext = [System.IO.Path]::GetExtension($img)
        $newName = "{0}{1:00}-{2:00}{3}" -f $EventPrefix, $n, $i, $ext
        Copy-Item $srcPath (Join-Path $OutDir $newName) -Force
      }
    }
  } finally {
    if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue }
  }
}

Write-Log "=== auto-sync run start ==="
$state = Load-State
$changed = $false

# ----- 1) Sync PMX workbook -----
try {
  if (Test-Path $PmxSource) {
    $srcMtime = (Get-Item $PmxSource).LastWriteTimeUtc.Ticks
    $lastPmx = $state.pmxMtime
    if ($Force -or -not $lastPmx -or [int64]$lastPmx -lt [int64]$srcMtime) {
      Copy-Item $PmxSource $PmxTarget -Force
      # Inject dark-bg style if not already present
      $html = Get-Content $PmxTarget -Raw
      if ($html -notmatch 'html\s*\{\s*background:\s*#e9ecf2') {
        $injected = $html -replace '(?s)(<style>\s*)', "`$1`r`n  html { background: #c9d1de; }`r`n"
        $injected = $injected -replace '(body\s*\{[^}]*line-height:\s*1\.5;)\s*\}', '$1 background: #e9ecf2; }'
        Set-Content -Path $PmxTarget -Value $injected -Encoding UTF8
      }
      Write-Log "PMX workbook refreshed from $PmxSource"
      $state | Add-Member -NotePropertyName pmxMtime -NotePropertyValue $srcMtime -Force
      $changed = $true
    }
  } else {
    Write-Log "PMX source not found: $PmxSource" "WARN"
  }
} catch {
  Write-Log "PMX sync failed: $_" "ERROR"
}

# ----- 2) Re-extract photos from Partner Enablement PPTX -----
try {
  if (Test-Path $PptxEnablement) {
    $srcMtime = (Get-Item $PptxEnablement).LastWriteTimeUtc.Ticks
    $lastPptx = $state.pptxEnablementMtime
    if ($Force -or -not $lastPptx -or [int64]$lastPptx -lt [int64]$srcMtime) {
      Extract-PptxPhotos -PptxPath $PptxEnablement -OutDir $EnablementPhotos -EventPrefix "event"
      Write-Log "Enablement photos refreshed from PPTX (slide text NOT auto-rewritten)"
      $state | Add-Member -NotePropertyName pptxEnablementMtime -NotePropertyValue $srcMtime -Force
      $changed = $true
    }
  } else {
    Write-Log "Enablement PPTX not found: $PptxEnablement" "WARN"
  }
} catch {
  Write-Log "Enablement PPTX sync failed: $_" "ERROR"
}

# ----- 2b) Re-extract photos from ASP & Solution Build PPTX -----
try {
  if (Test-Path $PptxSolution) {
    $srcMtime = (Get-Item $PptxSolution).LastWriteTimeUtc.Ticks
    $lastPptx = $state.pptxSolutionMtime
    if ($Force -or -not $lastPptx -or [int64]$lastPptx -lt [int64]$srcMtime) {
      Extract-PptxPhotos -PptxPath $PptxSolution -OutDir $SolutionPhotos -EventPrefix "slide"
      Write-Log "Solution Build photos refreshed from PPTX"
      $state | Add-Member -NotePropertyName pptxSolutionMtime -NotePropertyValue $srcMtime -Force
      $changed = $true
    }
  } else {
    Write-Log "Solution Build PPTX not found: $PptxSolution" "WARN"
  }
} catch {
  Write-Log "Solution Build PPTX sync failed: $_" "ERROR"
}

# ----- 3) Detect HTML/JSON/CSS/JS changes -----
$lastDeployTicks = if ($state.lastDeployTicks) { [int64]$state.lastDeployTicks } else { 0L }
$watchChanged = $false
foreach ($f in $WatchFiles) {
  $m = Get-Mtime $f
  if ($m -and [int64]$m -gt $lastDeployTicks) { $watchChanged = $true; break }
}
# Photo folder changes also trigger deploy
foreach ($dir in @($EnablementPhotos, $SolutionPhotos)) {
  if (Test-Path $dir) {
    $photoMax = (Get-ChildItem $dir -File -Recurse | Measure-Object -Property LastWriteTimeUtc -Maximum).Maximum
    if ($photoMax -and $photoMax.Ticks -gt $lastDeployTicks) { $watchChanged = $true }
  }
}

if (-not ($changed -or $watchChanged -or $Force)) {
  Write-Log "No changes detected. Skip deploy."
  Save-State $state
  Write-Log "=== auto-sync run end (no-op) ==="
  return
}

# ----- 4) Deploy with stored credential -----
if (-not (Test-Path $CredentialFile)) {
  Write-Log "Credential file missing ($CredentialFile). Run save-deploy-credential.ps1 first." "ERROR"
  Save-State $state
  return
}

try {
  $credObj = Import-Clixml -Path $CredentialFile
  $secure = $credObj.Password
  Write-Log "Deploying to VM ..."
  & (Join-Path $PSScriptRoot "deploy-to-vm.ps1") -Password $secure 2>&1 | ForEach-Object { Write-Log $_ "DEPLOY" }
  $state | Add-Member -NotePropertyName lastDeployTicks -NotePropertyValue (Get-Date).ToUniversalTime().Ticks -Force
  Write-Log "Deploy finished successfully."
} catch {
  Write-Log "Deploy failed: $_" "ERROR"
}

Save-State $state
Write-Log "=== auto-sync run end ==="
