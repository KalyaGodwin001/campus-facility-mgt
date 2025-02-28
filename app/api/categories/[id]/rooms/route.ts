import {  NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const id = Number.parseInt((await props.params).id)
    const { searchParams } = new URL(req.url)
    const includeRooms = searchParams.get("includeRooms") === "true"

    if (isNaN(id)) {
      return NextResponse.json({ status: 400, error: "Invalid category ID" })
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: includeRooms
        ? {
            rooms: true,
          }
        : undefined,
    })

    if (!category) {
      return NextResponse.json({ status: 404, error: "Category not found" })
    }

    return NextResponse.json({ status: 200, data: category })
  } catch (error) {
    console.error("Get category error:", error)
    return NextResponse.json({ status: 500, error: "An error occurred while fetching the category" })
  }
}

