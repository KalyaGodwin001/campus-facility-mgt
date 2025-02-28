/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextRequest } from "next/server"
import { getAllRooms, createRoom, updateRoom } from "@/services/roomService"
import { verifyToken } from "@/lib/auth"
import { getUserById } from "@/services/userService"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const rooms = await getAllRooms()
    const enhancedRooms = await Promise.all(
      rooms.map(async (room) => {
        const currentBooking = await prisma.booking.findFirst({
          where: {
            roomId: room.id,
            status: "approved",
            startTime: { lte: new Date() },
            endTime: { gte: new Date() },
          },
        })

        const upcomingMaintenance = await prisma.maintenance.findFirst({
          where: {
            roomId: room.id,
            status: "scheduled",
            startDate: { gte: new Date() },
          },
          orderBy: { startDate: "asc" },
        })

        const category = await prisma.category.findUnique({
          where: { id: room.categoryId },
        })

        return {
          ...room,
          currentBooking,
          upcomingMaintenance,
          categoryId: category?.id,
        }
      }),
    )

    return Response.json({ status: 200, data: enhancedRooms })
  } catch (error) {
    console.error("Get rooms error:", error)
    return Response.json({ status: 500, error: "An error occurred while fetching rooms" })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = (await cookieStore).get("token")?.value

    if (!token) {
      return Response.json({ error: "No token provided" }, { status: 401 })
    }

    const payload = await verifyToken(token)

    if (!payload || !payload.userId) {
      return Response.json({ error: "Invalid token payload" }, { status: 401 })
    }

    const user = await getUserById(payload.userId)

    if (!user || user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden: Only admins can create rooms" }, { status: 403 })
    }

    const body = await request.json()
    const { name, capacity, features, floor, building, imageUrl, status, categoryId } = body

    if (!name || !capacity || !floor || !building || !status || !categoryId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const featuresArray = features ? (typeof features === "string" ? [features] : features) : []

    const room = await createRoom({
      name,
      capacity,
      features: featuresArray,
      floor,
      building,
      status,
      imageUrl,
      categoryId:categoryId
    })

    return Response.json({ room }, { status: 201 })
  } catch (error) {
    console.error("Create room error:", error)
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500 })
    }
    return Response.json({ error: "An unexpected error occurred while creating the room" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = (await cookieStore).get("token")?.value

    if (!token) {
      return Response.json({ error: "No token provided" }, { status: 401 })
    }

    const payload = await verifyToken(token)

    if (!payload || !payload.userId) {
      return Response.json({ error: "Invalid token payload" }, { status: 401 })
    }

    const user = await getUserById(payload.userId)

    if (!user || (user.role !== "ADMIN" && user.role !== "LECTURER" && user.role !== "CLASS_REP")) {
      return Response.json(
        { error: "Forbidden: Only admins, class reps and lecturers can update rooms" },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return Response.json({ error: "Missing room ID" }, { status: 400 })
    }

    // Ensure only allowed fields are updated
    const allowedFields = ["name", "capacity", "status", "imageUrl", "features", "floor", "building", "categoryId"]
    const filteredUpdateData = Object.keys(updateData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj: { [key: string]: any }, key) => {
        obj[key] = updateData[key]
        return obj
      }, {})

    const updatedRoom = await updateRoom(id, filteredUpdateData)

    if (!updatedRoom) {
      return Response.json({ error: "Room not found" }, { status: 404 })
    }

    return Response.json({ room: updatedRoom }, { status: 200 })
  } catch (error) {
    console.error("Update room error:", error)
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500 })
    }
    return Response.json({ error: "An unexpected error occurred while updating the room" }, { status: 500 })
  }
}

