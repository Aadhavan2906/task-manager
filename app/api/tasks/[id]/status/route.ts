import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TaskDistribution from "@/models/TaskDistribution"
import { getUserFromRequest } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status, completedTasks } = await request.json()

    if (!status || !["pending", "in-progress", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be pending, in-progress, or completed" }, { status: 400 })
    }

    const taskDistribution = await TaskDistribution.findOne({
      _id: params.id,
      agentEmail: user.email,
    })

    if (!taskDistribution) {
      return NextResponse.json({ error: "Task distribution not found or unauthorized" }, { status: 404 })
    }

    // Update status and completed tasks
    taskDistribution.status = status
    if (completedTasks !== undefined) {
      taskDistribution.completedTasks = Math.min(completedTasks, taskDistribution.totalTasks)
    }

    await taskDistribution.save()

    return NextResponse.json({
      message: "Task status updated successfully",
      taskDistribution,
    })
  } catch (error) {
    console.error("Update task status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
