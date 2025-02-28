import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { getUserById } from "@/services/userService"

export async function GET() {
  console.log("Starting GET /api/users request")

  try {
    const cookieStore = cookies()
    const token = (await cookieStore).get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const currentUser = await getUserById(payload.userId)
    const allowedRoles = ["ADMIN", "LECTURER", "CLASS_REP"]
   if (!currentUser || !allowedRoles.includes(currentUser.role)) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
   }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    console.log("Users fetched successfully")
    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

