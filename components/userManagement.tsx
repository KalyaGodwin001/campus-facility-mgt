"use client"

import { useState, useEffect } from "react"
import type { User } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/roles")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data.users)
    } catch (error) {
      console.error("Error fetching users:", error)
     
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/roles/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user role")
      }

      const updatedUser = await response.json()
      setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
      toast({
        title: "Success",
        description: "User role updated successfully",
      })
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="space-y-4 p-6 rounded-lg bg-gradient-to-br from-[#d64343] to-[#c11717] text-white">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <p className="text-gray-300">
        {users.length === 0 ? "No users found" : `Showing ${users.length} users (for testing only)`}
      </p>
      {isLoading && <p className="text-gray-300">Loading users...</p>}
      {users.map((user) => (
        <Card
          key={user.id}
          className="overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg"
        >
          <CardContent className="p-4">
            <div className="flex sm:justify-between justify-start items-start flex-col sm:flex-row sm:items-center">
              <div>
                <h3 className="font-semibold text-white">{user.name}</h3>
                <p className="text-sm text-gray-300">{user.email}</p>
              </div>
              <Select
                defaultValue={user.role}
                onValueChange={(newRole) => handleUpdateUserRole(user.id, newRole)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[180px] bg-white bg-opacity-20 text-white border-white border-opacity-30">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="CLASS_REP">Class Representative</SelectItem>
                  <SelectItem value="LECTURER">Lecturer</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}
    </Card>
  )
}

