import {
  Boxes,
  Database,
  Layers,
  Palette,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { CATEGORY_MAP } from "@/lib/data";
import type { CategoryId } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  frameworks: Boxes,
  meta: Layers,
  ui: Palette,
  tooling: Wrench,
  state: Database,
};

export function CategoryIcon({
  category,
  className,
  iconClassName,
}: {
  category: CategoryId;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = CATEGORY_ICONS[category];
  const meta = CATEGORY_MAP[category];

  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-foreground/5",
        className,
      )}
      style={{
        color: meta.color,
        backgroundColor: `color-mix(in oklab, ${meta.color} 14%, transparent)`,
      }}
      aria-hidden="true"
    >
      <Icon className={cn("size-4", iconClassName)} />
    </span>
  );
}

export function CategoryDot({
  category,
  className,
}: {
  category: CategoryId;
  className?: string;
}) {
  return (
    <span
      className={cn("size-1.5 shrink-0 rounded-full", className)}
      style={{ backgroundColor: CATEGORY_MAP[category].color }}
      aria-hidden="true"
    />
  );
}
