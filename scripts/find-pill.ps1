Add-Type -AssemblyName System.Drawing

$src = New-Object System.Drawing.Bitmap("e:\educonnect_company\public\images\logo.jpeg")
# In the pill, the background of the pill is dark blue (R < 30, G < 60, B > 80)
$pillMinX = $src.Width; $pillMaxX = 0; $pillMinY = $src.Height; $pillMaxY = 0

for ($y = 700; $y -lt 1100; $y++) {
    for ($x = 100; $x -lt 1260; $x++) {
        $p = $src.GetPixel($x, $y)
        # Deep blue pill color: B > 80, R < 40, G < 70
        if ($p.B -gt 80 -and $p.R -lt 40 -and $p.G -lt 70) {
            if ($x -lt $pillMinX) { $pillMinX = $x }
            if ($x -gt $pillMaxX) { $pillMaxX = $x }
            if ($y -lt $pillMinY) { $pillMinY = $y }
            if ($y -gt $pillMaxY) { $pillMaxY = $y }
        }
    }
}

Write-Host "Pill Bounds: X: $pillMinX to $pillMaxX, Y: $pillMinY to $pillMaxY"

# Let's also check the symbol mark bounds (the EC + cap + book, above the text EduConnects)
# The text "EduConnects" starts around what Y?
# Let's check text EduConnects around Y = 650-800
$eduMinY = $src.Height
for ($y = 650; $y -lt 850; $y++) {
    for ($x = 90; $x -lt 400; $x++) {
        $p = $src.GetPixel($x, $y)
        # "Edu" is dark blue: R < 30, G < 60, B > 70
        if ($p.B -gt 70 -and $p.R -lt 30) {
            if ($y -lt $eduMinY) { $eduMinY = $y }
        }
    }
}
Write-Host "EduConnects Wordmark starts at Y: $eduMinY"

$src.Dispose()
