export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-response";

export async function GET() {
  try {
    // Check if admin has configured any custom training details in PlatformConfig
    const configs = await prisma.platformConfig.findMany({
      where: {
        key: {
          in: [
            "teacher_training_batch_date",
            "teacher_training_seats",
            "teacher_training_price",
            "teacher_training_active",
          ],
        },
      },
    });

    const configMap = new Map(configs.map((c) => [c.key, c.value]));

    const customBatchDate = configMap.get("teacher_training_batch_date") || null;
    const customSeats = configMap.get("teacher_training_seats") || null;
    const customPriceStr = configMap.get("teacher_training_price");
    const customPrice = customPriceStr ? parseFloat(customPriceStr) : 0;
    const isActive = configMap.get("teacher_training_active") !== "false";

    return apiSuccess({
      programName: "15-Day Teachers Training Program",
      durationDays: 15,
      // If not in database, do not invent them: fallback to exact required copy
      batchDate: customBatchDate || "Next Batch Starting Soon",
      hasExplicitBatchDate: Boolean(customBatchDate),
      seatsNotice: customSeats || "Seats for the upcoming batch are limited.",
      hasExplicitSeats: Boolean(customSeats),
      price: customPrice > 0 ? customPrice : 0,
      requiresPayment: customPrice > 0,
      currency: "INR",
      isActive,
    });
  } catch (error: any) {
    // Graceful fallback with standard program data
    return apiSuccess({
      programName: "15-Day Teachers Training Program",
      durationDays: 15,
      batchDate: "Next Batch Starting Soon",
      hasExplicitBatchDate: false,
      seatsNotice: "Seats for the upcoming batch are limited.",
      hasExplicitSeats: false,
      price: 0,
      requiresPayment: false,
      currency: "INR",
      isActive: true,
    });
  }
}
