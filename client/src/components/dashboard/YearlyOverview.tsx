import { analyticsService } from "@/services/analytics.service";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { BarChart3, Loader2 } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "@/context/DashboardContext";

interface monthData {
  month: string;
  label: number;
  completed: boolean;
  total: number;
  percentage: number;
}

export function YearlyOverview() {
  const { refreshKey } = useDashboard();
  const [data, setData] = useState<monthData[]>([]);
  const [yearlyAvg, setYearlyAvg] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchYearlyData() {
      const { data: response } = await analyticsService.getYear();
      setData(response.data.months);
      setYearlyAvg(response.data.yearlyAverage);
      setIsLoading(false);
    }

    fetchYearlyData();
  }, [refreshKey]);

  return (
    <Card className="gap-6 bg-linear-to-br from-background to-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-4 text-green-600" />
            <span>Yearly Overview</span>
          </CardTitle>
          <span className="text-sm font-medium">{yearlyAvg}% avg</span>
        </div>
        <CardDescription className="text-xs">
          Monthly habit completion for {new Date().getFullYear()}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="animate-spin size-4" />
            <p>Loading...</p>
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis
                  dataKey="label"
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
                  cursor={{ fill: "hsl(var(--secondary))", opacity: 0.2 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-popover border rounded-lg p-2 shadow-md">
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.percentage}% completion
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="percentage"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
