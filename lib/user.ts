import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function deleteUserData(userId: number) {
  const deletionSteps: string[] = []

  try {
    // Step 1: Delete user's notifications
    await prisma.notification.deleteMany({ where: { userId } })
    deletionSteps.push('Deleted user notifications')

    // Step 2: Delete user's bookings
    await prisma.booking.deleteMany({ where: { userId } })
    deletionSteps.push('Deleted user bookings')

    // Step 3: Delete user account
    await prisma.user.delete({ where: { id: userId } })
    deletionSteps.push('Deleted user account')

    return deletionSteps
  } catch (error) {
    console.error('Error during user deletion:', error)
    throw new Error('Failed to delete user data')
  }
}
