import { habitService } from "@/services/habit.service";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2, Plus } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

const COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#a855f7", // purple
  "#f59e0b", // yellow
  "#ef4444", // red
  "#14b8a6", // teal
];
interface AddHabitDialogProps {
  onHabitAdded: () => void;
}

export function AddHabitDialog({ onHabitAdded }: AddHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("✨");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await habitService.create({
        name,
        description,
        icon,
        color,
      });
      setOpen(false);
      toast.success("Habit added successfully");
      onHabitAdded();
      resetForm();
    } catch (error) {
      console.error("Failed to add habit:", error);
      toast.error("Failed to add habit");
    } finally {
      setIsSubmitting(false);
    }
  };

  function resetForm() {
    setName("");
    setColor(COLORS[0]);
    setDescription("");
    setIcon("✨");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"icon"} variant={"default"}>
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
          <DialogDescription className="text-xs">
            Add a new habit to track daily
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
                  <Loader2 className="animate-spin size-4 mr-2" /> Creating...
                </>
              ) : (
                "Create Habit"
              )}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
