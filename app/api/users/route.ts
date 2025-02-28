import { type NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { name, email, role, password } = await request.json()

    // Validate input
    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Hash the provided temporary password
    const hashedPassword = await hash(password, 10)

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
      },
    })

    return NextResponse.json(
      {
        user: { ...user, password: undefined },
        temporaryPassword: password,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

