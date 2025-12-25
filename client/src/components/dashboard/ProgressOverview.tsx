import { analyticsService } from "@/services/analytics.service";
import { eachDayOfInterval, endOfWeek, format, startOfWeek } from "date-fns";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ArrowLeft, ArrowRight, Loader2, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getDaysInMonth, startOfMonth, getDay } from "date-fns";
import { useDashboard } from "@/context/DashboardContext";

type ViewType = "weekly" | "monthly" | "calendar";

interface DayData {
  day: string;
  percentage: number;
}

export function ProgressOverview() {
  const { refreshKey } = useDashboard();
  const [view, setView] = useState<ViewType>("monthly");
  const [data, setData] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [view, refreshKey]);

  async function fetchData() {
    setIsLoading(true);
    const { data: response } = await analyticsService.getDashboard();
    const monthlyData = response.data.monthlyData;

    const chartData = Object.entries(monthlyData).map(([day, stats]) => ({
      day,
      percentage: (stats as any).percentage,
    }));

    if (view === "weekly") {
      const today = new Date();
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
      const weekDayStrings = weekDays.map((day) => format(day, "dd"));

      setData(chartData.filter((day) => weekDayStrings.includes(day.day)));
    } else {
      setData(chartData);
    }
    setIsLoading(false);
  }
  return (
    <Card className="gap-2 bg-linear-to-br from-background to-card">
      <CardHeader className="gap-1">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-4 text-cyan-600" />
            <span>Progress Overview</span>
          </CardTitle>

          {/* toggle btns */}
          <div className="flex gap-1">
            {(["monthly", "weekly", "calendar"] as ViewType[]).map(
              (viewType) => (
                <Button
                  key={viewType}
                  size={"sm"}
                  variant={view === viewType ? "default" : "outline"}
                  onClick={() => setView(viewType)}
                  className={`text-xs`}
                >
                  {viewType}
                </Button>
              )
            )}
          </div>
        </div>
        <CardDescription className="text-xs">
          Daily habit completion percentage
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="animate-spin size-4" />
            <p>Loading...</p>
          </div>
        ) : view === "calendar" ? (
          <CalendarHeatmap />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  tickLine={true}
                  axisLine={true}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={true}
                  axisLine={true}
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 100]}
                />
                <Tooltip
                  cursor={{ stroke: "hsl(var(--muted))" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover border rounded-lg p-2 shadow-md">
                          <p className="text-sm font-medium">
                            Day {payload[0].payload.day}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payload[0].payload.percentage}% completion
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="#06b6d4"
                  fill="url(#colorGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CalendarData {
  [day: string]: {
    habits: { _id: string; name: string; color: string; completed: boolean }[];
    percentage: number;
  };
}

function CalendarHeatmap() {
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [currentMonth, setCurrentMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCalendarData();
  }, [currentMonth]);

  async function fetchCalendarData() {
    setIsLoading(true);
    const { data: response } = await analyticsService.getCalendar(currentMonth);
    setCalendarData(response.data.calendar);
    setIsLoading(false);
  }

  // Get color based on percentage
  function getHeatColor(percentage: number): string {
    if (percentage === 100) return "#22c55e"; // green
    if (percentage >= 75) return "#14b8a6"; // teal
    if (percentage >= 50) return "#3b82f6"; // blue
    if (percentage >= 25) return "#60a5fa"; // light blue
    if (percentage > 0) return "#f59e0b"; // orange
    return "hsl(var(--muted))"; // gray
  }

  // Build calendar grid
  const daysInMonth = getDaysInMonth(new Date(currentMonth + "-01"));
  const firstDayOfWeek = getDay(startOfMonth(new Date(currentMonth + "-01")));
  const days = Array.from({ length: daysInMonth }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="animate-spin size-4" />
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button
          size="icon"
          variant="outline"
          onClick={() => {
            const date = new Date(currentMonth + "-01");
            date.setMonth(date.getMonth() - 1);
            setCurrentMonth(format(date, "yyyy-MM"));
          }}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <span className="text-sm font-medium">
          {format(new Date(currentMonth + "-01"), "MMMM yyyy")}
        </span>
        <Button
          size="icon"
          variant="outline"
          onClick={() => {
            const date = new Date(currentMonth + "-01");
            date.setMonth(date.getMonth() + 1);
            setCurrentMonth(format(date, "yyyy-MM"));
          }}
        >
          <ArrowRight className="size-4" />
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {days.map((day) => {
          const dayData = calendarData[day];
          const percentage = dayData?.percentage ?? 0;

          return (
            <div
              key={day}
              className="aspect-square rounded-md flex items-center justify-center text-xs cursor-pointer hover:ring-2 hover:ring-primary"
              style={{ backgroundColor: getHeatColor(percentage) }}
              title={`Day ${day}: ${percentage}%`}
            >
              {parseInt(day)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
