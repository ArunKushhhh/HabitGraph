import { z } from "zod";

export const toggleCheckinSchema = z.object({
  habitId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid habit ID"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  status: z.boolean(),
});

export type ToggleCheckinInput = z.infer<typeof toggleCheckinSchema>;
