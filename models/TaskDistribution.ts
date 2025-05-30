import mongoose, { type Document, Schema } from "mongoose"

export interface ITask {
  FirstName: string
  Phone: string
  Notes: string
}

export interface ITaskDistribution extends Document {
  agentId: mongoose.Types.ObjectId
  agentName: string
  agentEmail: string
  tasks: ITask[]
  assignedBy: mongoose.Types.ObjectId
  assignedAt: Date
  totalTasks: number
  status: "pending" | "in-progress" | "completed"
  completedTasks: number
  fileName: string
  fileSize: number
}

const TaskSchema = new Schema<ITask>(
  {
    FirstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [100, "First name cannot exceed 100 characters"],
    },
    Phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
    },
    Notes: {
      type: String,
      required: [true, "Notes are required"],
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  { _id: false },
)

const TaskDistributionSchema = new Schema<ITaskDistribution>(
  {
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
    agentName: {
      type: String,
      required: [true, "Agent name is required"],
      trim: true,
    },
    agentEmail: {
      type: String,
      required: [true, "Agent email is required"],
      lowercase: true,
      trim: true,
    },
    tasks: {
      type: [TaskSchema],
      required: true,
      validate: {
        validator: (tasks: ITask[]) => tasks.length > 0,
        message: "At least one task is required",
      },
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    totalTasks: {
      type: Number,
      required: true,
      min: [1, "Total tasks must be at least 1"],
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    completedTasks: {
      type: Number,
      default: 0,
      min: [0, "Completed tasks cannot be negative"],
    },
    fileName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },
    fileSize: {
      type: Number,
      required: [true, "File size is required"],
      min: [0, "File size cannot be negative"],
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better performance
TaskDistributionSchema.index({ agentId: 1 })
TaskDistributionSchema.index({ assignedBy: 1 })
TaskDistributionSchema.index({ assignedAt: -1 })
TaskDistributionSchema.index({ status: 1 })
TaskDistributionSchema.index({ agentEmail: 1 })

// Compound indexes
TaskDistributionSchema.index({ assignedBy: 1, assignedAt: -1 })
TaskDistributionSchema.index({ agentId: 1, status: 1 })

// Virtual for completion percentage
TaskDistributionSchema.virtual("completionPercentage").get(function () {
  return this.totalTasks > 0 ? Math.round((this.completedTasks / this.totalTasks) * 100) : 0
})

// Ensure virtual fields are serialized
TaskDistributionSchema.set("toJSON", { virtuals: true })
TaskDistributionSchema.set("toObject", { virtuals: true })

export default mongoose.models.TaskDistribution ||
  mongoose.model<ITaskDistribution>("TaskDistribution", TaskDistributionSchema)
