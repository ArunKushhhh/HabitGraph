import mongoose, { Document, Schema } from "mongoose";

export interface IHabit extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  targetDays: number[]; // 0-6 for Sun-Sat, empty array = daily
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const habitSchema = new Schema<IHabit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Habit name is required"],
      trim: true,
      maxlength: [50, "Habit name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    color: {
      type: String,
      required: [true, "Color is required"],
      match: [/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color"],
      default: "#3b82f6",
    },
    icon: {
      type: String,
      trim: true,
    },
    targetDays: {
      type: [Number],
      default: [], // Empty = every day
      validate: {
        validator: function (v: number[]) {
          return v.every((day) => day >= 0 && day <= 6);
        },
        message: "Target days must be between 0 (Sunday) and 6 (Saturday)",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
habitSchema.index({ userId: 1, isActive: 1, order: 1 });

const Habit = mongoose.model<IHabit>("Habit", habitSchema);

export default Habit;
