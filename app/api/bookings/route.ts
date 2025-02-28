


import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getUserById } from "@/services/userService"
import { createBooking, getBookingsByUserId } from "@/services/bookingService"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"
import { updateRoomStatus } from "@/utils/bookingMonitor"


export const dynamic = "force-dynamic"
export async function GET() {
  console.log("Starting GET /api/bookings request")
  
  try {
    // Get and validate token
    const token = (await cookies()).get("token")?.value
    console.log("Token from cookie:", token)
    
    if (!token) {
      console.log("No token found in cookie")
      return Response.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify token and get payload
    let payload
    try {
      payload = await verifyToken(token)
      console.log("Token verification result:", payload)
    } catch (verifyError) {
      console.error("Token verification failed:", verifyError)
      return Response.json({ error: "Invalid token" }, { status: 401 })
    }

    if (!payload || !payload.userId) {
      console.log("Invalid payload or missing userId:", payload)
      return Response.json({ error: "Invalid token payload" }, { status: 401 })
    }

    // Get and validate user
    const user = await getUserById(payload.userId)
    console.log("User lookup result:", user)
    
    if (!user) {
      console.log("User not found for id:", payload.userId)
      return Response.json({ error: "User not found" }, { status: 404 })
    }

     // Get user's bookings instead of rooms
     const bookings = await getBookingsByUserId(payload.userId); // Replace with your actual service
     console.log("Bookings lookup result:", bookings);
     
     return Response.json({ bookings }, { status: 200 });
 
   } catch (error) {
     console.error("Unexpected error in GET /api/bookings:", error);
     return Response.json(
       { error: "An unexpected error occurred" },
       { status: 500 }
     );
   }
 }
 export async function POST(request: NextRequest) {
  console.log("Starting POST /api/bookings request")
  
  try {
    const token = (await cookies()).get("token")?.value
    if (!token) {
      return Response.json({ error: "Authentication required" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.userId) {
      return Response.json({ error: "Invalid token payload" }, { status: 401 })
    }

    const user = await getUserById(payload.userId)
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    const allowedRoles = ["LECTURER", "CLASS_REP", "ADMIN"]
    if (!allowedRoles.includes(user.role)) {
      return Response.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { roomId, startTime, endTime, purpose } = body

    if (!roomId || !startTime || !endTime || !purpose) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check for existing bookings in the time slot
    const existingBooking = await prisma.booking.findFirst({
      where: {
        roomId: Number(roomId),
        status: 'approved',
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } }
            ]
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } }
            ]
          }
        ]
      }
    })

    if (existingBooking) {
      return Response.json(
        { error: "Room is already booked for this time slot" },
        { status: 400 }
      )
    }

    // Check for maintenance during the booking period
    const maintenance = await prisma.maintenance.findFirst({
      where: {
        roomId: Number(roomId),
        status: 'in-progress',
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(startTime) } },
              { endDate: { gt: new Date(startTime) } }
            ]
          },
          {
            AND: [
              { startDate: { lt: new Date(endTime) } },
              { endDate: { gte: new Date(endTime) } }
            ]
          }
        ]
      }
    })

    if (maintenance) {
      return Response.json(
        { error: "Room is under maintenance during this time slot" },
        { status: 400 }
      )
    }

    // Create booking
    const booking = await createBooking({
      roomId: Number(roomId),
      userId: user.id,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      purpose,
      status: user.role === 'ADMIN' ? 'approved' : 'pending'
    })

    // If booking is approved (for admin), update room status immediately
    if (booking.status === 'approved') {
      await updateRoomStatus(Number(roomId))
    }

    return Response.json({ booking }, { status: 201 })

  } catch (error) {
    console.error("Unexpected error in POST /api/bookings:", error)
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}