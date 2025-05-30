import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { hashPassword } from "@/lib/auth"

export async function POST() {
  try {
    await connectDB()

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@example.com" })

    if (existingAdmin) {
      return NextResponse.json({ error: "Admin user already exists" }, { status: 400 })
    }

    // Create admin user
    const hashedPassword = await hashPassword("admin123")

    const adminUser = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    })

    await adminUser.save()

    return NextResponse.json({
      message: "Admin user created successfully",
      credentials: {
        email: "admin@example.com",
        password: "admin123",
      },
    })
  } catch (error) {
    console.error("Init admin error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
