Add-Type -AssemblyName System.Drawing

$src = New-Object System.Drawing.Bitmap("e:\educonnect_company\public\images\logo.jpeg")
$minX = 2000; $maxX = 0; $minY = 2000; $maxY = 0

for ($y = 700; $y -lt 1000; $y++) {
    for ($x = 50; $x -lt 1300; $x++) {
        $p = $src.GetPixel($x, $y)
        # Deep blue of the pill background: B > 80, R < 35, G < 60
        if ($p.B -gt 80 -and $p.R -lt 35 -and $p.G -lt 60) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Exact Pill Dark Blue Interior: X: $minX to $maxX, Y: $minY to $maxY"
$src.Dispose()
