import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  console.log("1. Starting DELETE handler");
  console.log("2. Initial params:", params);

  return Promise.resolve(params)
    .then(async resolvedParams => {
      console.log("3. Resolved params:", resolvedParams);
      const id = resolvedParams.id;
      console.log("4. Extracted ID:", id);

      if (!id) {
        console.log("5. No ID provided");
        throw new Error("Room ID is required");
      }

      const roomId = parseInt(id);
      console.log("6. Parsed roomId:", roomId);

      if (isNaN(roomId)) {
        console.log("7. Invalid roomId format");
        throw new Error("Invalid room ID format");
      }

      console.log("8. Checking if room exists");
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          bookings: true,
          maintenance: true
        }
      });
      console.log("9. Room lookup result:", room);
      if (!room) {
        console.log("10. Room not found");
        throw new Error("Room not found");
      }
      console.log("11. Deleting related records");
      // Delete all related records first
      await prisma.$transaction([
        // Delete all related bookings
        prisma.booking.deleteMany({
          where: { roomId }
        }),
        // Delete all related maintenance records
        prisma.maintenance.deleteMany({
          where: { roomId }
        }),
        // Finally delete the room
        prisma.room.delete({
          where: { id: roomId }
        })
      ]);
      return await {
        success: true,
        deletedRoom: room
      };
    })
    .then(result => {
      console.log("12. Operation completed successfully:", result);
      return NextResponse.json({
        message: "Room and all related records deleted successfully",
        data: result.deletedRoom
      }, { status: 200 });
    })
    .catch(error => {
      console.error("13. Error in DELETE handler:", error);
      console.error("14. Error stack:", error.stack);
      
      let statusCode = 500;
      if (error.message === "Room ID is required") statusCode = 400;
      if (error.message === "Invalid room ID format") statusCode = 400;
      if (error.message === "Room not found") statusCode = 404;

      console.log("15. Sending error response with status:", statusCode);
      return NextResponse.json({
        error: error.message,
        message: "Failed to delete room"
      }, { status: statusCode });
    });
}


export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  console.log("1. Starting PATCH handler");
  console.log("2. Initial params:", params);

  return Promise.resolve(params)
    .then(async (resolvedParams) => {
      console.log("3. Resolved params:", resolvedParams);
      const id = resolvedParams.id;
      console.log("4. Extracted ID:", id);

      const roomId = parseInt(id);
      console.log("5. Parsed roomId:", roomId);

      if (isNaN(roomId)) {
        console.log("6. Invalid roomId format");
        throw new Error("Invalid room ID format");
      }

      console.log("7. Parsing request body");
      const body = await req.json();
      console.log("8. Request body:", body);

      const statusSchema = z.object({
        status: z.enum(["VACANT", "BOOKED", "MAINTENANCE"]),
      });

      console.log("9. Validating status");
      const { status } = statusSchema.parse(body);
      console.log("10. Validated status:", status);

      console.log("11. Updating room");
      return prisma.room.update({
        where: { id: roomId },
        data: { status },
      });
    })
    .then(updatedRoom => {
      console.log("12. Room updated successfully:", updatedRoom);
      return NextResponse.json({
        message: "Room status updated successfully",
        data: updatedRoom
      }, { status: 200 });
    })
    .catch(error => {
      console.error("13. Error in PATCH handler:", error);
      console.error("14. Error stack:", error.stack);

      let statusCode = 500;
      if (error.message === "Invalid room ID format") statusCode = 400;
      if (error instanceof z.ZodError) statusCode = 400;
      
      console.log("15. Sending error response with status:", statusCode);
      return NextResponse.json({
        error: error instanceof z.ZodError ? error.errors : error.message,
        message: "Failed to update room status"
      }, { status: statusCode });
    });
}
