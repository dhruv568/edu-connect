using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

public class LogoProcessor {
    public static void Main(string[] args) {
        string rootDir = @"e:\educonnect_company";
        string inputOfficial = Path.Combine(rootDir, "logo for educonnect.co.in.png");

        if (!File.Exists(inputOfficial)) {
            Console.WriteLine("Error: Official logo file not found at " + inputOfficial);
            return;
        }

        GenerateAllLogosAndFavicons(rootDir, inputOfficial);
    }

    public static void GenerateAllLogosAndFavicons(string rootDir, string inputOfficialPath) {
        using (Bitmap src = new Bitmap(inputOfficialPath)) {
            int srcW = src.Width;
            int srcH = src.Height;

            // 1. Crest Mark Bounds in logo for educonnect.co.in.png
            // Crest Mark Bounds: X: 179 to 1310 (Width: 1132) Y: 17 to 790 (Height: 774)
            int markX = 179;
            int markY = 17;
            int markW = 1132;
            int markH = 774;

            // Full Logo Bounds: X: 178 to 1365 (Width: 1188) Y: 17 to 999 (Height: 983)
            int fullX = 178;
            int fullY = 17;
            int fullW = 1188;
            int fullH = 983;

            // A. Save full transparent logo (cropped to content bounds)
            string outFull = Path.Combine(rootDir, "public", "images", "logo-transparent.png");
            using (Bitmap croppedFull = new Bitmap(fullW, fullH, PixelFormat.Format32bppArgb)) {
                using (Graphics g = Graphics.FromImage(croppedFull)) {
                    SetHighQuality(g);
                    g.DrawImage(src, new Rectangle(0, 0, fullW, fullH), new Rectangle(fullX, fullY, fullW, fullH), GraphicsUnit.Pixel);
                }
                croppedFull.Save(outFull, ImageFormat.Png);
                Console.WriteLine("Saved: " + outFull);
            }

            // B. Save mark-only transparent logo
            string outMark = Path.Combine(rootDir, "public", "images", "logo-mark.png");
            using (Bitmap croppedMark = new Bitmap(markW, markH, PixelFormat.Format32bppArgb)) {
                using (Graphics g = Graphics.FromImage(croppedMark)) {
                    SetHighQuality(g);
                    g.DrawImage(src, new Rectangle(0, 0, markW, markH), new Rectangle(markX, markY, markW, markH), GraphicsUnit.Pixel);
                }
                croppedMark.Save(outMark, ImageFormat.Png);
                Console.WriteLine("Saved: " + outMark);
            }

            // C. Save 512x512 High-Res Favicon PNG (maximally scaled crest mark)
            // Target width 480px inside 512px canvas (leaving 16px side margin)
            int canvasSize = 512;
            int targetW = 480;
            int targetH = (int)Math.Round((double)markH * targetW / markW); // ~328px
            int offsetX = (canvasSize - targetW) / 2; // 16px
            int offsetY = (canvasSize - targetH) / 2; // 92px

            byte[] fav512PngBytes;

            using (Bitmap fav512 = new Bitmap(canvasSize, canvasSize, PixelFormat.Format32bppArgb)) {
                using (Graphics g = Graphics.FromImage(fav512)) {
                    SetHighQuality(g);
                    g.Clear(Color.Transparent);
                    g.DrawImage(src, new Rectangle(offsetX, offsetY, targetW, targetH), new Rectangle(markX, markY, markW, markH), GraphicsUnit.Pixel);
                }

                using (MemoryStream ms = new MemoryStream()) {
                    fav512.Save(ms, ImageFormat.Png);
                    fav512PngBytes = ms.ToArray();
                }

                // Deploy 512x512 PNGs
                SaveBytes(fav512PngBytes, Path.Combine(rootDir, "public", "images", "favicon.png"));
                SaveBytes(fav512PngBytes, Path.Combine(rootDir, "public", "favicon.png"));
                SaveBytes(fav512PngBytes, Path.Combine(rootDir, "app", "icon.png"));
                Console.WriteLine("Saved 512x512 favicons in public and app directories.");
            }

            // D. Save 180x180 Apple Touch Icon
            int appleSize = 180;
            int appleW = 168;
            int appleH = (int)Math.Round((double)markH * appleW / markW);
            int appleOx = (appleSize - appleW) / 2;
            int appleOy = (appleSize - appleH) / 2;

            using (Bitmap apple = new Bitmap(appleSize, appleSize, PixelFormat.Format32bppArgb)) {
                using (Graphics g = Graphics.FromImage(apple)) {
                    SetHighQuality(g);
                    g.Clear(Color.Transparent);
                    g.DrawImage(src, new Rectangle(appleOx, appleOy, appleW, appleH), new Rectangle(markX, markY, markW, markH), GraphicsUnit.Pixel);
                }

                using (MemoryStream ms = new MemoryStream()) {
                    apple.Save(ms, ImageFormat.Png);
                    byte[] appleBytes = ms.ToArray();
                    SaveBytes(appleBytes, Path.Combine(rootDir, "app", "apple-icon.png"));
                    SaveBytes(appleBytes, Path.Combine(rootDir, "public", "apple-icon.png"));
                    SaveBytes(appleBytes, Path.Combine(rootDir, "public", "apple-touch-icon.png"));
                    Console.WriteLine("Saved 180x180 Apple Touch Icons.");
                }
            }

            // E. Build Multi-Size ICO file (16x16, 32x32, 48x48, 64x64, 128x128, 256x256)
            int[] icoSizes = new int[] { 16, 32, 48, 64, 128, 256 };
            byte[][] pngBuffers = new byte[icoSizes.Length][];

            for (int i = 0; i < icoSizes.Length; i++) {
                int sz = icoSizes[i];
                // For small sizes (16, 32), use 98% width to maximize visibility in tight tab strips
                double fillRatio = (sz <= 32) ? 0.98 : 0.94;
                int tw = (int)Math.Round(sz * fillRatio);
                int th = (int)Math.Round((double)markH * tw / markW);
                int ox = (sz - tw) / 2;
                int oy = (sz - th) / 2;

                using (Bitmap b = new Bitmap(sz, sz, PixelFormat.Format32bppArgb)) {
                    using (Graphics g = Graphics.FromImage(b)) {
                        SetHighQuality(g);
                        g.Clear(Color.Transparent);
                        g.DrawImage(src, new Rectangle(ox, oy, tw, th), new Rectangle(markX, markY, markW, markH), GraphicsUnit.Pixel);
                    }
                    using (MemoryStream ms = new MemoryStream()) {
                        b.Save(ms, ImageFormat.Png);
                        pngBuffers[i] = ms.ToArray();
                    }
                }
            }

            byte[] icoBytes = BuildIcoFile(icoSizes, pngBuffers);
            SaveBytes(icoBytes, Path.Combine(rootDir, "public", "favicon.ico"));
            SaveBytes(icoBytes, Path.Combine(rootDir, "app", "favicon.ico"));
            Console.WriteLine("Saved multi-resolution ICO favicons in public and app directories.");

            // F. Save SVG Favicon wrapper (app/icon.svg)
            string base64Png = Convert.ToBase64String(fav512PngBytes);
            string svgContent = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" width=\"100%\" height=\"100%\">\n" +
                                "  <image href=\"data:image/png;base64," + base64Png + "\" width=\"512\" height=\"512\" preserveAspectRatio=\"xMidYMid meet\"/>\n" +
                                "</svg>";

            File.WriteAllText(Path.Combine(rootDir, "app", "icon.svg"), svgContent);
            File.WriteAllText(Path.Combine(rootDir, "public", "icon.svg"), svgContent);
            Console.WriteLine("Saved SVG Favicons in app and public directories.");
        }
    }

    private static void SetHighQuality(Graphics g) {
        g.InterpolationMode = InterpolationMode.HighQualityBicubic;
        g.SmoothingMode = SmoothingMode.HighQuality;
        g.PixelOffsetMode = PixelOffsetMode.HighQuality;
        g.CompositingQuality = CompositingQuality.HighQuality;
    }

    private static void SaveBytes(byte[] bytes, string destPath) {
        string dir = Path.GetDirectoryName(destPath);
        if (!Directory.Exists(dir)) {
            Directory.CreateDirectory(dir);
        }
        File.WriteAllBytes(destPath, bytes);
    }

    private static byte[] BuildIcoFile(int[] sizes, byte[][] pngData) {
        using (MemoryStream ms = new MemoryStream()) {
            using (BinaryWriter writer = new BinaryWriter(ms)) {
                // ICONDIR Header
                writer.Write((short)0); // Reserved
                writer.Write((short)1); // Image type: 1 = ICO
                writer.Write((short)sizes.Length); // Number of images

                int offset = 6 + (16 * sizes.Length);

                for (int i = 0; i < sizes.Length; i++) {
                    int size = sizes[i];
                    writer.Write((byte)(size >= 256 ? 0 : size)); // Width
                    writer.Write((byte)(size >= 256 ? 0 : size)); // Height
                    writer.Write((byte)0); // Color count
                    writer.Write((byte)0); // Reserved
                    writer.Write((short)1); // Color planes
                    writer.Write((short)32); // Bits per pixel
                    writer.Write((int)pngData[i].Length); // Image size in bytes
                    writer.Write((int)offset); // Image offset

                    offset += pngData[i].Length;
                }

                for (int i = 0; i < sizes.Length; i++) {
                    writer.Write(pngData[i]);
                }
            }
            return ms.ToArray();
        }
    }
}
