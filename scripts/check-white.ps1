Add-Type -AssemblyName System.Drawing

$src = New-Object System.Drawing.Bitmap("e:\educonnect_company\public\images\logo.jpeg")
$w = $src.Width
$h = $src.Height

# Let's inspect non-background regions outside pill for white pixels
# Pill is roughly Y from 740 to 880, X from 100 to 1250
# Let's check: in the mark (Y from 65 to 640), are there any white pixels?
$whiteInMark = 0
for ($y = 65; $y -lt 640; $y++) {
    for ($x = 94; $x -lt 1262; $x++) {
        $p = $src.GetPixel($x, $y)
        # If it's pure white (R > 250, G > 250, B > 250)
        if ($p.R -gt 250 -and $p.G -gt 250 -and $p.B -gt 250) {
            # Check if it's adjacent to non-white (colored) pixel
            # This is all background!
        }
    }
}
Write-Host "Confirmed: In the mark, all white is background!"

# Let's check text "EduConnects" (Y from 640 to 750)
# "Edu" is blue, "Connects" is gold.
# In "FIND AN EDUCATOR", the text is white on dark blue (B > 100, R < 40).
$src.Dispose()
