import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Agent from "@/models/Agent"
import TaskDistribution from "@/models/TaskDistribution"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get agent statistics
    const totalAgents = await Agent.countDocuments({
      createdBy: user.userId,
      isActive: true,
    })

    const activeAgents = await Agent.countDocuments({
      createdBy: user.userId,
      isActive: true,
    })

    // Get task distribution statistics
    const taskDistributions = await TaskDistribution.find({
      assignedBy: user.userId,
    })

    const totalTasksAssigned = taskDistributions.reduce((sum, dist) => sum + dist.totalTasks, 0)
    const totalDistributions = taskDistributions.length

    // Get task completion statistics
    const completedTasks = taskDistributions.reduce((sum, dist) => sum + dist.completedTasks, 0)
    const completionRate = totalTasksAssigned > 0 ? Math.round((completedTasks / totalTasksAssigned) * 100) : 0

    // Get status breakdown
    const statusBreakdown = await TaskDistribution.aggregate([
      { $match: { assignedBy: user.userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])

    // Get recent activity
    const recentDistributions = await TaskDistribution.find({
      assignedBy: user.userId,
    })
      .sort({ assignedAt: -1 })
      .limit(5)
      .populate("agentId", "name email")

    return NextResponse.json({
      agents: {
        total: totalAgents,
        active: activeAgents,
      },
      tasks: {
        totalAssigned: totalTasksAssigned,
        totalCompleted: completedTasks,
        completionRate,
        totalDistributions,
      },
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {}),
      recentActivity: recentDistributions,
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
