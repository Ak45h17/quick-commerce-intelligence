import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  title: string;
  value: string;
  subtitle: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
};

export function MetricCard({ title, value, subtitle, trend, trendValue }: MetricCardProps) {
  const Icon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : ArrowRight;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="mt-3 text-3xl font-semibold tracking-normal">{value}</div>
        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">{subtitle}</span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold",
              trend === "up" && "bg-green-50 text-green-700",
              trend === "down" && "bg-red-50 text-red-700",
              trend === "neutral" && "bg-blue-50 text-blue-700"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {trendValue}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
