"use server"

import { revalidatePath } from "next/cache"
import { createRoom as createRoomService } from "@/services/roomService"

export async function createRoom(formData: FormData) {
  const name = formData.get("name") as string
  const capacity = Number.parseInt(formData.get("capacity") as string)

  if (!name || isNaN(capacity)) {
    throw new Error("Invalid input")
  }

  await createRoomService({ 
    name, 
    capacity, 
    status: "VACANT",
    imageUrl: null,
    features: [],
    floor: 1,
    building: "Main Building",
    categoryId: 1 // Add the appropriate categoryId value
  })
  revalidatePath("/dashboard")
}

