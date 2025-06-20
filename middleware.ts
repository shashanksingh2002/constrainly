import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

/**
 * Lightweight middleware for the preview sandbox.
 * In production you can re-enable NextAuth protection,
 * but next-lite doesn’t bundle `next-auth/middleware`.
 */
export function middleware(_req: NextRequest) {
  // You can add custom logic here if needed.
  return NextResponse.next()
}

/**
 * Optional: limit middleware to the same routes as before.
 * Modify or leave empty depending on your needs.
 */
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|auth/signin).*)"],
}
