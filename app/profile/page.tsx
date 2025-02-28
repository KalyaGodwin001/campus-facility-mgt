"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import DeleteAccountModal from "@/components/DeleteAccountModal"
import { UserCircle, Mail, Building2, Shield, AlertCircle } from "lucide-react"

export default function MyProfile() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
  })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletionSteps, setDeletionSteps] = useState<string[]>([])
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [hasUser, setHasUser] = useState(true)
  
  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/profile", {
        credentials: "include",
      })
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/login")
          return
        }
        if (response.status === 404) {
          setHasUser(false)
          setIsLoading(false)
          return
        }
        throw new Error("Failed to fetch user data")
      }
      const data = await response.json()
      setUserData(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user data",
      })
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include",
      })
      if (!response.ok) throw new Error("Failed to update profile")
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)
    const token = localStorage.getItem("token")
    if (!token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete account",
      })
      setIsDeletingAccount(false)
      return
    }
    try {
      const response = await fetch(`api/profile?token=${token}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!response.ok) throw new Error("Failed to delete account")
      setDeletionSteps(["Account deleted successfully"])
      toast({
        title: "Success",
        description: "Your account has been deleted",
      })
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete account",
      })
    } finally {
      setIsDeletingAccount(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          className="w-16 h-16 border-t-4 border-blue-500 rounded-full animate-spin"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>
    )
  }

  if (!hasUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-8 max-w-2xl text-center"
      >
        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">No User Found</h1>
        <p className="text-xl mb-8">It seems there&apos;s no user profile available.</p>
        <Button onClick={() => router.push("/auth/login")} className="text-lg">
          Go to Login
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-8 max-w-2xl"
    >
      <h1 className="text-4xl font-bold mb-8 text-center">My Profile</h1>
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white shadow-lg rounded-lg p-8"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-2">
          <Label htmlFor="name" className="text-lg">
            <UserCircle className="inline-block mr-2" />
            Name
          </Label>
          <Input id="name" name="name" value={userData.name} onChange={handleInputChange} className="text-lg" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-lg">
            <Mail className="inline-block mr-2" />
            Email
          </Label>
          <Input
            id="email"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
            disabled
            className="text-lg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role" className="text-lg">
            <Shield className="inline-block mr-2" />
            Role
          </Label>
          <Input
            id="role"
            name="role"
            value={userData.role}
            onChange={handleInputChange}
            disabled
            className="text-lg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department" className="text-lg">
            <Building2 className="inline-block mr-2" />
            Department
          </Label>
          <Input
            id="department"
            name="department"
            value={userData.department || "Not specified"}
            onChange={handleInputChange}
            className="text-lg"
          />
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button type="submit" className="w-full text-lg">
            Update Profile
          </Button>
        </motion.div>
      </motion.form>
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)} className="text-lg">
          Delete My Account
        </Button>
      </motion.div>
      <AnimatePresence>
        {isDeleteModalOpen && (
          <DeleteAccountModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteAccount}
            isDeletingAccount={isDeletingAccount}
            deletionSteps={deletionSteps}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

