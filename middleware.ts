import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import * as jose from "jose"

async function verifyAuth(token: string) {
  if (!token) return null

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    return payload
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow public assets and API routes to pass through
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next()
  }

  const token = request.cookies.get("token")?.value

  // Handle authentication routes
  if (pathname.startsWith("/auth")) {
    if (token) {
      const payload = await verifyAuth(token)
      if (payload) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
    return NextResponse.next()
  }

  // Handle protected routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    const payload = await verifyAuth(token)
    if (!payload) {
      const response = NextResponse.redirect(new URL("/auth/login", request.url))
      response.cookies.delete("token")
      return response
    }

    return NextResponse.next()
  }

  // Allow all other routes
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

