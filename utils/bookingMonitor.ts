// utils/bookingMonitor.ts
import prisma from '@/lib/prisma'

export async function updateRoomStatus(roomId: number) {
  const currentTime = new Date()
  
  // Get all approved bookings for the room
  const activeBookings = await prisma.booking.findMany({
    where: {
      roomId: roomId,
      status: 'approved',
      AND: [
        { startTime: { lte: currentTime } },
        { endTime: { gt: currentTime } }
      ]
    }
  })

  // Get future bookings
  const futureBookings = await prisma.booking.findMany({
    where: {
      roomId: roomId,
      status: 'approved',
      startTime: { gt: currentTime }
    },
    orderBy: {
      startTime: 'asc'
    },
    take: 1
  })

  // Check if room is under maintenance
  const maintenance = await prisma.maintenance.findFirst({
    where: {
      roomId: roomId,
      status: 'in-progress',
      startDate: { lte: currentTime },
      endDate: { gt: currentTime }
    }
  })

  let newStatus: 'VACANT' | 'BOOKED' | 'MAINTENANCE' = 'VACANT'

  if (maintenance) {
    newStatus = 'MAINTENANCE'
  } else if (activeBookings.length > 0) {
    newStatus = 'BOOKED'
  } else if (futureBookings.length > 0) {
    // If there's a future booking starting within the next hour, mark as BOOKED
    const nextBooking = futureBookings[0]
    const hourFromNow = new Date(currentTime.getTime() + 60 * 60 * 1000)
    if (new Date(nextBooking.startTime) <= hourFromNow) {
      newStatus = 'BOOKED'
    }
  }

  // Update room status
  await prisma.room.update({
    where: { id: roomId },
    data: { status: newStatus }
  })

  return newStatus
}

export async function monitorBookings() {
  console.log('Running booking monitor...')
  const rooms = await prisma.room.findMany()
  
  for (const room of rooms) {
    try {
      const newStatus = await updateRoomStatus(room.id)
      console.log(`Updated room ${room.id} status to ${newStatus}`)
    } catch (error) {
      console.error(`Error updating room ${room.id} status:`, error)
    }
  }
}