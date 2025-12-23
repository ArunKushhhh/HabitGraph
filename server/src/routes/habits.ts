import { Router, Response, NextFunction } from "express";
import Habit from "../models/Habit";
import { validate, validateParams } from "../middleware/validate";
import {
  createHabitSchema,
  updateHabitSchema,
  habitIdSchema,
} from "../schemas/habit.schema";
import { AuthRequest, protect } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";

const router = Router();

// All routes require authentication
router.use(protect);

// GET /api/habits - Fetch user's active habits
router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const habits = await Habit.find({
      userId: req.user?._id,
      isActive: true,
    }).sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      data: habits,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/habits - Create new habit
router.post(
  "/",
  validate(createHabitSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { name, description, color, icon, targetDays } = req.body;

      // Get the highest order number for user's habits
      const lastHabit = await Habit.findOne({ userId: req.user?._id })
        .sort({ order: -1 })
        .select("order");
      const order = lastHabit ? lastHabit.order + 1 : 0;

      const habit = await Habit.create({
        userId: req.user?._id,
        name,
        description,
        color,
        icon,
        targetDays,
        order,
      });

      res.status(201).json({
        success: true,
        message: "Habit created successfully",
        data: habit,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/habits/:id - Get single habit
router.get(
  "/:id",
  validateParams(habitIdSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const habit = await Habit.findOne({
        _id: req.params.id,
        userId: req.user?._id,
      });

      if (!habit) {
        throw new ApiError("Habit not found", 404);
      }

      res.json({
        success: true,
        data: habit,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/habits/:id - Update habit
router.put(
  "/:id",
  validateParams(habitIdSchema),
  validate(updateHabitSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const habit = await Habit.findOneAndUpdate(
        { _id: req.params.id, userId: req.user?._id },
        req.body,
        { new: true, runValidators: true }
      );

      if (!habit) {
        throw new ApiError("Habit not found", 404);
      }

      res.json({
        success: true,
        message: "Habit updated successfully",
        data: habit,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/habits/:id - Soft delete habit
router.delete(
  "/:id",
  validateParams(habitIdSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const habit = await Habit.findOneAndUpdate(
        { _id: req.params.id, userId: req.user?._id },
        { isActive: false },
        { new: true }
      );

      if (!habit) {
        throw new ApiError("Habit not found", 404);
      }

      res.json({
        success: true,
        message: "Habit deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
