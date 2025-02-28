"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import type { Category, Room } from "@prisma/client"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import RoomCard from "@/components/RoomCard"

export default function CategoryPage() {
  const { id } = useParams()
  interface CategoryWithRooms extends Category {
    rooms: Room[]
  }

  const [categoryWithRooms, setCategoryWithRooms] = useState<CategoryWithRooms | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryAndRooms = async () => {
      try {
        const response = await fetch(`/api/categories/${id}/rooms?includeRooms=true`)
        const data = await response.json()

        if (data.status === 200) {
          setCategoryWithRooms(data.data)
        } else {
          throw new Error(data.message || "Failed to fetch data")
        }
      } catch (error) {
        console.error("Failed to fetch category and rooms:", error)
        toast({
          title: "Error",
          description: "Failed to load category details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchCategoryAndRooms()
    }
  }, [id])

  if (isLoading) {
    return <CategorySkeleton />
  }

  if (!categoryWithRooms) {
    return <CategoryNotFound />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </Button>
          </Link>

          <h1 className="text-4xl font-bold mb-8">{categoryWithRooms?.name}</h1>

          {categoryWithRooms.rooms.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {categoryWithRooms.rooms.map((room) => (
                <motion.div
                  key={room.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="bg-red-800 rounded-lg overflow-hidden shadow-lg"
                >
                  <RoomCard room={room} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-center text-gray-500 mt-8">No rooms found in this category.</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function CategorySkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Skeleton className="h-10 w-32 mb-4" />
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

function CategoryNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Category not found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The category you&apos;re looking for doesn&lsquo;t exist or has been removed.
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

