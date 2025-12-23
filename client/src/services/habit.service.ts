import api from "@/lib/api";
import type { ApiResponse } from "@/types/api.types";
import type {
  CreateHabitInput,
  Habit,
  UpdateHabitInput,
} from "@/types/habit.types";

export const habitService = {
  getAll: () => api.get<ApiResponse<{ habits: Habit[] }>>("/habits"),
  create: (data: CreateHabitInput) =>
    api.post<ApiResponse<Habit>>("/habits", data),
  update: (id: string, data: UpdateHabitInput) =>
    api.put<ApiResponse<Habit>>(`/habits/${id}`, data),
  delete: (id: string) => api.delete(`/habits/${id}`),
};
