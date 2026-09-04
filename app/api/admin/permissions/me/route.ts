import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { apiError, apiSuccess, apiUnauthorized } from "@/lib/api-response";
import { getUserAuthorization, getDynamicNavigation } from "@/lib/permissions/permission-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return apiUnauthorized("No active session.");
    }

    const userId = session.userId || session.id;
    const auth = await getUserAuthorization(userId);

    if (!auth.authorized) {
      return apiError(
        auth.reason === "ACCOUNT_INACTIVE"
          ? "Your account has been deactivated or suspended."
          : "Access forbidden.",
        403
      );
    }

    const navigation = getDynamicNavigation(auth);

    return apiSuccess({
      authorized: auth.authorized,
      isSuperAdmin: auth.isSuperAdmin,
      userId: auth.userId,
      email: auth.email,
      role: auth.role,
      roleId: auth.roleId,
      roleName: auth.roleName,
      status: auth.status,
      features: auth.features,
      permissions: auth.permissions,
      navigation,
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to load permissions.", 500);
  }
}
