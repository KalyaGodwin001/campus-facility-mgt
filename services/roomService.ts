import prisma from "@/lib/prisma"
import type { Room, RoomStatus, Prisma } from "@prisma/client"

export async function getAllRooms(): Promise<Room[]> {
  return prisma.room.findMany({
    include: {
      category: true,
      bookings: true,
      maintenance: true,
    },
  })
}

export async function getRoomById(id: number): Promise<Room | null> {
  return prisma.room.findUnique({
    where: { id },
    include: {
      category: true,
    },
  })
}

export async function createRoom(
  data: Omit<Prisma.RoomCreateInput, "category"> & { categoryId: number },
): Promise<Room> {
  const { categoryId, ...restData } = data
  return prisma.room.create({
    data: {
      ...restData,
      category: {
        connect: { id: categoryId },
      },
    },
    include: {
      category: true,
    },
  })
}

export async function updateRoom(
  id: number,
  data: Partial<Omit<Prisma.RoomUpdateInput, "category">> & { categoryId?: number },
): Promise<Room> {
  const { categoryId, ...restData } = data
  return prisma.room.update({
    where: { id },
    data: {
      ...restData,
      ...(categoryId && {
        category: {
          connect: { id: categoryId },
        },
      }),
    },
    include: {
      category: true,
    },
  })
}

export async function deleteRoom(id: number): Promise<Room> {
  return prisma.room.delete({ where: { id } })
}

export async function getRoomsByStatus(status: RoomStatus): Promise<Room[]> {
  return prisma.room.findMany({
    where: { status },
    include: {
      category: true,
    },
  })
}

export async function getRoomsByCategory(categoryId: number): Promise<Room[]> {
  return prisma.room.findMany({
    where: { categoryId },
    include: {
      category: true,
    },
  })
}

