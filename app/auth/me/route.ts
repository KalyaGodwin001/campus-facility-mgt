import { type NextRequest, NextResponse } from "next/server"
import { getUserById } from "@/services/userService"
import { verifyToken } from "@/lib/auth"

export const GET = async (request: NextRequest) => {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = payload.userId

    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

