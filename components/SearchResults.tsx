import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Category, Room } from "@prisma/client"

interface SearchResultsProps {
  categories: Category[]
  rooms: Room[]
  onSelectCategory: () => void
  onSelectRoom: () => void
}

export default function SearchResults({ categories, rooms, onSelectCategory, onSelectRoom }: SearchResultsProps) {
  return (
    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-[#f98080] dark:border-gray-700">
      <ScrollArea className="max-h-96">
        {categories.length > 0 && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-[#c81e1e] dark:text-gray-400 mb-2">Categories</h3>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                onClick={onSelectCategory}
                className="block py-2 px-4 hover:bg-[#fde8e8] dark:hover:bg-gray-700 rounded transition-colors duration-150 text-[#771d1d] dark:text-gray-200"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
        {rooms.length > 0 && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-[#c81e1e] dark:text-gray-400 mb-2">Rooms</h3>
            {rooms.map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                onClick={onSelectRoom}
                className="block py-2 px-4 hover:bg-[#fde8e8] dark:hover:bg-gray-700 rounded transition-colors duration-150 text-[#771d1d] dark:text-gray-200"
              >
                {room.name}
              </Link>
            ))}
          </div>
        )}
        {categories.length === 0 && rooms.length === 0 && (
          <p className="p-4 text-[#c81e1e] dark:text-gray-400">No results found</p>
        )}
      </ScrollArea>
    </div>
  )
}

