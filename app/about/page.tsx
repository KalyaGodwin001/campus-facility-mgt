"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

const faqs = [
  {
    question: "What is this booking and room management system?",
    answer: "Our booking and room management system is a comprehensive solution designed to streamline the process of managing and reserving rooms or spaces within an organization. It allows users to easily view available rooms, make bookings, and helps administrators efficiently manage room resources."
  },
  {
    question: "How do I make a room reservation?",
    answer: "To make a room reservation, log into your account, navigate to the 'Book a Room' section, select your desired date and time, choose an available room that meets your requirements, and confirm your booking. You'll receive a confirmation email with the details of your reservation."
  },
  {
    question: "Can I modify or cancel my booking?",
    answer: "Yes, you can modify or cancel your booking up to 24 hours before the scheduled time. Go to the 'My Bookings' section in your account, find the relevant booking, and select 'Modify' or 'Cancel'. Please note that last-minute cancellations may incur a fee."
  },
  {
    question: "What features are available for room administrators?",
    answer: "Room administrators have access to a range of features including room creation and management, booking oversight, user role management, generating usage reports, and setting room-specific rules or restrictions. They can also view a dashboard with key metrics and insights."
  },
  {
    question: "Is the system accessible on mobile devices?",
    answer: "Yes, our booking and room management system is fully responsive and can be accessed on various devices including desktops, laptops, tablets, and smartphones. The interface adapts to different screen sizes to ensure a seamless user experience across all devices."
  }
]

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-lg">{question}</span>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="mt-2 text-gray-600">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">About Our CAMPUS FACILITY System</h1>
          <Link href="/">
            <Button variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome to Our Platform</h2>
          <p className="text-gray-600 mb-4">
            Our booking and room management system is designed to simplify the process of managing and reserving spaces within your organization. Whether you&apos;re looking to book a meeting room, manage resources, or oversee facility usage, our platform provides an intuitive and efficient solution.
          </p>
          <p className="text-gray-600">
            With features tailored for both users and administrators, we aim to streamline your booking process, enhance resource utilization, and provide valuable insights into your space management.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
