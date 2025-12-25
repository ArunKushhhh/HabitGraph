import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { analyticsService } from "@/services/analytics.service";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { PieChart, Loader2 } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

interface HabitRing {
  icon: string;
  _id: string;
  name: string;
  color: string;
  percentage: number;
}

export function AnalyticsRings() {
  const { refreshKey } = useDashboard();
  const [rings, setRings] = useState<HabitRing[]>([]);
  const [overall, setOverall] = useState({ percentage: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRings() {
      const { data } = await analyticsService.getRings();
      setRings(data.data.habits);
      setOverall(data.data.overall);
      setIsLoading(false);
    }
    fetchRings();
  }, [refreshKey]);

  return (
    <Card className="gap-2 bg-linear-to-br from-background to-card">
      <CardHeader className="gap-1">
        <CardTitle className="flex items-center gap-2">
          <PieChart className="size-4 text-purple-600" />
          <span>Analytics</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Average completion by habit
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="animate-spin size-4" />
            <p>Loading...</p>
          </div>
        ) : rings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet</p>
        ) : (
          <>
            <div className="grid grid-cols-3 md:grid-cols-2 gap-4">
              {rings.map((ring) => (
                <div
                  key={ring._id}
                  className="flex flex-col items-center gap-1"
                >
                  <ProgressRing
                    percentage={ring.percentage}
                    color={ring.color}
                  />
                  <span className="text-xs font-medium">
                    {ring.icon} {ring.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Overall</p>
                <p className="text-xs text-muted-foreground">All habits avg</p>
              </div>
              <ProgressRing
                percentage={overall.percentage}
                color="#3b82f6"
                size={14}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ProgressRing({
  percentage,
  color,
  size = 14,
}: {
  percentage: number;
  color: string;
  size?: number;
}) {
  const data = [{ value: percentage, fill: color }];

  return (
    <div className="relative" style={{ width: size * 4, height: size * 4 }}>
      <ResponsiveContainer>
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar background dataKey="value" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold">{percentage}%</span>
      </div>
    </div>
  );
}
