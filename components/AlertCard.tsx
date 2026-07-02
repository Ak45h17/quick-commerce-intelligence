"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Sparkles } from "lucide-react";
import { AIChatPanel } from "@/components/AIChatPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPlatform } from "@/lib/format";
import { cn } from "@/lib/utils";

export type AlertView = {
  id: string;
  severity: string;
  type: string;
  title: string;
  body: string;
  insight: string;
  platform: string;
  city: string;
  resolved: boolean;
  createdAt: string | Date;
  product?: { name: string } | null;
};

const severityClass: Record<string, string> = {
  critical: "border-l-red-500",
  warning: "border-l-amber-500",
  info: "border-l-blue-500",
  success: "border-l-green-500"
};

export function AlertCard({ alert, onDismiss }: { alert: AlertView; onDismiss?: (id: string) => void }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [dismissed, setDismissed] = useState(alert.resolved);
  const [error, setError] = useState("");
  const variant = alert.resolved || alert.severity === "success" ? "success" : alert.severity;
  const context = `${alert.title}\n${alert.body}\nAI insight: ${alert.insight}`;

  async function dismiss() {
    setIsDismissing(true);
    setError("");

    try {
      const response = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: alert.id, resolved: true })
      });

      if (!response.ok) throw new Error("Dismiss failed");
      setDismissed(true);
      onDismiss?.(alert.id);
    } catch {
      setError("Could not dismiss alert. Please try again.");
    } finally {
      setIsDismissing(false);
    }
  }

  return (
    <>
      <Card className={cn("border-l-4", severityClass[variant] ?? "border-l-blue-500", dismissed && "opacity-70")}>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant={variant as "critical" | "warning" | "info" | "success"}>
              {dismissed ? "resolved" : alert.severity}
            </Badge>
            <Badge variant="secondary">{formatPlatform(alert.platform)}</Badge>
            <Badge variant="outline">{alert.city}</Badge>
            <span>{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</span>
          </div>

          <h3 className="mt-4 text-base font-semibold">{alert.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{alert.body}</p>

          <div className="mt-4 flex gap-3 rounded-lg bg-muted p-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm italic leading-6 text-muted-foreground">{alert.insight}</p>
          </div>

          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setChatOpen(true)}>
              <Sparkles className="h-4 w-4" />
              Get action plan
            </Button>
            <Button size="sm" variant="outline" disabled={dismissed}>
              Snooze
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss} disabled={dismissed || isDismissing}>
              {dismissed ? "Dismissed" : "Dismiss"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <AIChatPanel open={chatOpen} onOpenChange={setChatOpen} context={context} />
    </>
  );
}
