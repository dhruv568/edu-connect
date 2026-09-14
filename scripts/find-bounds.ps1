Add-Type -AssemblyName System.Drawing

$src = New-Object System.Drawing.Bitmap("e:\educonnect_company\public\images\logo.jpeg")
$w = $src.Width
$h = $src.Height

$minX = $w; $maxX = 0; $minY = $h; $maxY = 0

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $p = $src.GetPixel($x, $y)
        if ($p.R -lt 240 -or $p.G -lt 240 -or $p.B -lt 240) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Overall Content Bounds: X: $minX to $maxX, Y: $minY to $maxY (Width: $($maxX - $minX + 1), Height: $($maxY - $minY + 1))"

# Check horizontal density to find the gap between the symbol mark and "EduConnects" wordmark
$markMaxY = 0
for ($y = $minY; $y -lt 800; $y++) {
    $nonBgCount = 0
    for ($x = $minX; $x -le $maxX; $x++) {
        $p = $src.GetPixel($x, $y)
        if ($p.R -lt 240 -or $p.G -lt 240 -or $p.B -lt 240) {
            $nonBgCount++
        }
    }
    # If there's a gap between mark and EduConnects
    if ($y -gt 650 -and $y -lt 730 -and $nonBgCount -eq 0) {
        Write-Host "Gap found at Y = $y (empty line)"
    }
}

$src.Dispose()
