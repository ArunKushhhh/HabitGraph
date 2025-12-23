import { z } from "zod";

export const createHabitSchema = z.object({
  name: z
    .string()
    .min(1, "Habit name is required")
    .max(50, "Habit name cannot exceed 50 characters"),
  description: z
    .string()
    .max(200, "Description cannot exceed 200 characters")
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .default("#3b82f6"),
  icon: z.string().optional(),
  targetDays: z
    .array(z.number().min(0).max(6))
    .default([])
    .refine(
      (days) => new Set(days).size === days.length,
      "Target days must be unique"
    ),
});

export const updateHabitSchema = createHabitSchema.partial();

export const habitIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid habit ID"),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
