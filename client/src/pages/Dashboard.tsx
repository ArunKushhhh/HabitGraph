import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
    const {user, logout} = useAuth()


    return (
        <div>
            <p>{user?.name }</p>
            <Button onClick={logout}>Log Out</Button>
        </div>
    );
}