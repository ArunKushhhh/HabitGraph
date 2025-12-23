import { Router, Response, NextFunction } from "express";
import { format } from "date-fns";
import HabitBucket from "../models/HabitBucket";
import Habit from "../models/Habit";
import { validate } from "../middleware/validate";
import { toggleCheckinSchema } from "../schemas/checkin.schema";
import { AuthRequest, protect } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";

const router = Router();

// All routes require authentication
router.use(protect);

// PATCH /api/checkin/toggle - Toggle habit status for a specific date
router.patch(
  "/toggle",
  validate(toggleCheckinSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { habitId, date, status } = req.body;
      const userId = req.user?._id;

      // Verify the habit belongs to the user
      const habit = await Habit.findOne({
        _id: habitId,
        userId,
        isActive: true,
      });
      if (!habit) {
        throw new ApiError("Habit not found", 404);
      }

      // Parse date to get month (YYYY-MM) and day (DD)
      const parsedDate = new Date(date);
      const month = format(parsedDate, "yyyy-MM");
      const day = format(parsedDate, "dd");

      // Find or create bucket for this habit/month
      let bucket = await HabitBucket.findOne({ userId, habitId, month });

      if (!bucket) {
        // Create new bucket (lazy creation)
        bucket = new HabitBucket({
          userId,
          habitId,
          month,
          days: new Map([[day, status]]),
          stats: {
            completed: status ? 1 : 0,
            total: 1,
          },
        });
        await bucket.save();
      } else {
        // Update existing bucket
        const previousStatus = bucket.days.get(day);
        const wasCompleted = previousStatus === true;
        const isNowCompleted = status === true;

        // Update the day status using $set
        bucket.days.set(day, status);

        // Update stats
        if (!previousStatus && previousStatus !== false) {
          // New entry
          bucket.stats.total += 1;
          if (isNowCompleted) {
            bucket.stats.completed += 1;
          }
        } else {
          // Existing entry, update completed count
          if (wasCompleted && !isNowCompleted) {
            bucket.stats.completed -= 1;
          } else if (!wasCompleted && isNowCompleted) {
            bucket.stats.completed += 1;
          }
        }

        await bucket.save();
      }

      res.json({
        success: true,
        message: `Habit ${status ? "completed" : "uncompleted"} for ${date}`,
        data: {
          habitId,
          date,
          status,
          stats: bucket.stats,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/checkin/today - Get today's check-in status for all habits
router.get(
  "/today",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const today = new Date();
      const month = format(today, "yyyy-MM");
      const day = format(today, "dd");

      // Get all active habits
      const habits = await Habit.find({ userId, isActive: true }).sort({
        order: 1,
      });

      // Get all buckets for this month
      const buckets = await HabitBucket.find({ userId, month });
      const bucketMap = new Map(buckets.map((b) => [b.habitId.toString(), b]));

      // Build response with status for each habit
      const habitsWithStatus = habits.map((habit) => {
        const bucket = bucketMap.get(habit._id.toString());
        const status = bucket?.days.get(day) ?? false;

        return {
          _id: habit._id,
          name: habit.name,
          color: habit.color,
          icon: habit.icon,
          completed: status,
        };
      });

      // Calculate daily progress
      const totalHabits = habitsWithStatus.length;
      const completedHabits = habitsWithStatus.filter(
        (h) => h.completed
      ).length;
      const percentage =
        totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

      res.json({
        success: true,
        data: {
          date: format(today, "yyyy-MM-dd"),
          habits: habitsWithStatus,
          progress: {
            completed: completedHabits,
            total: totalHabits,
            percentage,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
