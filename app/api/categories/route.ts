/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getUserById } from "@/services/userService"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const dynamic = "force-dynamic"


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeRoomCount = searchParams.get("includeRoomCount") === "true"

    let categories
    if (includeRoomCount) {
      categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { rooms: true },
          },
        },
      })
      categories = categories.map((category) => ({
        ...category,
        roomCount: category._count.rooms,
      }))
    } else {
      categories = await prisma.category.findMany()
    }

    return Response.json({ status: 200, data: categories })
  } catch (error) {
    console.error("Get categories error:", error)
    return Response.json({ status: 500, error: "An error occurred while fetching categories" })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return Response.json({ error: "No token provided" }, { status: 401 })
    }

    const payload = await verifyToken(token)

    if (!payload || !payload.userId) {
      return Response.json({ error: "Invalid token payload" }, { status: 401 })
    }

    const user = await getUserById(payload.userId)

    if (!user || user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden: Only admins can create categories" }, { status: 403 })
    }

    const formData = await request.formData()
    const name = formData.get("name") as string
    const image = formData.get("image") as File

    if (!name) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    let imageUrl = null
    if (image) {
      const arrayBuffer = await image.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const result: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "room-booking" }, (error, result) => {
            if (error) reject(error)
            else resolve(result)
          })
          .end(buffer)
      })

      imageUrl = result.secure_url
    }

    const category = await prisma.category.create({
      data: {
        name,
        imageUrl,
      },
    })

    return Response.json({ category }, { status: 201 })
  } catch (error) {
    console.error("Create category error:", error)
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500 })
    }
    return Response.json({ error: "An unexpected error occurred while creating the category" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return Response.json({ error: "No token provided" }, { status: 401 })
    }

    const payload = await verifyToken(token)

    if (!payload || !payload.userId) {
      return Response.json({ error: "Invalid token payload" }, { status: 401 })
    }

    const user = await getUserById(payload.userId)

    if (!user || user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden: Only admins can update categories" }, { status: 403 })
    }

    const formData = await request.formData()
    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const image = formData.get("image") as File | null

    if (!id) {
      return Response.json({ error: "Missing category ID" }, { status: 400 })
    }

    let imageUrl = null
    if (image) {
      const arrayBuffer = await image.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const result: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "room-booking" }, (error, result) => {
            if (error) reject(error)
            else resolve(result)
          })
          .end(buffer)
      })

      imageUrl = result.secure_url
    }

    const updatedCategory = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        name,
        imageUrl: imageUrl || undefined,
      },
    })

    if (!updatedCategory) {
      return Response.json({ error: "Category not found" }, { status: 404 })
    }

    return Response.json({ category: updatedCategory }, { status: 200 })
  } catch (error) {
    console.error("Update category error:", error)
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500 })
    }
    return Response.json({ error: "An unexpected error occurred while updating the category" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return Response.json({ error: "No token provided" }, { status: 401 })
    }

    const payload = await verifyToken(token)

    if (!payload || !payload.userId) {
      return Response.json({ error: "Invalid token payload" }, { status: 401 })
    }

    const user = await getUserById(payload.userId)

    if (!user || user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden: Only admins can delete categories" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return Response.json({ error: "Missing category ID" }, { status: 400 })
    }

    const deletedCategory = await prisma.category.delete({
      where: { id: Number(id) },
    })

    if (!deletedCategory) {
      return Response.json({ error: "Category not found" }, { status: 404 })
    }

    return Response.json({ message: "Category deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Delete category error:", error)
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500 })
    }
    return Response.json({ error: "An unexpected error occurred while deleting the category" }, { status: 500 })
  }
}

