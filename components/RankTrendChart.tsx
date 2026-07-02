"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RankTrendPoint = {
  date: string;
  Blinkit: number;
  Zepto: number;
  Instamart: number;
};

export function RankTrendChart({ data }: { data: RankTrendPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rank trend (7 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis reversed domain={[1, 8]} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="Blinkit" stroke="hsl(24 95% 53%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Zepto" stroke="hsl(271 81% 56%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Instamart" stroke="hsl(142 72% 29%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
