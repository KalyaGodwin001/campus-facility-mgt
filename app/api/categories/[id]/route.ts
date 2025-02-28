import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

// GET /api/categories/[id]
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const categoryId = Number.parseInt((await props.params).id)

    if (isNaN(categoryId)) {
      return NextResponse.json({
        message: "Invalid category ID",
        status: 400,
        error: "Category ID must be a number",
      })
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        rooms: {
          include: {
            bookings: {
              where: {
                endTime: {
                  gte: new Date(),
                },
              },
              orderBy: {
                startTime: "asc",
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({
        message: "Category not found",
        status: 404,
        error: "Category not found",
      })
    }

    return NextResponse.json({
      message: "Category retrieved successfully",
      status: 200,
      data: category,
    })
  } catch (error) {
    console.error("Get category error:", error)
    return NextResponse.json({
      message: "An error occurred while fetching the category",
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    })
  }
}

// PUT /api/categories/[id]
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const categoryId = Number.parseInt((await props.params).id)
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid category ID format" }, { status: 400 })
    }

    const body = await req.json()

    const categorySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
    })

    const categoryData = categorySchema.parse(body)

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: categoryData,
    })

    return NextResponse.json(
      {
        message: "Category updated successfully",
        data: updatedCategory,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error in PUT handler:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

// DELETE /api/categories/[id]
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const categoryId = Number.parseInt((await props.params).id)
    if (isNaN(categoryId)) {
      return NextResponse.json({
        message: "Invalid category ID",
        status: 400,
        error: "Category ID must be a number",
      })
    }

    // Delete all associated records in a transaction

     // Single transaction to delete category and associated records
     await prisma.$transaction(async (tx) => {
      // Delete all associated records
      await Promise.all([
        tx.booking.deleteMany({
          where: {
            room: {
              categoryId: categoryId
            }
          }
        }),
        tx.maintenance.deleteMany({
          where: {
            room: {
              categoryId: categoryId
            }
          }
        }),
        tx.room.deleteMany({
          where: {
            categoryId: categoryId
          }
        }),
        tx.category.delete({
          where: {
            id: categoryId
          }
        })
      ]);
    });
    return NextResponse.json({
      message: "Category deleted successfully",
      status: 200,
      data: null,
    })
  } catch (error) {
    console.error("Delete category error:", error)
    return NextResponse.json({
      message: "An error occurred while deleting the category",
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    })
  }
}

