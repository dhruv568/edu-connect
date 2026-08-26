import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const THUMBNAILS_DIR = path.join(process.cwd(), "storage", "thumbnails");

export async function GET(request: NextRequest, { params }: { params: { key: string } }) {
  try {
    const key = path.basename(params.key);
    const filePath = path.join(THUMBNAILS_DIR, key);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Thumbnail not found" }, { status: 404 });
    }

    const buffer = await fs.promises.readFile(filePath);
    const ext = path.extname(key).toLowerCase();
    const contentType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load thumbnail" }, { status: 500 });
  }
}
