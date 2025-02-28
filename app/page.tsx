"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Category as PrismaCategory } from "@prisma/client"
import Hero from "@/components/hero"
import CategoryCard from "@/components/CategoryCard"
import { SearchCommand } from "@/components/SearchCommand"
import AboutSection from "@/components/AboutSection"
import ContactSection from "@/components/ContactSection"
import Navbar from "@/components/navbar"
interface Category extends PrismaCategory {
  roomCount?: number
}
export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  //const [rooms, setRooms] = useState<Room[]>([]) //Removed rooms state
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const homeRef = useRef<HTMLDivElement>(null)
  const roomsRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        setIsLoading(true)
        const categoriesResponse = await fetch("/api/categories?includeRoomCount=true")
        const categoriesData = await categoriesResponse.json()

        if (categoriesData.status === 200) {
          setCategories(categoriesData.data)
        } else {
          throw new Error("Failed to fetch data")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const yOffset = -80 // Adjust this value based on your navbar height
      const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
      <Navbar
        onHomeClick={() => scrollToSection(homeRef)}
        onRoomsClick={() => scrollToSection(roomsRef)}
        onAboutClick={() => scrollToSection(aboutRef)}
        onContactClick={() => scrollToSection(contactRef)}
      />

      <div ref={homeRef} className="pt-16">
        {" "}
        {/* Add padding-top to account for fixed navbar */}
        <Hero />
      </div>

      <main className="container mx-auto px-4 py-8">
        <div ref={roomsRef}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent mb-4">
              Explore Our Facilities
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Discover and book the perfect space for your needs
            </p>
          </motion.div>

          <div className="relative mb-12 max-w-2xl mx-auto flex justify-center items-center">
            <SearchCommand categories={categories} rooms={[]} /> {/*Passing empty array for rooms*/}
          </div>

          {error ? (
            <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
              ))}
            </div>
          ) : (
            <AnimatePresence>
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
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} roomCount={category.roomCount || 0} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <div ref={aboutRef}>
          <AboutSection />
        </div>

        <div ref={contactRef}>
          <ContactSection />
        </div>
      </main>
    </div>
  )
}

