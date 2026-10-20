Add-Type -AssemblyName System.Drawing

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$assetsDir = Join-Path $baseDir "assets"
if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null
}

$srcLogo = Join-Path $baseDir "..\empirecodes\empirecodes_logo.jpg"
if (-not (Test-Path $srcLogo)) {
    $srcLogo = "c:\Users\PC\Downloads\empirecodes_edit_now\empirecodes\empirecodes_logo.jpg"
}

if (-not (Test-Path $srcLogo)) {
    Write-Error "Source logo not found at $srcLogo"
    exit 1
}

Write-Host "[*] Found source logo: $srcLogo"
$srcImg = [System.Drawing.Image]::FromFile($srcLogo)

# Function to generate a padded 1024x1024 icon
function Create-EmpireIcon($outputPath, $maxContentSize) {
    $canvas = New-Object System.Drawing.Bitmap 1024, 1024
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # Void background #020202
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(2, 2, 2))
    $g.FillRectangle($brush, 0, 0, 1024, 1024)

    # Scale aspect ratio
    $scale = [Math]::Min($maxContentSize / $srcImg.Width, $maxContentSize / $srcImg.Height)
    $newW = [int]($srcImg.Width * $scale)
    $newH = [int]($srcImg.Height * $scale)
    $posX = [int]((1024 - $newW) / 2)
    $posY = [int]((1024 - $newH) / 2)

    $g.DrawImage($srcImg, $posX, $posY, $newW, $newH)
    $canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $canvas.Dispose()
    Write-Host "[OK] Generated: $outputPath"
}

# 1. Primary app icon (840px max content)
Create-EmpireIcon (Join-Path $assetsDir "icon.png") 840

# 2. Android adaptive icon (620px max content for circular/squircle safe masking)
Create-EmpireIcon (Join-Path $assetsDir "adaptive-icon.png") 620

# 3. Splash image
Create-EmpireIcon (Join-Path $assetsDir "splash.png") 620

# 4. Web Favicon 192x192
$favCanvas = New-Object System.Drawing.Bitmap 192, 192
$gFav = [System.Drawing.Graphics]::FromImage($favCanvas)
$gFav.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$favBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(2, 2, 2))
$gFav.FillRectangle($favBrush, 0, 0, 192, 192)
$scaleFav = [Math]::Min(160 / $srcImg.Width, 160 / $srcImg.Height)
$wFav = [int]($srcImg.Width * $scaleFav)
$hFav = [int]($srcImg.Height * $scaleFav)
$gFav.DrawImage($srcImg, [int]((192 - $wFav)/2), [int]((192 - $hFav)/2), $wFav, $hFav)
$favCanvas.Save((Join-Path $assetsDir "favicon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$gFav.Dispose()
$favCanvas.Dispose()
Write-Host "[OK] Generated: favicon.png"

$srcImg.Dispose()
Write-Host "`n[SUCCESS] All EmpireCodes mobile launcher & adaptive icons generated!"

