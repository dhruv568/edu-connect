import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { LmsService } from "@/services/lms-service";
import { getSession } from "@/lib/auth/session";

const VIDEOS_DIR = path.join(process.cwd(), "storage", "videos");

export async function GET(request: NextRequest, { params }: { params: { assetId: string } }) {
  try {
    const assetId = path.basename(params.assetId);

    // Verify user & enrollment authorization
    const session = await getSession();
    const access = await LmsService.verifyVideoAccess(session?.userId || null, assetId);

    if (!access.allowed) {
      return NextResponse.json({ error: access.error || "Unauthorized access to video" }, { status: 403 });
    }

    const filePath = path.join(VIDEOS_DIR, assetId);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Video file not found" }, { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = request.headers.get("range");

    const ext = path.extname(assetId).toLowerCase();
    const contentType = ext === ".webm" ? "video/webm" : ext === ".mov" ? "video/quicktime" : "video/mp4";

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        return new NextResponse("Requested range not satisfiable", {
          status: 416,
          headers: { "Content-Range": `bytes */${fileSize}` },
        });
      }

      const chunksize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on("data", (chunk) => controller.enqueue(chunk));
          fileStream.on("end", () => controller.close());
          fileStream.on("error", (err) => controller.error(err));
        },
      });

      return new NextResponse(stream as any, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize.toString(),
          "Content-Type": contentType,
        },
      });
    } else {
      const fileStream = fs.createReadStream(filePath);
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on("data", (chunk) => controller.enqueue(chunk));
          fileStream.on("end", () => controller.close());
          fileStream.on("error", (err) => controller.error(err));
        },
      });

      return new NextResponse(stream as any, {
        status: 200,
        headers: {
          "Content-Length": fileSize.toString(),
          "Content-Type": contentType,
          "Accept-Ranges": "bytes",
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to stream video" }, { status: 500 });
  }
}
