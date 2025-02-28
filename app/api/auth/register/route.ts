import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import prisma from "@/lib/prisma"
import { sendEmail } from "@/lib/emailService"
import type { UserRole } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const { name, email, password, role, department } = await req.json()
    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as UserRole,
        department,
      },
    })

    await sendEmail(
      email,
      "Welcome to Room Booking System",
      `<h1>Welcome ${name}!</h1><p>Your account has been created successfully as a ${role.toLowerCase()}.</p>`,
    )

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}

