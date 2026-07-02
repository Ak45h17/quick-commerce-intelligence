"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RefreshEngineButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function runEngine() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/run-engine", { method: "POST" });
      if (!response.ok) throw new Error("Engine failed");
      const data = await response.json();
      setMessage(`${data.alertsTouched} alerts checked`);
    } catch {
      setMessage("Engine failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {message && <span className="text-xs text-muted-foreground">{message}</span>}
      <Button type="button" variant="outline" onClick={runEngine} disabled={loading}>
        <RotateCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
        Refresh engine
      </Button>
    </div>
  );
}
