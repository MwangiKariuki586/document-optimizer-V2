import { NextResponse } from "next/server";

import { RateLimitExceededError } from "@/lib/rate-limit/rate-limit.service";

export function rateLimitResponse(error: RateLimitExceededError) {
  return NextResponse.json(
    {
      success: false,
      error: error.message,
      data: {
        retryAfterSeconds: error.retryAfterSeconds,
        resetAt: error.resetAt,
      },
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(error.retryAfterSeconds),
        "X-RateLimit-Limit": String(error.limit),
        "X-RateLimit-Remaining": String(error.remaining),
        "X-RateLimit-Reset": error.resetAt,
      },
    },
  );
}
