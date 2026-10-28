import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  children,
  accent = "var(--chart-1)",
  className,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: ReactNode;
  hint?: string;
  children?: ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "group/kpi relative h-full gap-0 overflow-hidden bg-card/70 py-4 transition-colors duration-300 hover:bg-card",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -top-12 -right-10 size-32 rounded-full opacity-[0.13] blur-2xl transition-opacity duration-500 group-hover/kpi:opacity-25"
        style={{ background: accent }}
        aria-hidden="true"
      />
      <CardContent className="relative flex h-full flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          <span
            className="flex size-7 items-center justify-center rounded-md border border-border/70 bg-background/50"
            style={{ color: accent }}
          >
            <Icon className="size-3.5" aria-hidden="true" />
          </span>
        </div>

        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </span>
          {delta}
        </div>

        {children && <div className="mt-auto pt-1">{children}</div>}

        {hint && (
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {hint}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
