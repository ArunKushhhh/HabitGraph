import { FlameKindling } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <div className="px-4 md:px-6 lg:px-12 py-2 border-b flex justify-between items-center ">
      <Link to="/" className="flex items-center gap-2">
        <FlameKindling className="size-6 text-orange-600" />
        <p className="text-sm font-medium hidden sm:flex">HabitGraph</p>
      </Link>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="text-sm hidden sm:flex">{`Welcome, ${user?.name}`}</div>
          <Link to="/profile">
            <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
        <Button onClick={logout}>Logout</Button>
        <ThemeToggle />
      </div>
    </div>
  );
}
