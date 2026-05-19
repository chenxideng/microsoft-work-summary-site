# Microsoft Work Summary Site

A Microsoft-style work summary website for PMX project highlights, activities, and roadmap.

## Local Run

```powershell
npm install
npm start
```

Open http://localhost:8080

## Update Website Content

Edit only `content.json` to update:
- Header and nav labels
- Overview copy and key metrics
- PMX project cards
- Activity timeline
- Next phase roadmap

No HTML edits are needed for regular content updates.

## One-Command Deploy To Azure VM

```powershell
.\deploy-to-vm.ps1 -Password "<vm-password>"
```

This uploads the latest files to `/home/charles/microsoft-workspace`, installs dependencies if needed, and restarts the `microsoft-workspace.service` process.

## Push to GitHub

1. Create an empty repository on GitHub, for example: `microsoft-work-summary-site`
2. In this folder, run:

```powershell
git branch -M main
git remote add origin https://github.com/<your-github-id>/microsoft-work-summary-site.git
git push -u origin main
```

If prompted, complete GitHub authentication in the popup/device flow.

## Deploy to Azure App Service

Use the prepared script:

```powershell
.\deploy-azure.ps1 -ResourceGroup <your-rg> -AppName <your-unique-app-name>
```

Prerequisites:
- You must have at least Contributor permission on the target Resource Group.
- The app name must be globally unique for `azurewebsites.net`.

After deployment, site URL:

```text
https://<your-unique-app-name>.azurewebsites.net
```
