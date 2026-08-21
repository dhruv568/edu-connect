import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiUnauthorized } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return apiUnauthorized("No active session.");
  }
  return apiSuccess({ user: session });
}
