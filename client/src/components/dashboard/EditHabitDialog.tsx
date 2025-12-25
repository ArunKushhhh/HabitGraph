import { habitService } from "@/services/habit.service";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import type { HabitWithStatus } from "@/types/habit.types";

const COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#a855f7", // purple
  "#f59e0b", // yellow
  "#ef4444", // red
  "#14b8a6", // teal
];

interface EditHabitDialogProps {
  habit: HabitWithStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHabitUpdated: () => void;
}

export function EditHabitDialog({
  habit,
  open,
  onOpenChange,
  onHabitUpdated,
}: EditHabitDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(habit.name);
  const [color, setColor] = useState(habit.color || COLORS[0]);
  const [description, setDescription] = useState(habit.description || "");
  const [icon, setIcon] = useState(habit.icon || "✨");

  // Update form when habit prop changes
  useEffect(() => {
    setName(habit.name);
    setColor(habit.color || COLORS[0]);
    setDescription(habit.description || "");
    setIcon(habit.icon || "✨");
  }, [habit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await habitService.update(habit._id, {
        name,
        description,
        icon,
        color,
      });
      onOpenChange(false);
      toast.success("Habit updated successfully");
      onHabitUpdated();
    } catch (error) {
      console.error("Failed to update habit:", error);
      toast.error("Failed to update habit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogDescription className="text-xs">
            Update your habit details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            {/* Name */}
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning Meditation"
                required
              />
            </Field>
            {/* Description */}
            <Field>
              <FieldLabel>Description (optional)</FieldLabel>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="15 minutes of mindfulness"
              />
            </Field>
            {/* Icon */}
            <Field>
              <FieldLabel>Icon</FieldLabel>
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🧘"
                className="w-20"
              />
            </Field>
            {/* Color Picker */}
            <Field>
              <FieldLabel>Color</FieldLabel>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`size-8 rounded-full ${
                      color === c ? "ring-2 ring-offset-2 ring-primary" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </Field>
            <Button type="submit" disabled={isSubmitting || !name}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin size-4 mr-2" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
