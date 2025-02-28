"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    // Simulating an API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Message Sent",
      description: "We've received your message and will get back to you soon.",
    })

    setIsSubmitting(false)
    // Reset form here if needed
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-[#fde8e8]" id="contact-section">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-[#771d1d]">Contact Us</h2>

        <div className="bg-white shadow rounded-lg p-6 mb-8 border border-[#f98080]">
          <h3 className="text-xl font-semibold mb-4 text-[#9b1c1c]">Get in Touch</h3>
          <p className="text-[#771d1d] mb-6">
            Have questions about our booking and room management system? We&apos;re here to help. Fill out the form
            below, and we&apos;ll get back to you as soon as possible.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-[#771d1d]">
                Name
              </Label>
              <Input id="name" placeholder="Your Name" required className="border-[#f98080] focus:border-[#e02424]" />
            </div>
            <div>
              <Label htmlFor="email" className="text-[#771d1d]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                required
                className="border-[#f98080] focus:border-[#e02424]"
              />
            </div>
            <div>
              <Label htmlFor="subject" className="text-[#771d1d]">
                Subject
              </Label>
              <Input
                id="subject"
                placeholder="What's this about?"
                required
                className="border-[#f98080] focus:border-[#e02424]"
              />
            </div>
            <div>
              <Label htmlFor="message" className="text-[#771d1d]">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Your message here..."
                required
                className="border-[#f98080] focus:border-[#e02424]"
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="bg-[#c81e1e] hover:bg-[#9b1c1c] text-white">
              {isSubmitting ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="bg-[#fbd5d5] shadow rounded-lg p-6 border border-[#f98080]">
          <h3 className="text-xl font-semibold mb-4 text-[#771d1d]">Other Ways to Reach Us</h3>
          <div className="space-y-2 text-[#9b1c1c]">
            <p>
              <strong>Email:</strong> support@cfm-kabarak.com
            </p>
            <p>
              <strong>Phone:</strong> +1 (555) 123-4567
            </p>
            <p>
              <strong>Address:</strong> Ravine, Kabarak Road.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

