import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { verifyToken } from "@/lib/auth"
import { deleteUserData } from "@/lib/user"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { name: true, email: true, role: true, department: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { name, department } = await req.json()

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: { name, department },
      select: { name: true, email: true, role: true, department: true },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")
  
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  
    try {
      const decoded = await verifyToken(token)
      if (!decoded) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
  
      const { userId } = decoded
  
      const deletionSteps = await deleteUserData(userId)
  
      const response = NextResponse.json({ message: "Account deleted successfully", steps: deletionSteps })
      response.cookies.set("token", "", { maxAge: 0 })
  
      return response
    } catch (error) {
      console.error("Error deleting user account:", error)
      return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
    }
  }

