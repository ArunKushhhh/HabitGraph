import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ArrowLeft, Loader2, User, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Edit Name State
  const [name, setName] = useState(user?.name || "");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsUpdatingName(true);
    try {
      await authService.updateProfile(name.trim());
      toast.success("Name updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update name");
    } finally {
      setIsUpdatingName(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <div>
      <Navbar />
      <main className="p-4 md:px-6 lg:px-12">
        <Button
          variant="ghost"
          className="mb-4 text-xs flex items-center"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Button>

        <div className="flex flex-col md:flex-row w-full gap-6">
          {/* Edit Name Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-4" />
                Edit Profile
              </CardTitle>
              <CardDescription className="text-xs">
                Update your display name
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateName}>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel>Name</FieldLabel>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input value={user?.email || ""} disabled />
                  </Field>
                  <Button type="submit" disabled={isUpdatingName}>
                    {isUpdatingName ? (
                      <>
                        <Loader2 className="animate-spin size-4 mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="size-4" />
                Change Password
              </CardTitle>
              <CardDescription className="text-xs">
                Update your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword}>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel>Current Password</FieldLabel>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>New Password</FieldLabel>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Confirm New Password</FieldLabel>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </Field>
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="animate-spin size-4 mr-2" />
                        Changing...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
