$code = Get-Content -Raw -Path "e:\educonnect_company\scripts\LogoProcessor.cs"
Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

[LogoProcessor]::Main(@())
Write-Host "Favicons and EduConnects logos processed and deployed successfully!"
