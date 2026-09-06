import { NextResponse } from "next/server";

export function jsonError(message: string, status = 500) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

export function unauthorizedResponse() {
  return jsonError("Not authorized. Please log in.", 401);
}

export function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !value) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}
