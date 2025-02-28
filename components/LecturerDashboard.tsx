"use client"
import { useState, useEffect } from "react"
import type { User, Booking, RoomStatus } from "@prisma/client"
import DashboardLayout from "./DashboardLayout"
import { format } from "date-fns"

interface Room {
  id: number
  name: string
  status: RoomStatus
  capacity: number
  features: string[]
  floor: number
  building: string
  imageUrl: string | null
  upcomingBookings?: Booking[]
  currentBooking?: Booking
}

interface LecturerDashboardProps {
  user: User
  initialRooms: Room[] | undefined
  initialBookings: Booking[] | undefined
}

export default function LecturerDashboard({ user, initialRooms, initialBookings }: LecturerDashboardProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms || [])
  const [bookings, setBookings] = useState<Booking[]>(initialBookings || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newBooking, setNewBooking] = useState({
    roomId: "",
    startTime: "",
    endTime: "",
    purpose: "",
  })

  useEffect(() => {
    if (!initialRooms || !initialBookings) {
      fetchData()
    }
  }, [initialRooms, initialBookings])

  async function fetchData() {
    const token = localStorage.getItem("token")
    if (!token) {
      setError("Authentication token not found")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        fetch("/api/rooms", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/bookings", { headers: { Authorization: `Bearer ${token}` } }),
      ])

      if (!roomsRes.ok || !bookingsRes.ok) {
        throw new Error("Failed to fetch data")
      }

      const roomsData = await roomsRes.json()
      const bookingsData = await bookingsRes.json()

      setRooms(roomsData.rooms || [])
      setBookings(bookingsData.bookings || [])
    } catch (err) {
      setError("Failed to load data. Please try again later.")
      console.error("Fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("token")
    if (!token) {
      setError("Authentication token not found")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newBooking,
          roomId: Number.parseInt(newBooking.roomId),
          startTime: new Date(newBooking.startTime).toISOString(),
          endTime: new Date(newBooking.endTime).toISOString(),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to book room")
      }

      const data = await res.json()
      setBookings((prev) => [...prev, data.booking])
      setNewBooking({ roomId: "", startTime: "", endTime: "", purpose: "" })

      // Update the room status to BOOKED if the booking is approved immediately
      if (data.booking.status === "approved") {
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === data.booking.roomId
              ? {
                  ...room,
                  status: "BOOKED",
                  upcomingBookings: [...(room.upcomingBookings || []), data.booking],
                }
              : room,
          ),
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to book room. Please try again.")
      console.error("Booking error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getRoomAvailability = (room: Room) => {
    if (room.status === "MAINTENANCE") {
      return "Under Maintenance"
    } else if (room.currentBooking) {
      return "Currently Booked"
    } else if (room.upcomingBookings && room.upcomingBookings.length > 0) {
      const nextBooking = room.upcomingBookings[0]
      return `Available until ${format(new Date(nextBooking.startTime), "MMM d, h:mm a")}`
    } else {
      return "Available"
    }
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout title="Lecturer Dashboard" userName={user.name}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">{error}</div>
      )}

      <div className="bg-gradient-to-br from-white to-[#FFE5E5] shadow-lg rounded-lg p-6 mb-8 border border-[#800000]/20">
        <h2 className="text-2xl font-bold mb-6 text-[#800000]">Book a Room</h2>
        <form onSubmit={handleBookRoom} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
                Room
              </label>
              <select
                id="roomId"
                value={newBooking.roomId}
                onChange={(e) => setNewBooking({ ...newBooking, roomId: e.target.value })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-[#800000] focus:border-[#800000] rounded-md shadow-sm"
                required
                disabled={isLoading}
              >
                <option value="">Select a room</option>
                {rooms &&
                  rooms.map((room) => (
                    <option
                      key={room.id}
                      value={room.id.toString()}
                      disabled={room.status !== "VACANT" || !!room.currentBooking}
                    >
                      {room.name} (Capacity: {room.capacity}) - {getRoomAvailability(room)}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="datetime-local"
                id="startTime"
                value={newBooking.startTime}
                onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#800000] focus:border-[#800000] sm:text-sm"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="datetime-local"
                id="endTime"
                value={newBooking.endTime}
                onChange={(e) => setNewBooking({ ...newBooking, endTime: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#800000] focus:border-[#800000] sm:text-sm"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                Purpose
              </label>
              <input
                type="text"
                id="purpose"
                value={newBooking.purpose}
                onChange={(e) => setNewBooking({ ...newBooking, purpose: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#800000] focus:border-[#800000] sm:text-sm"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#800000] hover:bg-[#600000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#800000] transition-colors duration-200"
            disabled={isLoading}
          >
            {isLoading ? "Booking..." : "Book Room"}
          </button>
        </form>
      </div>

      <div className="bg-gradient-to-br from-white to-[#FFE5E5] shadow-lg rounded-lg p-6 border border-[#800000]/20">
        <h2 className="text-2xl font-bold mb-6 text-[#800000]">Your Bookings</h2>
        {isLoading ? (
          <p className="text-gray-500 text-sm">Loading bookings...</p>
        ) : bookings && bookings.length > 0 ? (
          <ul className="space-y-4">
            {bookings.map((booking) => (
              <li
                key={booking.id}
                className="bg-white p-4 rounded-md shadow transition-all duration-200 hover:shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-[#800000]">
                      Room: {rooms.find((r) => r.id === booking.roomId)?.name || booking.roomId}
                    </p>
                    <p className="text-sm text-gray-600">
                      Start: {format(new Date(booking.startTime), "MMM d, h:mm a")}
                    </p>
                    <p className="text-sm text-gray-600">End: {format(new Date(booking.endTime), "MMM d, h:mm a")}</p>
                    <p className="text-sm text-gray-600">Purpose: {booking.purpose}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No bookings found.</p>
        )}
      </div>
    </DashboardLayout>
  )
}

