"use client"
import { useState, useEffect } from "react"
import type { User, Room, Booking } from "@prisma/client"
import DashboardLayout from "./DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StudentDashboardProps {
  user: User
  initialRooms: Room[]
  initialBookings: Booking[]
}

// Function to format dates consistently
function formatDate(date: Date | string) {
  const d = new Date(date)
  return d.toISOString().split(".")[0].replace("T", " ")
}

export default function StudentDashboard({ user, initialRooms = [], initialBookings = [] }: StudentDashboardProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        setError("Authentication token not found")
        return
      }

      const [roomsRes, bookingsRes] = await Promise.all([
        fetch("/api/rooms", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/bookings", { headers: { Authorization: `Bearer ${token}` } }),
      ])

      if (!roomsRes.ok || !bookingsRes.ok) {
        throw new Error("Failed to fetch data")
      }

      const roomsData = await roomsRes.json()
      const bookingsData = await bookingsRes.json()

      const roomsArray = Array.isArray(roomsData) ? roomsData : roomsData.data || []
      const bookingsArray = Array.isArray(bookingsData.bookings) ? bookingsData.bookings : bookingsData.data || []

      setRooms(roomsArray)
      setBookings(bookingsArray)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log("Current rooms state:", rooms)
    console.log("Current bookings state:", bookings)
  }, [rooms, bookings])

  if (error) {
    return (
      <DashboardLayout title="Student Dashboard" userName={user?.name || "Student"}>
        <div className="text-red-600 bg-red-50 p-4 rounded">
          <p>{error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Student Dashboard" userName={user?.name || "Student"}>
      {isLoading ? (
        <div className="text-gray-500">Loading dashboard data...</div>
      ) : (
        <>
          <Card className="mb-8 bg-gradient-to-br from-[#800000] to-[#4D0000] text-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Available Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              {!rooms?.length ? (
                <p className="text-gray-300">No rooms available</p>
              ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map((room) => (
                    <li key={room.id} className="bg-white bg-opacity-10 p-4 rounded-md backdrop-filter backdrop-blur-lg">
                      <h3 className="font-medium text-lg">{room.name}</h3>
                      <div className="text-sm text-gray-300">
                        <p>Capacity: {room.capacity}</p>
                        <p>Status: {room.status}</p>
                        {room.features && (
                          <p>Features: {Array.isArray(room.features) ? room.features.join(", ") : room.features}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#800000] to-[#4D0000] text-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Current Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {!bookings?.length ? (
                <p className="text-gray-300">No current bookings</p>
              ) : (
                <ul className="space-y-4">
                  {bookings.map((booking) => (
                    <li key={booking.id} className="bg-white bg-opacity-10 p-4 rounded-md backdrop-filter backdrop-blur-lg">
                      <h3 className="font-medium text-lg">
                        Room: {rooms.find((room) => room.id === booking.roomId)?.name || "Unknown"}
                      </h3>
                      <div className="text-sm text-gray-300">
                        <p>Start: {formatDate(booking.startTime)}</p>
                        <p>End: {formatDate(booking.endTime)}</p>
                        <p>Purpose: {booking.purpose}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </DashboardLayout>
  )
}
