import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import type { Category } from "@prisma/client"

interface CategoryCardProps {
  category: Category
  roomCount: number
}

export default function CategoryCard({ category, roomCount }: CategoryCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
    >
      <Link href={`/category/${category.id}`}>
        <Card className="overflow-hidden group hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800">
          <div className="relative h-56">
            <Image
              src={category.imageUrl || `https://source.unsplash.com/random/800x600?${category.name}`}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-all duration-300" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h2 className="text-2xl font-bold mb-2 group-hover:translate-y-[-4px] transition-transform duration-300">
                {category.name}
              </h2>
              <Badge
                variant="secondary"
                className="bg-orange-500 text-white group-hover:bg-orange-600 transition-colors duration-300"
              >
                {roomCount} {roomCount === 1 ? "Room" : "Rooms"}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-orange-500 group-hover:text-orange-600">
              <span className="font-semibold">View Rooms</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

