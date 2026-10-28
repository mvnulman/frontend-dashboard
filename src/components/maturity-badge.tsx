import { MATURITY_MAP } from "@/lib/data";
import type { MaturityId } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MaturityBadge({
  maturity,
  className,
  withLabel = true,
}: {
  maturity: MaturityId;
  className?: string;
  withLabel?: boolean;
}) {
  const meta = MATURITY_MAP[maturity];

  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium whitespace-nowrap ring-1 ring-inset ring-current/15",
        className,
      )}
      style={{
        color: meta.color,
        backgroundColor: `color-mix(in oklab, ${meta.color} 12%, transparent)`,
      }}
    >
      <span
        className="size-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {withLabel && meta.label}
    </span>
  );
}
