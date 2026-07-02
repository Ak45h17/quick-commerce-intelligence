import { AlertCard } from "@/components/AlertCard";
import { CityHeatmap } from "@/components/CityHeatmap";
import { MetricCard } from "@/components/MetricCard";
import { RankTrendChart } from "@/components/RankTrendChart";
import { RefreshEngineButton } from "@/components/RefreshEngineButton";
import { getHeatmapData, getRankTrendData, getRecentAlerts } from "@/lib/dashboard-data";

export default async function DashboardPage() {
  const [alerts, rankTrend, heatmap] = await Promise.all([getRecentAlerts(3), getRankTrendData(), getHeatmapData()]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">RiteBite Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pune OOS, Bangalore undercut, Mumbai rank down, Delhi low stock, Chennai recovered.
          </p>
        </div>
        <RefreshEngineButton />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Active alerts" value="6" subtitle="2 critical signals" trend="down" trendValue="+4 today" />
        <MetricCard title="Cities impacted" value="4 of 12" subtitle="Inventory or rank issue" trend="down" trendValue="Pune hot" />
        <MetricCard title="Avg rank" value="#3.2" subtitle="Was #2.7 yesterday" trend="down" trendValue="-0.5" />
        <MetricCard title="OOS cities" value="Pune · Hyderabad" subtitle="Blinkit and Zepto" trend="neutral" trendValue="Live" />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent alerts</h2>
          <a href="/dashboard/alerts" className="text-sm font-medium text-primary">View all</a>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <RankTrendChart data={rankTrend} />
        <CityHeatmap data={heatmap} />
      </section>
    </main>
  );
}
