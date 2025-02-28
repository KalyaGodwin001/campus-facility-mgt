"use client"

import { useEffect } from "react"
import type { User, Room, Booking } from "@prisma/client"
import AdminDashboard from "@/components/AdminDashboard"
import LecturerDashboard from "@/components/LecturerDashboard"
import ClassRepDashboard from "@/components/ClassRepDashboard"
import StudentDashboard from "@/components/StudentDashboard"
import { useRouter } from "next/navigation"

interface DashboardClientProps {
  user: User
  initialRooms: Room[]
  initialBookings: Booking[]
}

export default function DashboardClient({ user, initialRooms, initialBookings }: DashboardClientProps) {
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    }
  }, [user, router])

  if (!user) return null

  switch (user.role) {
    case "ADMIN":
      return <AdminDashboard user={user} initialRooms={initialRooms} initialBookings={initialBookings} />
    case "LECTURER":
      return <LecturerDashboard user={user} initialRooms={initialRooms} initialBookings={initialBookings} />
    case "CLASS_REP":
      return <ClassRepDashboard user={user} initialRooms={initialRooms} initialBookings={initialBookings} />
    case "STUDENT":
      return <StudentDashboard user={user} initialRooms={initialRooms} initialBookings={initialBookings} />
    default:
      return <div>Invalid user role</div>
  }
}

