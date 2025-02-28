import prisma from "@/lib/prisma"
import type { Booking } from "@prisma/client"

export async function getAllBookings(): Promise<Booking[]> {
  return prisma.booking.findMany(
    {
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            capacity: true,
            status: true,
          },
        },
      },
    }
  )
}

export async function getBookingById(id: number): Promise<Booking | null> {
  return prisma.booking.findUnique({ where: { id } })
}

export async function createBooking(data: Omit<Booking, "id" | "createdAt" | "updatedAt">): Promise<Booking> {
  return prisma.booking.create({ data })
}

export async function updateBooking(id: number, data: Partial<Booking>): Promise<Booking> {
  return prisma.booking.update({ where: { id }, data })
}

export async function deleteBooking(id: number): Promise<Booking> {
  return prisma.booking.delete({ where: { id } })
}

export async function getBookingsByUserId(userId: number): Promise<Booking[]> {
  return prisma.booking.findMany({ where: { userId } })
}

export async function getBookingsByRoomId(roomId: number): Promise<Booking[]> {
  return prisma.booking.findMany({ where: { roomId } })
}

