import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"

export async function PATCH( req: Request, props: { params: Promise<{ id: string }> }) {
  console.log("1. Starting PATCH handler for booking")
  console.log("2. Initial params:", props.params)
  const id = parseInt((await props.params).id)

  try {
    const bookingId = id
    if (isNaN(bookingId)) {
      console.log("3. Invalid booking ID format")
      return NextResponse.json({ error: "Invalid booking ID format" }, { status: 400 })
    }

    console.log("4. Parsing request body")
    const body = await req.json()
    console.log("5. Request body:", body)

    const statusSchema = z.object({
      status: z.enum(["pending", "approved", "rejected"]),
    })

    console.log("6. Validating status")
    const { status } = statusSchema.parse(body)
    console.log("7. Validated status:", status)

    console.log("8. Updating booking")
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    })

    // If the booking is approved, update the room status to BOOKED
    if (status === "approved") {
      console.log("9. Booking approved, updating room status")
      await prisma.room.update({
        where: { id: updatedBooking.roomId },
        data: { status: "BOOKED" },
      })
    }

    console.log("10. Booking updated successfully")
    return NextResponse.json(
      {
        message: "Booking status updated successfully",
        data: updatedBooking,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("11. Error in PATCH handler:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 })
  }
}

