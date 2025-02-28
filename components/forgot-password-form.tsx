"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthCard } from "@/components/ui/auth-card"
import { useToast } from "@/hooks/use-toast"

export function ForgotPasswordForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error("Failed to send reset email")
      }

      setSubmitted(true)
      toast({
        title: "Success",
        description: "If an account exists, you will receive a reset email.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {!submitted ? (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight">Forgot password?</h1>
              <p className="text-sm text-muted-foreground">Enter your email to reset your password</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send reset link
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link href="/auth/login" className="text-orange-600 hover:text-orange-500">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-semibold">Check your email</h2>
            <p className="text-muted-foreground">We&apos;ve sent you a password reset link. Please check your inbox.</p>
            <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>
              Try another email
            </Button>
          </div>
        )}
      </motion.div>
    </AuthCard>
  )
}

