"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

interface NavbarProps {
  onHomeClick: () => void
  onRoomsClick: () => void
  onAboutClick: () => void
  onContactClick: () => void
}

export default function Navbar({ 
  onHomeClick, 
  onRoomsClick, 
  onAboutClick, 
  onContactClick 
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const menuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: {
        duration: 0.2,
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
        staggerDirection: 1,
      },
    },
  }

  const itemVariants = {
    closed: { opacity: 0, x: 50 },
    open: { opacity: 1, x: 0 },
  }

  const navItemClasses = isScrolled
    ? "text-[#771d1d] hover:text-[#c81e1e] hover:bg-[#fde8e8]"
    : "text-[#771d1d] bg-white/80 hover:bg-[#fde8e8] rounded-md"

  const contactButtonClasses = isScrolled
    ? "border-[#c81e1e] text-[#c81e1e] hover:bg-[#c81e1e] hover:text-white"
    : "border-[#c81e1e] text-[#c81e1e] bg-white hover:bg-[#c81e1e] hover:text-white"

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow-md" : "bg-transparent"}`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            className={`text-2xl font-bold cursor-pointer ${isScrolled ? "text-[#771d1d]" : "text-[#771d1d] bg-white/80 px-3 py-1 rounded-md"}`}
            onClick={onHomeClick}
          >
            Campus Facility management system - Kabarak University
          </div>

          {/* Desktop Navigation */}
          <motion.div
            className="hidden md:flex items-center space-x-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" className={navItemClasses} onClick={onHomeClick}>
                Home
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/dashboard">
                <Button variant="ghost" className={navItemClasses}>
                  Dashboard
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" className={navItemClasses} onClick={onRoomsClick}>
                Rooms
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" className={navItemClasses} onClick={onAboutClick}>
                About
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className={contactButtonClasses} onClick={onContactClick}>
                Contact us
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/auth/login">
                <Button variant="outline" className={contactButtonClasses}>
                  Login
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)} whileTap={{ scale: 0.9 }}>
            {isOpen ? (
              <X
                size={24}
                className={`${isScrolled ? "text-[#771d1d]" : "text-[#771d1d] bg-white/80 p-1 rounded-md"}`}
              />
            ) : (
              <Menu
                size={24}
                className={`${isScrolled ? "text-[#771d1d]" : "text-[#771d1d] bg-white/80 p-1 rounded-md"}`}
              />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg md:hidden border-t border-[#f98080]"
          >
            <div className="flex flex-col p-4 space-y-4">
              <motion.div variants={itemVariants} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-[#771d1d] hover:bg-[#fde8e8]"
                  onClick={() => {
                    onHomeClick()
                    setIsOpen(false)
                  }}
                >
                  Home
                </Button>
              </motion.div>
              <motion.div variants={itemVariants} whileTap={{ scale: 0.95 }}>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-[#771d1d] hover:bg-[#fde8e8]"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={itemVariants} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-[#771d1d] hover:bg-[#fde8e8]"
                  onClick={() => {
                    onRoomsClick()
                    setIsOpen(false)
                  }}
                >
                  Rooms
                </Button>
              </motion.div>
              <motion.div variants={itemVariants} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-[#771d1d] hover:bg-[#fde8e8]"
                  onClick={() => {
                    onAboutClick()
                    setIsOpen(false)
                  }}
                >
                  About
                </Button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Button
                  variant="outline"
                  className="w-full border-[#c81e1e] text-[#c81e1e] hover:bg-[#c81e1e] hover:text-white"
                  onClick={() => {
                    onContactClick()
                    setIsOpen(false)
                  }}
                >
                  Contact us
                </Button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    className="w-full border-[#c81e1e] text-[#c81e1e] hover:bg-[#c81e1e] hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}