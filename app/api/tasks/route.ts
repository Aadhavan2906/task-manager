import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TaskDistribution from "@/models/TaskDistribution"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get tasks assigned by current user
    const assignedTasks = await TaskDistribution.find({
      assignedBy: user.userId,
    })
      .sort({ assignedAt: -1 })
      .populate("agentId", "name email mobile")

    // Get tasks assigned to current user (if they are an agent)
    const receivedTasks = await TaskDistribution.find({
      agentEmail: user.email,
    })
      .sort({ assignedAt: -1 })
      .populate("assignedBy", "name email")

    return NextResponse.json({
      assignedTasks,
      receivedTasks,
    })
  } catch (error) {
    console.error("Get tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
