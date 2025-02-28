// In UserModal.tsx

import type React from "react"
import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Eye, EyeOff, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UserModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  isLoading: boolean
  newUser: { name: string; email: string; role: string }
  setNewUser: (user: { name: string; email: string; role: string }) => void
  handleCreateUser: (e: FormEvent) => Promise<{ temporaryPassword?: string }>
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onOpenChange,
  isLoading,
  newUser,
  setNewUser,
  handleCreateUser,
}) => {
  const [temporaryPassword, setTemporaryPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  console.log("UserModal rendered, isOpen:", isOpen)

  if (!isOpen) {
    console.log("UserModal not shown because isOpen is false")
    return null
  }

  console.log("UserModal is open and being rendered")

  const onSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    const response = await handleCreateUser(e)
    if (response?.temporaryPassword) {
      setTemporaryPassword(response.temporaryPassword)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white relative">
          <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>

          <CardHeader>
            <CardTitle>Create New User</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="John Doe"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger id="role" className="w-full">
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

              {temporaryPassword && (
                <div className="space-y-2">
                  <Label htmlFor="tempPassword">Temporary Password</Label>
                  <div className="relative">
                    <Input
                      id="tempPassword"
                      type={showPassword ? "text" : "password"}
                      value={temporaryPassword}
                      readOnly
                      className="w-full pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating User...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UserModal

