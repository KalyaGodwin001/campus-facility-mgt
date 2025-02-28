"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="p-8 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 shadow-xl">{children}</Card>
    </motion.div>
  )
}

