import { Download, Star } from "lucide-react";

import { CategoryDot, CategoryIcon } from "@/components/category-icon";
import { GrowthBadge } from "@/components/growth-badge";
import { MaturityBadge } from "@/components/maturity-badge";
import { Sparkline } from "@/components/sparkline";
import { CATEGORY_MAP } from "@/lib/data";
import { formatCompact } from "@/lib/format";
import type { Technology } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TechCard({
  tech,
  onSelect,
  className,
}: {
  tech: Technology;
  onSelect: (tech: Technology) => void;
  className?: string;
}) {
  const meta = CATEGORY_MAP[tech.category];
  const series = tech.series ?? [];
  const isLive = Boolean(tech.live);

  return (
    <button
      type="button"
      onClick={() => onSelect(tech)}
      title={tech.sourceNote}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card/80 p-4 text-left transition-all duration-300 outline-none hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-card hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.45)] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40",
        className,
      )}
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)`,
        }}
        aria-hidden="true"
      />

      <div className="flex items-start gap-3">
        <CategoryIcon category={tech.category} className="size-8 rounded-lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <h2 className="truncate text-sm font-semibold">{tech.name}</h2>
            <span className="font-mono text-[10px] text-muted-foreground">
              {tech.kind === "platform" ? tech.version : `v${tech.version}`}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <MaturityBadge maturity={tech.maturity} />
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <CategoryDot category={tech.category} />
              {meta.shortLabel}
            </span>
            {!isLive && (
              <span className="rounded border border-border/70 bg-muted/30 px-1 py-px text-[8px] text-muted-foreground uppercase">
                curadoria
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="font-mono text-lg leading-none font-semibold tabular-nums">
            {isLive ? tech.momentum : "—"}
          </div>
          <div className="mt-1 font-mono text-[8px] tracking-[0.14em] text-muted-foreground uppercase">
            moment.
          </div>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
        {tech.tagline}
      </p>

      {series.length > 0 && (
        <div className="mt-3 -mb-1">
          <Sparkline
            data={series}
            color={meta.color}
            className="h-10 opacity-80 transition-opacity duration-300 group-hover:opacity-100"
            showDot
          />
        </div>
      )}

      <div className="mt-auto space-y-2 pt-3">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Adoção</span>
          <span className="font-mono font-medium tabular-nums">
            {isLive ? (
              <>
                {tech.adoption}
                <span className="text-muted-foreground">/100</span>
              </>
            ) : (
              "—"
            )}
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          {isLive && (
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${tech.adoption}%`, background: meta.color }}
            />
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border/60 pt-2 text-[10px] text-muted-foreground">
          {isLive ? (
            <GrowthBadge value={tech.growth} />
          ) : (
            <span>—</span>
          )}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1">
              <Star className="size-3" aria-hidden="true" />
              {isLive ? formatCompact(tech.stars) : "—"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Download className="size-3" aria-hidden="true" />
              {isLive && tech.downloads > 0 ? formatCompact(tech.downloads) : "—"}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
