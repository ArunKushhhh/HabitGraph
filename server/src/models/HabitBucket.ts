import mongoose, { Document, Schema } from "mongoose";

export interface IHabitBucket extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  habitId: mongoose.Types.ObjectId;
  month: string; // Format: "2025-12"
  days: Map<string, boolean>; // { "01": true, "02": false, ... }
  stats: {
    completed: number;
    total: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const habitBucketSchema = new Schema<IHabitBucket>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    habitId: {
      type: Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
    },
    month: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"],
    },
    days: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },
    stats: {
      completed: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index for O(1) lookups - one bucket per habit per month per user
habitBucketSchema.index({ userId: 1, habitId: 1, month: 1 }, { unique: true });

// Index for fetching all buckets for a user in a month (dashboard query)
habitBucketSchema.index({ userId: 1, month: 1 });

const HabitBucket = mongoose.model<IHabitBucket>(
  "HabitBucket",
  habitBucketSchema
);

export default HabitBucket;
