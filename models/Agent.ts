import mongoose, { type Document, Schema } from "mongoose"

export interface IAgent extends Document {
  name: string
  email: string
  mobile: string
  password: string
  createdBy: mongoose.Types.ObjectId
  role: "agent" | "sub-agent"
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const AgentSchema = new Schema<IAgent>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      maxlength: [20, "Mobile number cannot exceed 20 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["agent", "sub-agent"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better performance
AgentSchema.index({ email: 1 })
AgentSchema.index({ createdBy: 1 })
AgentSchema.index({ role: 1 })
AgentSchema.index({ isActive: 1 })

// Compound index for efficient queries
AgentSchema.index({ createdBy: 1, isActive: 1 })

export default mongoose.models.Agent || mongoose.model<IAgent>("Agent", AgentSchema)
