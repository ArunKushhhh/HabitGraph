import { AnalyticsRings } from "@/components/dashboard/AnalyticsRings";
import { DailyHabitsCard } from "@/components/dashboard/DailyHabitsCard";
import { ProgressOverview } from "@/components/dashboard/ProgressOverview";
import { YearlyOverview } from "@/components/dashboard/YearlyOverview";
import Navbar from "@/components/Navbar";
import { DashboardProvider } from "@/context/DashboardContext";

export default function Dashboard() {
  return (
    <DashboardProvider>
      <div className="h-screen">
        <Navbar />
        <main className="p-4 md:px-6 lg:px-12 flex flex-col md:flex-row gap-4">
          <div className="w-full md:max-w-xs flex flex-col gap-4">
            <DailyHabitsCard />
            <AnalyticsRings />
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <ProgressOverview />
            <YearlyOverview />
          </div>
        </main>
      </div>
    </DashboardProvider>
  );
}
