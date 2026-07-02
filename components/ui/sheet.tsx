"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close panel"
        className="absolute inset-0 bg-foreground/30"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  );
}

export function SheetContent({
  className,
  children,
  onClose
}: {
  className?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <aside
      className={cn(
        "absolute right-0 top-0 h-full w-full max-w-lg overflow-hidden border-l bg-card shadow-xl",
        className
      )}
    >
      <Button className="absolute right-4 top-4 z-10" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
        <X className="h-4 w-4" />
      </Button>
      {children}
    </aside>
  );
}

export function SheetHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("border-b p-5 pr-14", className)}>{children}</div>;
}

export function SheetTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}
