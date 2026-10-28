"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ExternalLink,
  TriangleAlert,
} from "lucide-react";

import { CategoryIcon } from "@/components/category-icon";
import { GrowthBadge } from "@/components/growth-badge";
import { MaturityBadge } from "@/components/maturity-badge";
import { Sparkline } from "@/components/sparkline";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CATEGORY_MAP, getAdoptionSeries } from "@/lib/data";
import { formatCompact, formatShortDate } from "@/lib/format";
import type { Technology, TechnologyScores } from "@/lib/types";
import { cn } from "@/lib/utils";

const SCORE_LABELS: Record<keyof TechnologyScores, string> = {
  dx: "Developer experience",
  performance: "Performance",
  ecosystem: "Ecossistema",
  learning: "Facilidade de aprendizado",
  stability: "Estabilidade",
};

export function TechDetailDialog({
  tech,
  onClose,
}: {
  tech: Technology | null;
  onClose: () => void;
}) {
  const meta = tech ? CATEGORY_MAP[tech.category] : null;
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog
      open={Boolean(tech)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        ref={contentRef}
        initialFocus={contentRef}
        className="max-h-[90svh] gap-0 overflow-y-auto p-0 sm:max-w-2xl"
        showCloseButton
      >
        {tech && meta && (
          <>
            <div
              className="relative border-b border-border/70 px-5 pt-5 pb-4"
              style={{
                background: `linear-gradient(135deg, color-mix(in oklab, ${meta.color} 10%, transparent), transparent 65%)`,
              }}
            >
              <DialogHeader className="pr-8">
                <div className="flex items-start gap-3">
                  <CategoryIcon
                    category={tech.category}
                    className="size-11 rounded-xl"
                    iconClassName="size-5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <DialogTitle className="text-xl font-semibold tracking-tight">
                        {tech.name}
                      </DialogTitle>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {tech.kind === "platform"
                          ? tech.version
                          : `v${tech.version}`}
                      </span>
                      <MaturityBadge maturity={tech.maturity} />
                    </div>
                    <DialogDescription className="mt-1 text-[12px] leading-relaxed">
                      {tech.tagline}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
            </div>

            <div className="space-y-5 px-5 py-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  {
                    label: "Adoção",
                    value: `${tech.adoption}`,
                    hint: "/100",
                  },
                  {
                    label: "Momentum",
                    value: `${tech.momentum}`,
                    hint: "/100",
                  },
                  {
                    label: "Crescimento",
                    value: null,
                    hint: null,
                  },
                  {
                    label:
                      tech.kind === "platform" ? "Plataforma" : "Downloads",
                    value:
                      tech.kind === "platform"
                        ? "Web"
                        : formatCompact(tech.downloads),
                    hint: tech.kind === "platform" ? "padrão" : "/semana",
                  },
                ].map((metric) =>
                  metric.label === "Crescimento" ? (
                    <div
                      key={metric.label}
                      className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2"
                    >
                      <p className="text-[9px] tracking-wide text-muted-foreground uppercase">
                        {metric.label}
                      </p>
                      <div className="mt-1">
                        <GrowthBadge value={tech.growth} suffix="" />
                      </div>
                    </div>
                  ) : (
                    <div
                      key={metric.label}
                      className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2"
                    >
                      <p className="text-[9px] tracking-wide text-muted-foreground uppercase">
                        {metric.label}
                      </p>
                      <p className="mt-1 font-mono text-lg leading-none font-semibold tabular-nums">
                        {metric.value}
                        <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">
                          {metric.hint}
                        </span>
                      </p>
                    </div>
                  ),
                )}
              </div>

              <div className="rounded-lg border border-border/70 bg-card px-3 py-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">
                    Trajetória de adoção · 12 meses
                  </p>
                  <span className="font-mono text-[10px] tabular-nums">
                    {tech.adoption}
                  </span>
                </div>
                <Sparkline
                  data={getAdoptionSeries(tech, 12)}
                  color={meta.color}
                  className="mt-1 h-14"
                  showDot
                />
              </div>

              <p className="text-[12px] leading-relaxed text-muted-foreground">
                {tech.description}
              </p>

              <div className="space-y-2">
                <p className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
                  avaliação editorial
                </p>
                {(
                  Object.keys(SCORE_LABELS) as (keyof TechnologyScores)[]
                ).map((key) => (
                  <div
                    key={key}
                    className="grid grid-cols-[118px_1fr_28px] items-center gap-2"
                  >
                    <span className="text-[10px] text-muted-foreground">
                      {SCORE_LABELS[key]}
                    </span>
                    <div className="h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${tech.scores[key]}%`,
                          background: meta.color,
                        }}
                      />
                    </div>
                    <span className="text-right font-mono text-[10px] tabular-nums">
                      {tech.scores[key]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-chart-1/20 bg-chart-1/5 p-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-medium">
                    <Check className="size-3 text-chart-1" aria-hidden="true" />
                    Por que acompanhar
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {tech.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex gap-1.5 text-[10px] leading-relaxed text-muted-foreground"
                      >
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-chart-1" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-chart-5/20 bg-chart-5/5 p-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-medium">
                    <TriangleAlert
                      className="size-3 text-chart-5"
                      aria-hidden="true"
                    />
                    Pontos de atenção
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {tech.tradeoffs.map((tradeoff) => (
                      <li
                        key={tradeoff}
                        className="flex gap-1.5 text-[10px] leading-relaxed text-muted-foreground"
                      >
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-chart-5" />
                        {tradeoff}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">Quando usar: </span>
                {tech.useCase}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] text-muted-foreground">
                <span>{tech.license}</span>
                <span className="text-border">/</span>
                <span>{tech.maintainer}</span>
                <span className="text-border">/</span>
                <span>release {formatShortDate(tech.latestRelease)}</span>
                <span className="ml-auto inline-flex items-center gap-1">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: meta.color }}
                  />
                  {meta.label}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-border/70 bg-muted/30 px-5 py-3">
              <Link
                href={tech.website}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Site oficial
                <ExternalLink />
              </Link>
              <Link
                href={tech.docs}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                <BookOpen />
                Documentação
              </Link>
              <Link
                href="/comparar"
                className="ml-auto inline-flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
              >
                Comparar
                <ArrowUpRight className="size-3" aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
