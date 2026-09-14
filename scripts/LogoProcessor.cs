using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public class LogoProcessor {
    public static void GenerateLogos(string inputPath, string outputFull, string outputMark, string outputFavicon) {
        using (Bitmap src = new Bitmap(inputPath)) {
            int w = src.Width;
            int h = src.Height;

            Bitmap dst = new Bitmap(w, h, PixelFormat.Format32bppArgb);

            BitmapData srcData = src.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            BitmapData dstData = dst.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);

            int stride = srcData.Stride;
            byte[] srcBytes = new byte[stride * h];
            byte[] dstBytes = new byte[stride * h];

            Marshal.Copy(srcData.Scan0, srcBytes, 0, srcBytes.Length);
            src.UnlockBits(srcData);

            Array.Copy(srcBytes, dstBytes, srcBytes.Length);

            // The blue pill is located around X: 97 to 1225, Y: 875 to 1015
            // Inside the blue pill, the text "FIND AN EDUCATOR" is white and MUST remain 100% opaque.
            // Outside the pill, all white/near-white pixels are background and should become transparent.

            for (int y = 0; y < h; y++) {
                for (int x = 0; x < w; x++) {
                    int idx = y * stride + x * 4;
                    byte b = srcBytes[idx];
                    byte g = srcBytes[idx + 1];
                    byte r = srcBytes[idx + 2];

                    bool isInsidePill = (x >= 95 && x <= 1225 && y >= 875 && y <= 1015);

                    if (isInsidePill) {
                        // Check if this pixel is inside the dark blue pill body or on the white text
                        // Dark blue or white text stays opaque
                        dstBytes[idx + 3] = 255;
                    } else {
                        // Background detection with smooth edge antialiasing
                        int minChannel = Math.Min(r, Math.Min(g, b));
                        int maxDiff = Math.Max(255 - r, Math.Max(255 - g, 255 - b));

                        if (maxDiff <= 12) {
                            // Pure white background -> fully transparent
                            dstBytes[idx + 3] = 0;
                        } else if (maxDiff <= 45 && minChannel >= 210) {
                            // Edge antialiasing against white
                            float alpha = (float)(maxDiff - 12) / 33f;
                            dstBytes[idx + 3] = (byte)(alpha * 255);
                        } else {
                            dstBytes[idx + 3] = 255;
                        }
                    }
                }
            }

            Marshal.Copy(dstBytes, 0, dstData.Scan0, dstBytes.Length);
            dst.UnlockBits(dstData);

            // 1. Save full transparent logo (cropped cleanly to content bounds)
            // Bounds: X from 90 to 1265, Y from 60 to 1130
            int fullX = 85;
            int fullY = 55;
            int fullW = 1185;
            int fullH = 1080;

            using (Bitmap croppedFull = new Bitmap(fullW, fullH, PixelFormat.Format32bppArgb)) {
                using (Graphics g = Graphics.FromImage(croppedFull)) {
                    g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                    g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
                    g.DrawImage(dst, new Rectangle(0, 0, fullW, fullH), new Rectangle(fullX, fullY, fullW, fullH), GraphicsUnit.Pixel);
                }
                croppedFull.Save(outputFull, ImageFormat.Png);
                Console.WriteLine("Saved full transparent logo: " + outputFull);
            }

            // 2. Save mark-only logo (EC monogram + cap + central book)
            // Bounds: X from 90 to 1265, Y from 55 to 680
            int markX = 85;
            int markY = 55;
            int markW = 1185;
            int markH = 635;

            using (Bitmap mark = new Bitmap(markW, markH, PixelFormat.Format32bppArgb)) {
                using (Graphics g = Graphics.FromImage(mark)) {
                    g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                    g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
                    g.DrawImage(dst, new Rectangle(0, 0, markW, markH), new Rectangle(markX, markY, markW, markH), GraphicsUnit.Pixel);
                }
                mark.Save(outputMark, ImageFormat.Png);
                Console.WriteLine("Saved mark-only logo: " + outputMark);
            }

            // 3. Save square icon for favicon / app icon (e.g. 512x512)
            using (Bitmap fav = new Bitmap(512, 512, PixelFormat.Format32bppArgb)) {
                using (Graphics g = Graphics.FromImage(fav)) {
                    g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                    g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
                    // Fit mark centered in 512x512 with 32px padding
                    int targetW = 448;
                    int targetH = (int)((float)markH * targetW / markW);
                    int offsetY = (512 - targetH) / 2;
                    g.DrawImage(dst, new Rectangle(32, offsetY, targetW, targetH), new Rectangle(markX, markY, markW, markH), GraphicsUnit.Pixel);
                }
                fav.Save(outputFavicon, ImageFormat.Png);
                Console.WriteLine("Saved favicon icon: " + outputFavicon);
            }

            dst.Dispose();
        }
    }
}
