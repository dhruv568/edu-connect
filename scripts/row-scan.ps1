Add-Type -AssemblyName System.Drawing

$src = New-Object System.Drawing.Bitmap("e:\educonnect_company\public\images\logo.jpeg")
for ($y = 600; $y -lt 1150; $y += 10) {
    $nonWhite = 0
    $blueCount = 0
    $whiteInsideCount = 0
    for ($x = 0; $x -lt $src.Width; $x++) {
        $p = $src.GetPixel($x, $y)
        if ($p.R -lt 240 -or $p.G -lt 240 -or $p.B -lt 240) {
            $nonWhite++
            if ($p.B -gt 100 -and $p.R -lt 50) { $blueCount++ }
        }
    }
    if ($nonWhite -gt 0) {
        Write-Host "Y=$y : nonWhite=$nonWhite, darkBlue=$blueCount"
    }
}
$src.Dispose()
