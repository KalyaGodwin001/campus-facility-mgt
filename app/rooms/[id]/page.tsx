"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, MapPin, Building, Wrench, ChevronLeft, Star, Clock, Wifi, Tv, Coffee } from "lucide-react"
import Link from "next/link"
import type { Room } from "@prisma/client"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import type React from "react" // Import React

const featureIcons: { [key: string]: React.ReactNode } = {
  "Wi-Fi": <Wifi className="w-4 h-4" />,
  TV: <Tv className="w-4 h-4" />,
  "Coffee Machine": <Coffee className="w-4 h-4" />,
}

export default function RoomPage() {
  const { id } = useParams()
  const [room, setRoom] = useState<Room | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${id}`)
        const data = await response.json()
        if (data.status === 200) {
          setRoom(data.data)
        } else {
          throw new Error(data.message || "Failed to fetch room")
        }
      } catch (error) {
        console.error("Failed to fetch room:", error)
        toast({
          title: "Error",
          description: "Failed to load room details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchRoom()
    }
  }, [id])

  if (isLoading) {
    return <RoomSkeleton />
  }

  if (!room) {
    return <RoomNotFound />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Rooms
            </Button>
          </Link>

          <div className="relative h-48 sm:h-64 md:h-80 rounded-lg overflow-hidden mb-6 sm:mb-8">
            <Image
              src={room.imageUrl || "https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800"}
              alt={room.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30" />
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">{room.name}</h1>
              <div className="flex items-center space-x-2">
                <Badge
                  className={`${
                    room.status === "VACANT"
                      ? "bg-green-500"
                      : room.status === "MAINTENANCE"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                >
                  {room.status}
                </Badge>
                <div className="flex items-center text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1 text-white">{(Math.random() * 2 + 3).toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Room Details</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-500" />
                    <span>Capacity: {room.capacity} people</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span>Floor {room.floor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-gray-500" />
                    <span>{room.building}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span>Available hours: 8:00 AM - 8:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Features</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {room.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center justify-center p-2">
                      {featureIcons[feature] || null}
                      <span className="ml-1">{feature}</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <AnimatePresence>
            {room.status === "VACANT" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* <Button
                
                 className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white"
                 onClick={() => window.location.href = `/dashboard`}
                 >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Room
                </Button> */}
              </motion.div>
            )}

            {room.status === "MAINTENANCE" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg"
              >
                <Wrench className="w-5 h-5 text-yellow-500 mr-2" />
                <span>This room is currently under maintenance</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

function RoomSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-48 sm:h-64 md:h-80 w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoomNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Room not found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The room you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/">
          <Button>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}

