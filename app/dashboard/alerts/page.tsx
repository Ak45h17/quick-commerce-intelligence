"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCard, type AlertView } from "@/components/AlertCard";
import { AlertSkeleton } from "@/components/Skeletons";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic'

const filters = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "Warning", value: "warning" },
  { label: "Info", value: "info" },
  { label: "Resolved", value: "resolved" }
];

export default function AlertsPage() {
  const [filter, setFilter] = useState("all");
  const [alerts, setAlerts] = useState<AlertView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const query = useMemo(() => {
    if (filter === "all") return "";
    if (filter === "resolved") return "?resolved=true";
    return `?severity=${filter}&resolved=false`;
  }, [filter]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(`/api/alerts${query}`)
      .then((response) => {
        if (!response.ok) throw new Error("Fetch failed");
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setAlerts(data.alerts);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load alerts. Seed the database and try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-normal">Alerts</h1>
        <p className="mt-1 text-sm text-muted-foreground">Prioritized market signals across Blinkit, Zepto, and Instamart.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((item) => (
          <Button
            key={item.value}
            variant={filter === item.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {loading ? (
        <div className="grid gap-4">
          <AlertSkeleton />
          <AlertSkeleton />
          <AlertSkeleton />
        </div>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onDismiss={(id) => setAlerts((current) => current.map((item) => (item.id === id ? { ...item, resolved: true } : item)))}
            />
          ))}
          {!alerts.length && <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">No alerts match this filter.</div>}
        </div>
      )}
    </main>
  );
}
