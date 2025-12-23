interface Habit {
  _id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  targetDays: number[];
  isActive: boolean;
  order: number;
}

interface HabitWithStatus extends Habit {
  completed: boolean;
}
interface DayData {
  completed: number;
  total: number;
  percentage: number;
}

interface CreateHabitInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  targetDays?: number[];
}

interface UpdateHabitInput extends Partial<CreateHabitInput> {}

export type {
  Habit,
  HabitWithStatus,
  DayData,
  CreateHabitInput,
  UpdateHabitInput,
};
