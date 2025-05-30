import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Agent from "@/models/Agent"
import { getUserFromRequest, hashPassword } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const agents = await Agent.find({
      createdBy: user.userId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .select("-password")

    return NextResponse.json({ agents })
  } catch (error) {
    console.error("Get agents error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, mobile, password } = await request.json()

    if (!name || !email || !mobile || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if agent already exists
    const existingAgent = await Agent.findOne({ email })
    if (existingAgent) {
      return NextResponse.json({ error: "Agent with this email already exists" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const agent = new Agent({
      name,
      email,
      mobile,
      password: hashedPassword,
      createdBy: user.userId,
      role: user.role === "admin" ? "agent" : "sub-agent",
    })

    await agent.save()

    // Return agent without password
    const agentResponse = agent.toObject()
    delete agentResponse.password

    return NextResponse.json({
      message: "Agent created successfully",
      agent: agentResponse,
    })
  } catch (error) {
    console.error("Create agent error:", error)

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
