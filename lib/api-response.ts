import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/auth";

export function apiSuccess<T>(data: T, message?: string, status = 200) {
  const body: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  return NextResponse.json(body, { status });
}

export function apiError(error: string, status = 400) {
  const body: ApiResponse = {
    success: false,
    error,
  };
  return NextResponse.json(body, { status });
}

export function apiUnauthorized(error = "Unauthorized access", status = 401) {
  return apiError(error, status);
}

export function apiForbidden(error = "Forbidden: Insufficient role permissions", status = 403) {
  return apiError(error, status);
}

export function apiBadRequest(error = "Invalid request payload", status = 400) {
  return apiError(error, status);
}
