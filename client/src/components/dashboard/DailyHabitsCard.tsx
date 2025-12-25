import { Loader2, SunDim, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useEffect, useState } from "react";
import { analyticsService } from "@/services/analytics.service";
import type { HabitWithStatus } from "@/types/habit.types";
import { checkinService } from "@/services/checkin.service";
import { format } from "date-fns";
import { Checkbox } from "../ui/checkbox";
import { Progress } from "../ui/progress";
import { AddHabitDialog } from "./AddHabitDialog";
import { useDashboard } from "@/context/DashboardContext";
import { habitService } from "@/services/habit.service";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button, buttonVariants } from "../ui/button";

export function DailyHabitsCard() {
  const { triggerRefresh } = useDashboard();
  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  const [progress, setProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    const { data } = await analyticsService.getDashboard();
    setHabits(data.data.habits);
    setProgress(data.data.progress);
    setIsLoading(false);
  }

  async function handleToggle(habitId: string, currentStatus: boolean) {
    const previousHabits = [...habits];
    setHabits((prev) =>
      prev.map((h) =>
        h._id === habitId ? { ...h, completed: !currentStatus } : h
      )
    );

    try {
      await checkinService.toggle(
        habitId,
        format(new Date(), "yyyy-MM-dd"),
        !currentStatus
      );
      fetchDashboardData();
      triggerRefresh();
    } catch (error) {
      setHabits(previousHabits);
      console.error("Failed to toggle habit");
    }
  }

  async function handleDelete(habitId: string) {
    const previousHabits = [...habits];
    setHabits((prev) => prev.filter((h) => h._id !== habitId));
    try {
      await habitService.delete(habitId);
      fetchDashboardData();
      triggerRefresh();
      toast.success("Habit deleted successfully");
    } catch (error) {
      setHabits(previousHabits);
      console.error("Failed to delete habit");
      toast.error("Failed to delete habit");
    }
  }
  return (
    <Card className="gap-2 bg-linear-to-br from-background to-card">
      <CardHeader className="gap-1">
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SunDim className="text-yellow-600" />
            <p className="font-medium">Today's Habits</p>
          </div>
          <AddHabitDialog onHabitAdded={fetchDashboardData} />
        </CardTitle>
        <CardDescription className="text-xs">
          {format(new Date(), "EEEE, MMM d")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="animate-spin size-4" />
            <p>Loading...</p>
          </div>
        )}
        {!isLoading && habits.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No habits for today.
          </div>
        )}
        {habits.map((habit) => (
          <div
            key={habit._id}
            className="flex items-center justify-between py-2 text-sm group"
          >
            <div className="flex items-center gap-2">
              <Checkbox
                checked={habit.completed}
                onCheckedChange={() => handleToggle(habit._id, habit.completed)}
              />
              <span
                className={
                  habit.completed ? "line-through text-muted-foreground" : ""
                }
              >
                {habit.icon} {habit.name}
              </span>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="size-3 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{habit.name}"? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className={buttonVariants({variant:"destructive"})} onClick={() => handleDelete(habit._id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex-col items-start">
        <p className="text-xs text-muted-foreground">
          {progress.percentage}% of habits completed
        </p>
        <Progress value={progress.percentage} />
      </CardFooter>
    </Card>
  );
}
