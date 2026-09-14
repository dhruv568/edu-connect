$code = Get-Content -Raw -Path "e:\educonnect_company\scripts\LogoProcessor.cs"
Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

$input = "e:\educonnect_company\public\images\logo.jpeg"
$outFull = "e:\educonnect_company\public\images\logo-transparent.png"
$outMark = "e:\educonnect_company\public\images\logo-mark.png"
$outFav = "e:\educonnect_company\public\images\favicon.png"

[LogoProcessor]::GenerateLogos($input, $outFull, $outMark, $outFav)

# Also copy favicon to public and app
Copy-Item -Force "e:\educonnect_company\public\images\favicon.png" "e:\educonnect_company\public\favicon.ico"
Copy-Item -Force "e:\educonnect_company\public\images\favicon.png" "e:\educonnect_company\app\icon.png"
Write-Host "Favicons deployed successfully!"
