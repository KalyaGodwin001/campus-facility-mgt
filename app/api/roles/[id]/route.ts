import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { getUserById } from "@/services/userService"
import { z } from "zod"

export async function PATCH( req: Request, props: { params: Promise<{ id: string }> }) {
    console.log("Starting PATCH /api/roles/[id] request")

    const id =  parseInt((await props.params).id);
    console.log("ID:", id);

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

    const userId = id
    if (isNaN(userId)) {
      console.log("Invalid user ID format")
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    const body = await req.json()
    console.log("Request body:", body)

    const updateSchema = z.object({
      role: z.enum(["STUDENT", "CLASS_REP", "LECTURER", "ADMIN"]),
    })

    const { role } = updateSchema.parse(body)

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    console.log("User updated successfully")
    return NextResponse.json(updatedUser, { status: 200 })
  } catch (error) {
    console.error("Error updating user:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

