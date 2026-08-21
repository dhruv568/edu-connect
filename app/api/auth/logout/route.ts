export const dynamic = "force-dynamic";

import { clearSessionCookie } from "@/lib/auth/session";
import { apiSuccess } from "@/lib/api-response";

export async function POST() {
  await clearSessionCookie();
  return apiSuccess({ success: true }, "Logged out successfully.");
}
