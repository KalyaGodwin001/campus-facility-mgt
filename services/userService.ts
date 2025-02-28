import prisma from "@/lib/prisma"
import type { User, UserRole } from "@prisma/client"

export async function getAllUsers(): Promise<User[]> {
  return prisma.user.findMany()
}
export async function getUserById(id: number): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } })
}

export async function updateUser(id: number, data: Partial<User>): Promise<User> {
  return prisma.user.update({ where: { id }, data })
}

export async function createUser(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
  return prisma.user.create({ data })
}

export async function getUsersByRole(role: UserRole): Promise<User[]> {
  return prisma.user.findMany({ where: { role } })
}

