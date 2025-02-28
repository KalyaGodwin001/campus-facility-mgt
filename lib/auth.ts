import { randomBytes } from "crypto"
import * as jose from "jose"
import { cookies } from "next/headers"

export interface JWTPayload {
  userId: number
  email: string
  role: string
  iat?: number
  exp?: number
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  if (!token) return null

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    if (typeof payload.userId === 'number' && 
        typeof payload.email === 'string' && 
        typeof payload.role === 'string') {
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        iat: payload.iat,
        exp: payload.exp
      }
    }
    return null
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get("token")?.value
}

export function generateTemporaryPassword(length = 10): string {
  return randomBytes(length).toString("hex").slice(0, length)
}


export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getAuthToken()
  if (!token) return null
  return verifyToken(token)
}

