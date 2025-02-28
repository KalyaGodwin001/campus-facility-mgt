"use client"

import { ChevronUp } from "lucide-react"
import { useState } from "react"

const currentYear = new Date().getFullYear()



export function Footer() {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleFooter = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <footer className=" text-[#771d1d]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="text-2xl font-bold mb-4 md:mb-0">Campus Facility Management System</div>
        </div>

    

        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm mb-4 md:mb-0">&copy; {currentYear} Kabarak University. All rights reserved.</div>
          <button
            onClick={toggleFooter}
            className="flex items-center text-sm text-[#9b1c1c] hover:text-[#c81e1e] transition-colors duration-300"
            aria-expanded={isExpanded}
            aria-controls="footer-content"
          >
            {isExpanded ? "Less" : "More"}{" "}
            <ChevronUp
              size={16}
              className={`ml-1 transform transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>
    </footer>
  )
}

