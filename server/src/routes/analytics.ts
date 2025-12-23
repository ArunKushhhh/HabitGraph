import { Router, Response, NextFunction } from "express";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  getDaysInMonth,
} from "date-fns";
import HabitBucket from "../models/HabitBucket";
import Habit from "../models/Habit";
import { AuthRequest, protect } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(protect);

// GET /api/analytics/dashboard - Fetch today's status + this month's data
router.get(
  "/dashboard",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const today = new Date();
      const currentMonth = format(today, "yyyy-MM");
      const todayDay = format(today, "dd");

      // Get all active habits
      const habits = await Habit.find({ userId, isActive: true }).sort({
        order: 1,
      });

      // Get all buckets for current month
      const buckets = await HabitBucket.find({ userId, month: currentMonth });
      const bucketMap = new Map(buckets.map((b) => [b.habitId.toString(), b]));

      // Build habits with today's status
      const habitsWithStatus = habits.map((habit) => {
        const bucket = bucketMap.get(habit._id.toString());
        return {
          _id: habit._id,
          name: habit.name,
          description: habit.description,
          color: habit.color,
          icon: habit.icon,
          targetDays: habit.targetDays,
          completed: bucket?.days.get(todayDay) ?? false,
        };
      });

      // Calculate daily progress
      const totalHabits = habitsWithStatus.length;
      const completedHabits = habitsWithStatus.filter(
        (h) => h.completed
      ).length;

      // Build monthly data for calendar/charts
      const daysInMonth = getDaysInMonth(today);
      const monthlyData: Record<
        string,
        { completed: number; total: number; percentage: number }
      > = {};

      for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = d.toString().padStart(2, "0");
        let dayCompleted = 0;
        let dayTotal = 0;

        habits.forEach((habit) => {
          const bucket = bucketMap.get(habit._id.toString());
          const status = bucket?.days.get(dayStr);
          if (status !== undefined) {
            dayTotal++;
            if (status) dayCompleted++;
          }
        });

        if (dayTotal > 0) {
          monthlyData[dayStr] = {
            completed: dayCompleted,
            total: dayTotal,
            percentage: Math.round((dayCompleted / dayTotal) * 100),
          };
        }
      }

      res.json({
        success: true,
        data: {
          date: format(today, "yyyy-MM-dd"),
          habits: habitsWithStatus,
          progress: {
            completed: completedHabits,
            total: totalHabits,
            percentage:
              totalHabits > 0
                ? Math.round((completedHabits / totalHabits) * 100)
                : 0,
          },
          monthlyData,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/analytics/year - Monthly summaries for the yearly bar chart
router.get(
  "/year",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const today = new Date();
      const currentYear = today.getFullYear();

      // Get all buckets for the current year
      const yearMonths = Array.from(
        { length: 12 },
        (_, i) => `${currentYear}-${(i + 1).toString().padStart(2, "0")}`
      );

      const buckets = await HabitBucket.find({
        userId,
        month: { $in: yearMonths },
      });

      // Aggregate by month
      const monthlyStats: Record<string, { completed: number; total: number }> =
        {};
      yearMonths.forEach((m) => {
        monthlyStats[m] = { completed: 0, total: 0 };
      });

      buckets.forEach((bucket) => {
        const monthStats = monthlyStats[bucket.month];
        if (monthStats) {
          monthStats.completed += bucket.stats.completed;
          monthStats.total += bucket.stats.total;
        }
      });

      // Calculate percentages
      const yearlyData = yearMonths.map((month) => {
        const stats = monthlyStats[month] ?? { completed: 0, total: 0 };
        return {
          month,
          label: format(new Date(month + "-01"), "MMM"),
          completed: stats.completed,
          total: stats.total,
          percentage:
            stats.total > 0
              ? Math.round((stats.completed / stats.total) * 100)
              : 0,
        };
      });

      // Calculate yearly average
      const totalCompleted = yearlyData.reduce(
        (sum, m) => sum + m.completed,
        0
      );
      const totalEntries = yearlyData.reduce((sum, m) => sum + m.total, 0);
      const yearlyAverage =
        totalEntries > 0
          ? Math.round((totalCompleted / totalEntries) * 100)
          : 0;

      res.json({
        success: true,
        data: {
          year: currentYear,
          months: yearlyData,
          yearlyAverage,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/analytics/rings - Per-habit completion percentages for progress rings
router.get(
  "/rings",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;

      // Get all active habits
      const habits = await Habit.find({ userId, isActive: true }).sort({
        order: 1,
      });

      // Get all buckets for all time (or YTD)
      const buckets = await HabitBucket.find({ userId });

      // Group buckets by habit
      const habitStats: Record<string, { completed: number; total: number }> =
        {};
      habits.forEach((h) => {
        habitStats[h._id.toString()] = { completed: 0, total: 0 };
      });

      buckets.forEach((bucket) => {
        const habitId = bucket.habitId.toString();
        if (habitStats[habitId]) {
          habitStats[habitId].completed += bucket.stats.completed;
          habitStats[habitId].total += bucket.stats.total;
        }
      });

      // Build response
      const habitRings = habits.map((habit) => {
        const stats = habitStats[habit._id.toString()] ?? {
          completed: 0,
          total: 0,
        };
        const percentage =
          stats.total > 0
            ? Math.round((stats.completed / stats.total) * 100)
            : 0;

        return {
          _id: habit._id,
          name: habit.name,
          color: habit.color,
          icon: habit.icon,
          completed: stats.completed,
          total: stats.total,
          percentage,
        };
      });

      // Calculate overall average
      const totalCompleted = habitRings.reduce(
        (sum, h) => sum + h.completed,
        0
      );
      const totalEntries = habitRings.reduce((sum, h) => sum + h.total, 0);
      const overallPercentage =
        totalEntries > 0
          ? Math.round((totalCompleted / totalEntries) * 100)
          : 0;

      res.json({
        success: true,
        data: {
          habits: habitRings,
          overall: {
            completed: totalCompleted,
            total: totalEntries,
            percentage: overallPercentage,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/analytics/calendar?month=YYYY-MM - Calendar data for a specific month
router.get(
  "/calendar",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const month =
        (req.query.month as string) || format(new Date(), "yyyy-MM");

      // Validate month format
      if (!/^\d{4}-\d{2}$/.test(month)) {
        res.status(400).json({
          success: false,
          message: "Invalid month format. Use YYYY-MM",
        });
        return;
      }

      // Get all active habits
      const habits = await Habit.find({ userId, isActive: true }).sort({
        order: 1,
      });

      // Get all buckets for the month
      const buckets = await HabitBucket.find({ userId, month });
      const bucketMap = new Map(buckets.map((b) => [b.habitId.toString(), b]));

      // Build calendar data
      const daysInMonth = getDaysInMonth(new Date(month + "-01"));
      const calendarData: Record<
        string,
        {
          habits: {
            _id: string;
            name: string;
            color: string;
            completed: boolean;
          }[];
          completed: number;
          total: number;
          percentage: number;
        }
      > = {};

      for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = d.toString().padStart(2, "0");
        const dayHabits = habits.map((habit) => {
          const bucket = bucketMap.get(habit._id.toString());
          return {
            _id: habit._id.toString(),
            name: habit.name,
            color: habit.color,
            completed: bucket?.days.get(dayStr) ?? false,
          };
        });

        const completedCount = dayHabits.filter((h) => h.completed).length;
        const totalCount = habits.length;

        calendarData[dayStr] = {
          habits: dayHabits,
          completed: completedCount,
          total: totalCount,
          percentage:
            totalCount > 0
              ? Math.round((completedCount / totalCount) * 100)
              : 0,
        };
      }

      res.json({
        success: true,
        data: {
          month,
          daysInMonth,
          calendar: calendarData,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
