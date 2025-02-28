import React from 'react';
import  { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

import type { Booking, Room } from "@prisma/client";

interface RoomStatusManagerProps {

  room: Room;

  bookings: Booking[];

  onStatusChange: (updatedRoom: Room) => void;

}

interface RoomStatusManagerProps {
  room: Room;
  bookings: Booking[];
  onStatusChange: (updatedRoom: Room) => void;
}

const RoomStatusManager: React.FC<RoomStatusManagerProps> = ({ room, bookings, onStatusChange }) => {
  const isBookingExpired = (booking: Booking): boolean => {
    const endTime = new Date(booking.endTime);
    return endTime < new Date();
  };

  const getCurrentBooking = (): Booking | undefined => {
    const now = new Date();
    return bookings.find(booking => {
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      return booking.roomId === room.id && 
             booking.status === 'approved' && 
             startTime <= now && 
             endTime >= now;
    });
  };

  const handleStatusChange = async (newStatus: string) => {
    const currentBooking = getCurrentBooking();
    
    // Check if room is currently booked
    if (room.status === 'BOOKED' && currentBooking && !isBookingExpired(currentBooking)) {
      if (newStatus === 'MAINTENANCE') {
        if (!confirm('This room is currently booked. Setting it to maintenance will affect current bookings. Continue?')) {
          return;
        }
      } else if (newStatus === 'VACANT') {
        toast({
          title: "Cannot change status",
          description: "Room has an active booking",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      const response = await fetch(`/api/rooms/admin/rooms/${room.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update room status');
      }

      const updatedRoom = await response.json();
      onStatusChange(updatedRoom.data);

      toast({
        title: 'Success',
        description: 'Room status updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: (error instanceof Error) ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  };

  return (
    <Select
      value={room.status}
      onValueChange={handleStatusChange}
      disabled={room.status === 'BOOKED' && getCurrentBooking() && !isBookingExpired(getCurrentBooking() as Booking)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Update status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="VACANT">Vacant</SelectItem>
        <SelectItem value="BOOKED">Booked</SelectItem>
        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default RoomStatusManager;