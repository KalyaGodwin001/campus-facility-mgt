// scripts/cronService.ts
import cron from 'node-cron'
import { monitorBookings } from '../utils/bookingMonitor'

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Running booking monitor cron job:', new Date().toISOString())
  try {
    await monitorBookings()
    console.log('Booking monitor completed successfully')
  } catch (error) {
    console.error('Error in booking monitor cron job:', error)
  }
})

// Additional cron job to clean up expired bookings (runs once per hour)
cron.schedule('0 * * * *', async () => {
  console.log('Running expired bookings cleanup:', new Date().toISOString())
  try {
    const currentTime = new Date()
    const prisma = (await import('../lib/prisma')).default
    
    // Update expired bookings
    await prisma.booking.updateMany({
      where: {
        endTime: { lt: currentTime },
        status: 'approved'
      },
      data: {
        status: 'completed'
      }
    })
    
    // Update room statuses
    const rooms = await prisma.room.findMany({
      where: {
        status: 'BOOKED'
      }
    })
    
    for (const room of rooms) {
      await (await import('../utils/bookingMonitor')).updateRoomStatus(room.id)
    }
    
    console.log('Cleanup completed successfully')
  } catch (error) {
    console.error('Error in cleanup cron job:', error)
  }
})

// Keep the process running
process.stdin.resume()