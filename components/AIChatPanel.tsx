"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type AIChatPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: string;
};

export function AIChatPanel({ open, onOpenChange, context }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const starter = useMemo<Message>(
    () => ({
      role: "assistant",
      content: "I have the alert context. Ask me for an action plan, replenishment note, or pricing response."
    }),
    []
  );

  useEffect(() => {
    if (open) {
      setMessages([starter]);
      setInput("Give me a specific action plan for this alert.");
      setError("");
    }
  }, [open, starter, context]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.filter((message) => message !== starter), context })
      });

      if (!response.ok || !response.body) throw new Error("Chat request failed.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages([...nextMessages, { role: "assistant", content: assistantText }]);
      }
    } catch {
      setError("Unable to reach Claude. Check your API key and try again.");
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent onClose={() => onOpenChange(false)}>
        <SheetHeader>
          <SheetTitle>AI action plan</SheetTitle>
          <p className="mt-1 text-sm text-muted-foreground">Claude has the alert context pre-loaded.</p>
        </SheetHeader>

        <div className="flex h-[calc(100%-88px)] flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">{context}</div>
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
              >
                {message.role === "assistant" && <Bot className="mt-1 h-4 w-4 shrink-0 text-primary" />}
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-6",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                  )}
                >
                  {message.content || "Thinking..."}
                </div>
                {message.role === "user" && <User className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />}
              </div>
            ))}
            {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <div ref={scrollRef} />
          </div>

          <form className="flex gap-2 border-t p-4" onSubmit={submit}>
            <input
              className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask for next steps..."
            />
            <Button type="submit" size="icon" disabled={isStreaming} aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
