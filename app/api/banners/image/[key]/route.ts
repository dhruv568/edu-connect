import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getBannerFilePath } from "@/lib/banners/banner-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const filePath = getBannerFilePath(params.key);

    if (!filePath || !fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Banner image not found" },
        { status: 404 }
      );
    }

    const buffer = await fs.promises.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
        ? "image/webp"
        : ext === ".svg"
        ? "image/svg+xml"
        : ext === ".gif"
        ? "image/gif"
        : "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load banner image" },
      { status: 500 }
    );
  }
}
