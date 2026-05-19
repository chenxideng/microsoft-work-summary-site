# 一键同步 PMX workbook 并自动部署
$src = "C:\Users\chenxideng\Documents\pmx-tool\output\pmx-my-work.html"
$dst = "C:\Users\chenxideng\Documents\microsoft-work-summary-site\pmx-workbook.html"
if (Test-Path $src) {
    Copy-Item $src $dst -Force
    Write-Host "已同步最新 PMX workbook 到网站目录。"
    Set-Location "C:\Users\chenxideng\Documents\microsoft-work-summary-site"
    git add pmx-workbook.html
    git commit -m "chore: sync latest PMX workbook"
    git push
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    powershell ./deploy-to-vm.ps1
    Write-Host "已自动部署到 Azure VM。"
} else {
    Write-Host "未找到 PMX workbook 源文件：$src"
}