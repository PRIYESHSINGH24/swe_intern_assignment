import { NextResponse } from "next/server";

// ─── Types ─────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Helpers ───────────────────────────────────────────────────────

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccessResponse<T>>(
    { success: true, data },
    { status }
  );
}

export function paginatedResponse<T>(
  data: T,
  meta: PaginationMeta,
  status = 200
) {
  return NextResponse.json<ApiSuccessResponse<T>>(
    { success: true, data, meta },
    { status }
  );
}

export function errorResponse(
  code: string,
  message: string,
  status = 400,
  details?: Record<string, string[]>
) {
  return NextResponse.json<ApiErrorResponse>(
    {
      success: false,
      error: { code, message, ...(details && { details }) },
    },
    { status }
  );
}

// ─── Common Error Responses ────────────────────────────────────────

export function notFoundResponse(resource: string, identifier?: string) {
  const message = identifier
    ? `${resource} with identifier '${identifier}' was not found`
    : `${resource} not found`;
  return errorResponse("NOT_FOUND", message, 404);
}

export function validationErrorResponse(details: Record<string, string[]>) {
  return errorResponse(
    "VALIDATION_ERROR",
    "Request validation failed",
    400,
    details
  );
}

export function internalErrorResponse(message = "An unexpected error occurred") {
  return errorResponse("INTERNAL_ERROR", message, 500);
}
