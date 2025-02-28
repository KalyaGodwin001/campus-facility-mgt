/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect, useRef } from "react"
import type { User, RoomStatus } from "@prisma/client"
import { uploadToCloudinary } from "@/lib/cloudinary-client"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2,
  Plus,
  Users,
  BookOpen,
  Home,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FolderTree,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import RoomStatusManager from "./RoomStatusManager"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import Link from "next/link"

interface Booking {
  id: number
  status: string
  roomId: number
  createdAt: Date
  updatedAt: Date
  startTime: Date
  endTime: Date
  purpose: string
  userId: number
}

interface Room {
  id: number
  name: string
  status: RoomStatus
  createdAt: Date
  updatedAt: Date
  capacity: number
  features: string[]
  floor: number
  building: string
  imageUrl: string | null
  categoryId: number
}

interface Category {
  id: number
  name: string
}

interface AdminDashboardProps {
  user: User
  initialRooms?: Room[]
  initialBookings: Booking[]
}
interface CategoryWithImage extends Category {
  imageUrl?: string
}
export default function AdminDashboard({ user, initialRooms = [], initialBookings }: AdminDashboardProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState("rooms")
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const roomFormRef = useRef<HTMLFormElement>(null)
  const [categories, setCategories] = useState<CategoryWithImage[]>([])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingCategory, setEditingCategory] = useState<CategoryWithImage | null>(null)
  const [categoryImage, setCategoryImage] = useState<File | null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  useEffect(() => {
    console.log("Initial Rooms:", initialRooms)
    console.log("Initial Bookings:", initialBookings)
    setRooms(initialRooms || [])
    setBookings(initialBookings)
    fetchUsers()
    fetchCategories()
  }, [initialRooms, initialBookings])

  useEffect(() => {
    console.log("Rooms Loaded:", rooms)
    console.log("Bookings Loaded:", bookings)
  }, [rooms, bookings])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data.users)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    }
  }

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/categories")
      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }
      const data = await response.json()
      setCategories(data.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}`, {
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

  const handleBookingStatusChange = async (bookingId: number, newStatus: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update booking status")
      }

      const updatedBooking = await response.json()
      setBookings(bookings?.map((booking) => (booking.id === updatedBooking.id ? updatedBooking : booking)))

      // If the booking is approved, update the room status to BOOKED
      if (newStatus === "approved") {
        const roomToUpdate = rooms.find((room) => room.id === updatedBooking.roomId)
        if (roomToUpdate) {
          const updatedRoom = { ...roomToUpdate, status: "BOOKED" as RoomStatus }
          setRooms(rooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room)))
        }
      }

      toast({
        title: "Success",
        description: "Booking status updated successfully",
      })
    } catch (error) {
      console.error("Error updating booking status:", error)
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  const handleCreateRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const imageFile = formData.get("image") as File
      const categoryId = formData.get("categoryId") as string

      let imageUrl = ""
      if (imageFile && imageFile.size > 0) {
        imageUrl = await uploadToCloudinary(imageFile)
      }

      const roomData = {
        name: formData.get("name") as string,
        capacity: Number(formData.get("capacity")),
        features: (formData.get("features") as string).split(",").map((f) => f.trim()),
        floor: Number(formData.get("floor")),
        building: formData.get("building") as string,
        imageUrl,
        status: "VACANT" as RoomStatus,
        categoryId: Number.parseInt(categoryId),
      }

      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create room")
      }

      const { room } = responseData
      setRooms([...rooms, room])
      toast({
        title: "Success",
        description: "Room created successfully",
      })

      roomFormRef.current?.reset()
      setIsRoomModalOpen(false)
    } catch (error) {
      console.error("Error creating room:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create room",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRoom = async (roomId: number) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/rooms/admin/rooms/${roomId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete room")

      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId))
      toast({
        title: "Success",
        description: "Room deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting room:", error)
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      const formData = new FormData(event.currentTarget)
      const roomData = {
        name: formData.get("name") as string,
        capacity: Number(formData.get("capacity")),
        features: (formData.get("features") as string).split(",").map((f) => f.trim()),
        floor: Number(formData.get("floor")),
        building: formData.get("building") as string,
        categoryId: Number.parseInt(formData.get("categoryId") as string),
      }
      const response = await fetch(`/api/rooms/${editingRoom?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomData),
      })
      if (!response.ok) {
        throw new Error("Failed to update room")
      }
      const updatedRoom = await response.json()
      setRooms(rooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room)))
      toast({
        title: "Success",
        description: "Room updated successfully",
      })
      return true
    } catch (error) {
      console.error("Error updating room:", error)
      toast({
        title: "Error",
        description: "Failed to update room",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName) return

    const formData = new FormData()
    formData.append("name", newCategoryName)
    if (categoryImage) {
      formData.append("image", categoryImage)
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/categories", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      if (response.ok) {
        toast({ title: "Category created successfully" })
        setNewCategoryName("")
        setCategoryImage(null)
        await fetchCategories()
      } else {
        throw new Error(data.error || "Failed to create category")
      }
    } catch (error) {
      console.error("Error creating category:", error)
      toast({ title: "Failed to create category", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    const formData = new FormData()
    formData.append("id", editingCategory.id.toString())
    formData.append("name", editingCategory.name)
    if (categoryImage) {
      formData.append("image", categoryImage)
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/categories", {
        method: "PATCH",
        body: formData,
      })
      const data = await response.json()
      if (response.ok) {
        toast({ title: "Category updated successfully" })
        setEditingCategory(null)
        setCategoryImage(null)
        await fetchCategories()
      } else {
        throw new Error(data.error || "Failed to update category")
      }
    } catch (error) {
      console.error("Error updating category:", error)
      toast({ title: "Failed to update category", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category deleted successfully",
        })
        await fetchCategories()
      } else {
        throw new Error("Failed to delete category")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const RoomModal = () => (
    <Dialog open={isRoomModalOpen} onOpenChange={setIsRoomModalOpen}>
      <DialogContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle>Create New Room</DialogTitle>
          </DialogHeader>
          <form ref={roomFormRef} onSubmit={handleCreateRoom} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Room Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" name="capacity" type="number" min="1" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Input id="floor" name="floor" type="number" min="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="building">Building</Label>
                <Input id="building" name="building" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Input id="features" name="features" placeholder="e.g. projector, whiteboard, ac" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Room Image</Label>
              <Input id="image" name="image" type="file" accept="image/*" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="categoryId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories &&
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Room...
                  </>
                ) : (
                  "Create Room"
                )}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )

  const EditRoomModal = () => {
    const [isSaving, setIsSaving] = useState(false)

    const handleEditRoomSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setIsSaving(true)
      try {
        await handleEditRoom(event)
        setIsEditModalOpen(false)
      } finally {
        setIsSaving(false)
      }
    }

    return (
      <>
       {isSaving && <div className="fixed inset-0 bg-black bg-opacity-50 z-auto flex items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-white" /></div>}
         <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditRoomSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" name="name" defaultValue={editingRoom?.name} disabled={isSaving} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Capacity</Label>
              <Input
                id="edit-capacity"
                name="capacity"
                type="number"
                defaultValue={editingRoom?.capacity}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-features">Features</Label>
              <Input
                id="edit-features"
                name="features"
                defaultValue={editingRoom?.features?.join(", ")}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-floor">Floor</Label>
              <Input id="edit-floor" name="floor" type="number" defaultValue={editingRoom?.floor} disabled={isSaving} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-building">Building</Label>
              <Input id="edit-building" name="building" defaultValue={editingRoom?.building} disabled={isSaving} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select name="categoryId" defaultValue={editingRoom?.categoryId?.toString()} disabled={isSaving}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </>
    
    )
  }

  const CategoryModal = () => (
    <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
      <DialogContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Create New Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={editingCategory ? handleEditCategory : handleCreateCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input id="name" name="name" required defaultValue={editingCategory?.name} />
            </div>
            {/* image */}
            <div className="space-y-2">
              <Label htmlFor="image">Category Image</Label>
              <Input id="image" name="image" type="file" accept="image/*" />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingCategory ? "Updating Category..." : "Creating Category..."}
                  </>
                ) : editingCategory ? (
                  "Update Category"
                ) : (
                  "Create Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#800000] p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-base md:text-lg text-white/90 mt-1">Welcome, {user.name}</p>
          </div>
          <Link href="/">
            <Button variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>

          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {["rooms", "bookings", "users", "categories"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`p-4 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center gap-2
                    ${
                      activeTab === tab
                        ? "bg-[#800000] text-white border-[#800000]"
                        : "bg-white border-gray-200 text-gray-700 hover:border-[#800000] hover:text-[#800000]"
                    }
                  `}
                >
                  {tab === "rooms" && <Home className="w-5 h-5" />}
                  {tab === "bookings" && <BookOpen className="w-5 h-5" />}
                  {tab === "users" && <Users className="w-5 h-5" />}
                  {tab === "categories" && <FolderTree className="w-5 h-5" />}
                  <span className="text-sm font-medium capitalize">{tab}</span>
                </button>
              ))}
            </div>
            <div className="mt-6">
              {activeTab === "rooms" && (
                <div>
                  <div className="space-y-6">
                    <Button
                      onClick={() => setIsRoomModalOpen(true)}
                      className="bg-[#800000] text-white hover:bg-[#600000] w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Room
                    </Button>
                    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {rooms &&
                        rooms.map((room, index) => (
                          <motion.div
                            key={room.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                              <CardContent className="p-4">
                                {room.imageUrl && (
                                  <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                                    <Image
                                      src={room.imageUrl || "/placeholder.svg"}
                                      alt={room.name}
                                      className="object-cover"
                                      fill
                                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                  </div>
                                )}
                                <h3 className="font-semibold text-lg mb-2 text-[#800000]">{room.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Capacity: {room.capacity}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  Location: Floor {room.floor}, {room.building}
                                </p>
                                {room.features && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                    Features: {room.features.join(", ")}
                                  </p>
                                )}

                                <div className="flex items-center justify-between mt-4">
                                  <div className="flex items-center space-x-2">
                                    {room.status === "VACANT" && <CheckCircle className="text-green-500" size={20} />}
                                    {room.status === "BOOKED" && <XCircle className="text-red-500" size={20} />}
                                    {room.status === "MAINTENANCE" && (
                                      <AlertTriangle className="text-yellow-500" size={20} />
                                    )}
                                    <span className="text-sm font-medium">{room.status}</span>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setEditingRoom(room)
                                        setIsEditModalOpen(true)
                                      }}
                                      className="border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the room.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteRoom(room.id)}>
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <RoomStatusManager
                                    room={room}
                                    bookings={bookings}
                                    onStatusChange={(updatedRoom: Room) => {
                                      setRooms(rooms.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)))
                                    }}
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      {rooms?.length === 0 && (
                        <motion.div layout className="col-span-3 flex items-center justify-center text-gray-500">
                          No rooms found
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </div>
              )}

              {activeTab === "bookings" && (
                <div>
                  {bookings && bookings.length > 0 ? (
                    bookings.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                          <CardContent className="p-4">
                            <div className="flex flex-col justify-start items-start  gap-4">
                              <div className="space-y-1">
                                <p className="font-semibold text-lg">
                                  Room: {rooms.find((r) => r.id === booking.roomId)?.name || booking.roomId}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {new Date(booking.startTime).toLocaleString()}
                                  {" → "}
                                  {new Date(booking.endTime).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600">Purpose: {booking.purpose}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Select
                                  defaultValue={booking.status}
                                  onValueChange={(value) => handleBookingStatusChange(booking.id, value)}
                                  disabled={isLoading}
                                >
                                  <SelectTrigger className="min-w-[140px] bg-white">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      layout
                      className="flex items-center justify-center text-gray-500 min-h-[100px] text-center w-full"
                    >
                      No bookings found
                    </motion.div>
                  )}
                </div>
              )}

              {activeTab === "users" && (
                <div>
                  <div className="grid gap-4">
                    {users &&
                      users.map((user) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: 0 }}
                        >
                          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-[#800000]">{user.name}</h3>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                              <Select
                                defaultValue={user.role}
                                onValueChange={(newRole) => handleUpdateUserRole(user.id, newRole)}
                              >
                                <SelectTrigger className="w-full sm:w-[180px] bg-white">
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
                          </div>
                        </motion.div>
                      ))}
                    {users?.length === 0 && (
                      <motion.div layout className="flex items-center justify-center text-gray-500">
                        No users found
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "categories" && (
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Schools</CardTitle>
                      <CardDescription>ManageSchools</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreateCategory} className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                          <Label htmlFor="categoryName">School Name</Label>
                          <Input
                            type="text"
                            id="categoryName"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Enter category name"
                          />{" "}
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                          <Label htmlFor="categoryImage">School Image</Label>
                          <Input
                            type="file"
                            id="categoryImage"
                            accept="image/*"
                            onChange={(e) => setCategoryImage(e.target.files?.[0] || null)}
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="bg-[#800000] text-white hover:bg-[#600000] w-full sm:w-auto"
                        >
                          {isLoading ? "Creating..." : "Create Category"}
                        </Button>
                      </form>
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Existing Schools</h3>
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 space-y-2 sm:space-y-0"
                          >
                            <div className="flex items-center space-x-2">
                              <Avatar>
                                <AvatarImage src={category.imageUrl || undefined} />
                                <AvatarFallback>{category.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span>{category.name}</span>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => setEditingCategory(category)}
                                className="bg-[#800000] text-white hover:bg-[#600000] w-full sm:w-auto"
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleDeleteCategory(category.id)}
                                variant="destructive"
                                className="w-full sm:w-auto"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  {editingCategory && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>Edit School</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleEditCategory} className="space-y-4">
                          <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="editCategoryName">School Name</Label>
                            <Input
                              type="text"
                              id="editCategoryName"
                              value={editingCategory.name}
                              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                            />
                          </div>
                          <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="editCategoryImage">School Image</Label>
                            <Input
                              type="file"
                              id="editCategoryImage"
                              accept="image/*"
                              onChange={(e) => setCategoryImage(e.target.files?.[0] || null)}
                            />
                          </div>
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            <Button
                              type="submit"
                              disabled={isLoading}
                              className="bg-[#800000] text-white hover:bg-[#600000] w-full sm:w-auto"
                            >
                              {isLoading ? "Updating..." : "Update Category"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setEditingCategory(null)}
                              className="w-full sm:w-auto"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <RoomModal />
      <EditRoomModal />
      <CategoryModal />
    </div>
  )
}

