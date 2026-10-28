import { TrendingDown, TrendingUp } from "lucide-react";

import { formatSigned } from "@/lib/format";
import { cn } from "@/lib/utils";

export function GrowthBadge({
  value,
  className,
  withIcon = true,
  suffix = "YoY",
}: {
  value: number;
  className?: string;
  withIcon?: boolean;
  suffix?: string;
}) {
  const positive = value >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium tabular-nums",
        positive ? "text-chart-1" : "text-chart-5",
        className,
      )}
    >
      {withIcon && <Icon className="size-3.5" aria-hidden="true" />}
      <span>{formatSigned(value)}</span>
      {suffix && (
        <span className="font-normal text-muted-foreground">{suffix}</span>
      )}
    </span>
  );
}
