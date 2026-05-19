param(
  [Parameter(Mandatory = $true)]
  [string]$ResourceGroup,

  [Parameter(Mandatory = $true)]
  [string]$AppName,

  [string]$Location = "eastasia",
  [string]$PlanName = "asp-ms-work-summary",
  [string]$Sku = "B1"
)

$ErrorActionPreference = "Stop"

Write-Host "Checking Azure login status..."
az account show | Out-Null

Write-Host "Ensuring resource group exists..."
$rgExists = az group exists --name $ResourceGroup
if ($rgExists -eq "false") {
  az group create --name $ResourceGroup --location $Location | Out-Null
}

Write-Host "Ensuring App Service plan exists..."
$planLookup = az appservice plan list --resource-group $ResourceGroup --query "[?name=='$PlanName'].name" -o tsv
if (-not $planLookup) {
  az appservice plan create --name $PlanName --resource-group $ResourceGroup --location $Location --sku $Sku --is-linux | Out-Null
}

Write-Host "Ensuring web app exists..."
$appLookup = az webapp list --resource-group $ResourceGroup --query "[?name=='$AppName'].name" -o tsv
if (-not $appLookup) {
  az webapp create --name $AppName --resource-group $ResourceGroup --plan $PlanName --runtime "NODE|22-lts" | Out-Null
}

Write-Host "Deploying source code..."
az webapp up --name $AppName --resource-group $ResourceGroup --location $Location --runtime "NODE:22-lts" --sku $Sku

$url = "https://$AppName.azurewebsites.net"
Write-Host "Deployment complete: $url"
