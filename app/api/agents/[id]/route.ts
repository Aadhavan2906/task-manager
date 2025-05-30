import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Agent from "@/models/Agent"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const agent = await Agent.findOne({
      _id: params.id,
      createdBy: user.userId,
    }).select("-password")

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json({ agent })
  } catch (error) {
    console.error("Get agent error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, mobile, isActive } = await request.json()

    const agent = await Agent.findOneAndUpdate(
      {
        _id: params.id,
        createdBy: user.userId,
      },
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(mobile && { mobile }),
        ...(isActive !== undefined && { isActive }),
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password")

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Agent updated successfully",
      agent,
    })
  } catch (error) {
    console.error("Update agent error:", error)

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: validationErrors.join(", ") }, { status: 400 })
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({ error: "Agent with this email already exists" }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Soft delete by setting isActive to false
    const agent = await Agent.findOneAndUpdate(
      {
        _id: params.id,
        createdBy: user.userId,
      },
      { isActive: false },
      { new: true },
    ).select("-password")

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Agent deactivated successfully",
      agent,
    })
  } catch (error) {
    console.error("Delete agent error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
