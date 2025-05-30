import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Agent from "@/models/Agent"
import TaskDistribution from "@/models/TaskDistribution"
import { getUserFromRequest } from "@/lib/auth"
import * as XLSX from "xlsx"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only CSV, XLS, and XLSX files are allowed." },
        { status: 400 },
      )
    }

    // Read file content
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    // Validate required columns
    if (data.length === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 })
    }

    const requiredColumns = ["FirstName", "Phone", "Notes"]
    const firstRow = data[0] as any
    const missingColumns = requiredColumns.filter((col) => !(col in firstRow))

    if (missingColumns.length > 0) {
      return NextResponse.json({ error: `Missing required columns: ${missingColumns.join(", ")}` }, { status: 400 })
    }

    // Get active agents
    const agents = await Agent.find({
      createdBy: user.userId,
      isActive: true,
    }).select("-password")

    if (agents.length === 0) {
      return NextResponse.json({ error: "No active agents found. Please create agents first." }, { status: 400 })
    }

    // Distribute tasks
    const tasksPerAgent = Math.floor(data.length / agents.length)
    const remainderTasks = data.length % agents.length

    const distributions = []
    let taskIndex = 0

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i]
      const taskCount = tasksPerAgent + (i < remainderTasks ? 1 : 0)
      const agentTasks = data.slice(taskIndex, taskIndex + taskCount)

      const distribution = new TaskDistribution({
        agentId: agent._id,
        agentName: agent.name,
        agentEmail: agent.email,
        tasks: agentTasks,
        assignedBy: user.userId,
        totalTasks: taskCount,
        fileName: file.name,
        fileSize: file.size,
        status: "pending",
      })

      distributions.push(distribution)
      taskIndex += taskCount
    }

    // Save distributions to database
    await TaskDistribution.insertMany(distributions)

    return NextResponse.json({
      message: "Tasks distributed successfully",
      totalTasks: data.length,
      totalAgents: agents.length,
      fileName: file.name,
      fileSize: file.size,
      distributions: distributions.map((d) => ({
        agentName: d.agentName,
        agentEmail: d.agentEmail,
        taskCount: d.totalTasks,
        status: d.status,
      })),
    })
  } catch (error) {
    console.error("Upload error:", error)

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: validationErrors.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
