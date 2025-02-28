import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getUserById, updateUser } from "@/services/userService"
import { cookies } from "next/headers"

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Add logging to track execution flow
    console.log("Starting PATCH request handling")

    // Await the params
    const { id } = await context.params
    console.log("Received params id:", id)

    const token = (await cookies()).get("token")?.value
    if (!token) {
      console.log("No authentication token found")
      return Response.json({ error: "Authentication required" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.userId) {
      console.log("Invalid token payload:", payload)
      return Response.json({ error: "Invalid token" }, { status: 401 })
    }

    const admin = await getUserById(payload.userId)
    console.log("Retrieved admin user:", admin?.role)
    if (!admin || admin.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 403 })
    }

    const userId = Number.parseInt(id)
    console.log("Parsed user ID:", userId)
    
    const body = await request.json()
    const { role } = body
    console.log("Requested role change:", role)

    if (!["STUDENT", "CLASS_REP", "LECTURER", "ADMIN"].includes(role)) {
      console.log("Invalid role requested:", role)
      return Response.json({ error: "Invalid role" }, { status: 400 })
    }

    const updatedUser = await updateUser(userId, { role })
    console.log("Successfully updated user:", updatedUser)
    return Response.json(updatedUser, { status: 200 })
  } catch (error) {
    console.error("Error updating user:", error)
    return Response.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
