"use client"

import { motion } from "framer-motion"
import { Mouse } from "lucide-react"
export default function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Blur Effect */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://res.cloudinary.com/dunssu2gi/image/upload/v1739598882/blog-images/fdbhnzgkontgrj8zpxai.jpg")',
          backgroundPosition: "center",
          backgroundSize: "cover",
          filter: "blur(8px)",
          transform: "scale(1.1)", // Prevent blur edges from showing
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 md:px-6 py-16 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Main Content with Backdrop */}
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 md:p-8 lg:p-10 space-y-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
              Welcome to Kabarak University&apos;s Campus Facility Management System!
            </h1>

            <p className="text-base md:text-lg leading-relaxed opacity-90 max-w-3xl">
              We are dedicated to providing an efficient and seamless experience for managing our campus facilities,
              ensuring that Kabarak University remains a place of excellence and innovation. Our commitment to
              maintaining a safe, clean, and well-equipped environment supports the growth and success of our students,
              staff, and faculty.
            </p>

            <div className="pt-4 space-y-3 border-t border-white/10">
              <p className="text-lg md:text-xl font-medium">1 Peter 3:15</p>
              <p className="text-sm md:text-base italic opacity-90">
                As members of Kabarak University family, we purpose at all times and in all places, to set apart in
                one&apos;s heart Jesus Christ as Lord (IPeter3:15).
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="pt-6 flex justify-center items-center mx-auto"
            >
              <button
                onClick={() => {
                  const roomsSection = document.getElementById("rooms-section")
                  if (roomsSection) {
                    roomsSection.scrollIntoView({ behavior: "smooth" })
                  }
                }}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg 
                         px-6 py-3 text-sm md:text-base transition-all duration-300 
                         backdrop-blur-sm hover:scale-105 transform text-center"
              >
                <Mouse className="w-8 h-8 animate-bounce" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

