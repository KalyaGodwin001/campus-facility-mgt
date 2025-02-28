import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { RoomStatus } from "@prisma/client"
import { z } from "zod"

// GET /api/rooms/[id]
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const roomId = Number.parseInt((await props.params).id)

    if (isNaN(roomId)) {
      return NextResponse.json({
        message: "Invalid room ID",
        status: 400,
        error: "Room ID must be a number",
      })
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        bookings: {
          where: {
            endTime: {
              gte: new Date(),
            },
          },
          orderBy: {
            startTime: "asc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        maintenance: {
          where: {
            endDate: {
              gte: new Date(),
            },
            status: {
              in: ["scheduled", "in-progress"],
            },
          },
          orderBy: {
            startDate: "asc",
          },
        },
      },
    })

    if (!room) {
      return NextResponse.json({
        message: "Room not found",
        status: 404,
        error: "Room not found",
      })
    }

    return NextResponse.json({
      message: "Room retrieved successfully",
      status: 200,
      data: room,
    })
  } catch (error) {
    console.error("Get room error:", error)
    return NextResponse.json({
      message: "An error occurred while fetching the room",
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    })
  }
}

// PUT /api/rooms/[id]
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  console.log("1. Starting PUT handler for room update")
  console.log("2. Room ID:", props.params)

  try {
    const roomId = Number.parseInt((await props.params).id)
    if (isNaN(roomId)) {
      console.log("3. Invalid room ID format")
      return NextResponse.json({ error: "Invalid room ID format" }, { status: 400 })
    }

    console.log("4. Parsing request body")
    const body = await req.json()
    console.log("5. Request body:", body)

    const roomSchema = z.object({
      name: z.string().optional(),
      capacity: z.number().optional(),
      features: z.array(z.string()).optional(),
      floor: z.number().optional(),
      building: z.string().optional(),
      categoryId: z.number().optional(),
    })

    console.log("6. Validating room data")
    const roomData = roomSchema.parse(body)
    console.log("7. Validated room data:", roomData)

    console.log("8. Updating room")
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: roomData,
    })

    console.log("9. Room updated successfully")
    return NextResponse.json(
      {
        message: "Room updated successfully",
        data: updatedRoom,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("10. Error in PUT handler:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 })
  }
}

// PATCH /api/rooms/[id]/status
export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const roomId = Number.parseInt((await props.params).id)
    if (isNaN(roomId)) {
      return NextResponse.json({
        message: "Invalid room ID",
        status: 400,
        error: "Room ID must be a number",
      })
    }

    const body = await req.json()

    // Validate request body for status update
    const statusSchema = z.object({
      status: z.nativeEnum(RoomStatus),
      description: z.string().optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    })

    const validatedData = statusSchema.parse(body)

    // If setting to maintenance, require description and dates
    if (validatedData.status === "MAINTENANCE") {
      if (!validatedData.description || !validatedData.startDate || !validatedData.endDate) {
        return NextResponse.json({
          message: "Missing maintenance details",
          status: 400,
          error: "Description, start date, and end date are required for maintenance",
        })
      }
    }

    // Begin transaction
    const room = await prisma.$transaction(async (tx) => {
      // Update room status
      await tx.room.update({
        where: { id: roomId },
        data: {
          status: validatedData.status,
        },
      })

      // Create maintenance record if status is MAINTENANCE
      if (validatedData.status === "MAINTENANCE") {
        await tx.maintenance.create({
          data: {
            roomId: roomId,
            description: validatedData.description!,
            startDate: new Date(validatedData.startDate!),
            endDate: new Date(validatedData.endDate!),
            status: "scheduled",
          },
        })
      }

      // Fetch updated room with relations
      return tx.room.findUnique({
        where: { id: roomId },
        include: {
          bookings: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          maintenance: true,
        },
      })
    })

    if (!room) {
      return NextResponse.json({
        message: "Room not found",
        status: 404,
        error: "Room not found",
      })
    }

    return NextResponse.json({
      message: "Room status updated successfully",
      status: 200,
      data: room,
    })
  } catch (error) {
    console.error("Update room status error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        message: "Invalid status update data",
        status: 400,
        error: error.errors.map((e) => e.message).join(", "),
      })
    }

    return NextResponse.json({
      message: "An error occurred while updating the room status",
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  console.log("1. Starting DELETE handler")

  try {
    const resolvedParams = await params
    console.log("2. Resolved params:", resolvedParams)
    const id = resolvedParams.id
    console.log("3. Extracted ID:", id)

    if (!id) {
      console.log("4. No ID provided")
      throw new Error("Room ID is required")
    }

    const roomId = Number.parseInt(id)
    console.log("5. Parsed roomId:", roomId)

    if (isNaN(roomId)) {
      console.log("6. Invalid roomId format")
      throw new Error("Invalid room ID format")
    }

    console.log("7. Starting transaction to delete room and associated records")
    const deletedRoom = await prisma.$transaction(async (prisma) => {
      // Delete all associated bookings
      await prisma.booking.deleteMany({
        where: { roomId },
      })
      console.log("8. Deleted associated bookings")

      // Delete all associated maintenance records
      await prisma.maintenance.deleteMany({
        where: { roomId },
      })
      console.log("9. Deleted associated maintenance records")

      // Finally, delete the room
      const room = await prisma.room.delete({
        where: { id: roomId },
        include: {
          category: true,
        },
      })
      console.log("10. Deleted room")

      return room
    })

    console.log("11. Transaction completed successfully")
    return NextResponse.json(
      {
        message: "Room and all related records deleted successfully",
        data: deletedRoom,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("12. Error in DELETE handler:", error)
    if (error instanceof Error) {
      console.error("13. Error stack:", error.stack)
    } else {
      console.error("13. Error stack:", error instanceof Error ? error.stack : "unknown error")
    }

    let statusCode = 500
    if (error instanceof Error) {
      if (error.message === "Room ID is required") statusCode = 400
      if (error.message === "Invalid room ID format") statusCode = 400
      if (error.message === "Record to delete does not exist.") statusCode = 404
    }

    console.log("14. Sending error response with status:", statusCode)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to delete room",
      },
      { status: statusCode },
    )
  }
}

