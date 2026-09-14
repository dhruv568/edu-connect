Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Bitmap]::FromFile("e:\educonnect_company\public\images\logo.jpeg")
Write-Host "Width: $($src.Width), Height: $($src.Height)"

# Check corners
Write-Host "Top-Left (0,0):" ($src.GetPixel(0, 0))
Write-Host "Top-Right ($($src.Width-1),0):" ($src.GetPixel($src.Width-1, 0))
Write-Host "Bottom-Left (0,$($src.Height-1)):" ($src.GetPixel(0, $src.Height-1))
Write-Host "Bottom-Right ($($src.Width-1),$($src.Height-1)):" ($src.GetPixel($src.Width-1, $src.Height-1))

$src.Dispose()
