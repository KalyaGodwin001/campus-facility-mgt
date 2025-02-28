import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Users, MapPin, ArrowRight, PenToolIcon as Tool, Calendar, CheckCircle, AlertTriangle } from "lucide-react"
import type { Room, Booking, Maintenance } from "@prisma/client"

interface EnhancedRoom extends Room {
  currentBooking?: Booking
  upcomingMaintenance?: Maintenance
}

export default function RoomCard({ room }: { room: EnhancedRoom }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "VACANT":
        return "bg-green-500"
      case "BOOKED":
        return "bg-red-500"
      case "MAINTENANCE":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VACANT":
        return <CheckCircle className="w-4 h-4" />
      case "BOOKED":
        return <Calendar className="w-4 h-4" />
      case "MAINTENANCE":
        return <Tool className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Link href={`/rooms/${room.id}`}>
        <Card className="group hover:shadow-lg transition-shadow duration-300 bg-red-800 text-white">
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            <Image
              src={room.imageUrl || "https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800"}
              alt={room.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <Badge className={`absolute top-4 right-4 ${getStatusColor(room.status)}`}>{room.status}</Badge>
          </div>
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-2 text-white">{room.name}</h2>
            <div className="flex items-center gap-4 text-red-200 mb-2">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{room.capacity}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Floor {room.floor}</span>
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon(room.status)}
                <span>{room.status}</span>
              </div>
            </div>
            {room.features && room.features.length > 0 && (
              <p className="text-sm text-red-200 mb-2">Features: {room.features.join(", ")}</p>
            )}
            {room.currentBooking && (
              <div className="flex items-center gap-1 text-sm text-yellow-300">
                <Calendar className="w-4 h-4" />
                <span>Booked until {new Date(room.currentBooking.endTime).toLocaleTimeString()}</span>
              </div>
            )}
            {room.upcomingMaintenance && (
              <div className="flex items-center gap-1 text-sm text-yellow-300">
                <Tool className="w-4 h-4" />
                <span>Maintenance on {new Date(room.upcomingMaintenance.startDate).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <div className="flex items-center text-yellow-300 group-hover:text-yellow-200">
              View Details
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}

