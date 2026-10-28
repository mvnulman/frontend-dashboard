"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Check,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  TriangleAlert,
  X,
} from "lucide-react";

import { CategoryDot, CategoryIcon } from "@/components/category-icon";
import { CompareRadar } from "@/components/compare/compare-radar";
import { GrowthBadge } from "@/components/growth-badge";
import { MaturityBadge } from "@/components/maturity-badge";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { SourceNotice } from "@/components/source-notice";
import { Sparkline } from "@/components/sparkline";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORY_MAP,
} from "@/lib/data";
import {
  formatCompact,
  formatShortDate,
  formatSigned,
} from "@/lib/format";
import type { DashboardData, Technology } from "@/lib/types";
import { cn } from "@/lib/utils";

const SLOT_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

const PRESETS: { label: string; slugs: string[] }[] = [
  { label: "Meta-frameworks", slugs: ["nextjs", "astro", "nuxt"] },
  { label: "Frameworks", slugs: ["react", "vue", "svelte"] },
  { label: "Build & tooling", slugs: ["vite", "turbopack", "rolldown"] },
  { label: "Estado", slugs: ["zustand", "tanstack-query", "jotai"] },
];

const DEFAULT_SLUGS = PRESETS[0].slugs;

function resolve(slugs: string[], items: Technology[]) {
  return slugs
    .map((slug) => items.find((tech) => tech.slug === slug))
    .filter((tech): tech is Technology => Boolean(tech));
}

function versionLabel(tech: Technology) {
  return tech.kind === "platform" ? tech.version : `v${tech.version}`;
}

type MetricRow = {
  label: string;
  render: (tech: Technology) => ReactNode;
  raw?: (tech: Technology) => number;
};

const BASE_ROWS: MetricRow[] = [
  {
    label: "Categoria",
    render: (tech) => (
      <span className="inline-flex items-center gap-1.5">
        <CategoryDot category={tech.category} />
        {CATEGORY_MAP[tech.category].shortLabel}
      </span>
    ),
  },
  {
    label: "Maturidade",
    render: (tech) => <MaturityBadge maturity={tech.maturity} />,
  },
  {
    label: "Adoção",
    raw: (tech) => tech.adoption,
    render: (tech) => (
      <span className="font-mono tabular-nums">
        {tech.adoption}
        <span className="text-muted-foreground"> / 100</span>
      </span>
    ),
  },
  {
    label: "Momentum",
    raw: (tech) => tech.momentum,
    render: (tech) => (
      <span className="font-mono tabular-nums">
        {tech.momentum}
        <span className="text-muted-foreground"> / 100</span>
      </span>
    ),
  },
  {
    label: "Crescimento · 30d",
    raw: (tech) => tech.growth,
    render: (tech) => <GrowthBadge value={tech.growth} suffix="" />,
  },
  {
    label: "Estrelas",
    raw: (tech) => (tech.kind === "platform" ? -1 : tech.stars),
    render: (tech) =>
      tech.kind === "platform" ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        <span className="font-mono tabular-nums">
          {formatCompact(tech.stars)}
        </span>
      ),
  },
  {
    label: "Downloads / sem.",
    raw: (tech) => (tech.kind === "platform" ? -1 : tech.downloads),
    render: (tech) =>
      tech.kind === "platform" ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        <span className="font-mono tabular-nums">
          {formatCompact(tech.downloads)}
        </span>
      ),
  },
  {
    label: "Última release",
    render: (tech) => (
      <span className="font-mono text-[10px]">
        {formatShortDate(tech.latestRelease)}
      </span>
    ),
  },
  {
    label: "Licença",
    render: (tech) => tech.license,
  },
  {
    label: "Mantenedor",
    render: (tech) => tech.maintainer,
  },
];

const SCORE_ROWS: MetricRow[] = [
  {
    label: "Developer experience",
    raw: (tech) => tech.scores.dx,
    render: (tech) => tech.scores.dx,
  },
  {
    label: "Performance",
    raw: (tech) => tech.scores.performance,
    render: (tech) => tech.scores.performance,
  },
  {
    label: "Ecossistema",
    raw: (tech) => tech.scores.ecosystem,
    render: (tech) => tech.scores.ecosystem,
  },
  {
    label: "Facilidade de aprendizado",
    raw: (tech) => tech.scores.learning,
    render: (tech) => tech.scores.learning,
  },
  {
    label: "Estabilidade",
    raw: (tech) => tech.scores.stability,
    render: (tech) => tech.scores.stability,
  },
];

export function CompareClient({ data }: { data: DashboardData }) {
  const liveTechs = useMemo(
    () =>
      data.technologies.filter((tech) => tech.live && tech.downloads > 0),
    [data.technologies],
  );
  const [items, setItems] = useState<Technology[]>(() => {
    const defaults = resolve(DEFAULT_SLUGS, liveTechs);
    return defaults.length >= 2 ? defaults : liveTechs.slice(0, 3);
  });

  const selectedSlugs = useMemo(
    () => new Set(items.map((tech) => tech.slug)),
    [items],
  );

  const activePreset = PRESETS.find(
    (preset) =>
      preset.slugs.length === items.length &&
      preset.slugs.every((slug) => selectedSlugs.has(slug)),
  );

  const updateSlot = (index: number, slug: string) => {
    const next = liveTechs.find((tech) => tech.slug === slug);
    if (!next) return;
    setItems((current) =>
      current.map((tech, currentIndex) =>
        currentIndex === index ? next : tech,
      ),
    );
  };

  const addSlot = () => {
    if (items.length >= 3) return;
    const candidate = [...liveTechs]
      .filter((tech) => !selectedSlugs.has(tech.slug))
      .sort((a, b) => b.momentum - a.momentum)[0];
    if (candidate) setItems((current) => [...current, candidate]);
  };

  const removeSlot = (index: number) => {
    if (items.length <= 2) return;
    setItems((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const applyPreset = (slugs: string[]) => {
    const next = resolve(slugs, liveTechs);
    if (next.length >= 2) setItems(next);
  };

  return (
    <div className="space-y-4">
      <Reveal>
        <PageHeader
          eyebrow={`comparador · ${data.liveCount} métricas ao vivo`}
          title="Comparar tecnologias"
          description="Coloque até três tecnologias lado a lado e compare adoção, momentum, scores e contexto de uso."
          actions={
            <Button variant="outline" onClick={() => applyPreset(DEFAULT_SLUGS)}>
              <RotateCcw />
              Resetar
            </Button>
          }
        />
      </Reveal>

      <SourceNotice
        sources={data.sources}
        githubConfigured={data.githubConfigured}
      />

      <Reveal delay={50}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
            presets
          </span>
          {PRESETS.map((preset) => {
            const active = activePreset?.label === preset.label;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.slugs)}
                aria-pressed={active}
                className={cn(
                  "h-7 rounded-full border px-2.5 text-[10px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  active
                    ? "border-foreground/80 bg-foreground text-background"
                    : "border-border/80 bg-card/50 text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                )}
              >
                {preset.label}
              </button>
            );
          })}
          <span className="ml-auto font-mono text-[9px] text-muted-foreground">
            {items.length} de 3 selecionadas
          </span>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {items.map((tech, index) => {
          const color = SLOT_COLORS[index % SLOT_COLORS.length];
          const meta = CATEGORY_MAP[tech.category];
          const options = liveTechs
            .filter(
              (candidate) =>
                !selectedSlugs.has(candidate.slug) ||
                candidate.slug === tech.slug,
            )
            .map((candidate) => ({
              value: candidate.slug,
              label: `${candidate.name} ${versionLabel(candidate)}`,
            }));

          return (
            <Card
              key={tech.slug}
              className="relative gap-0 overflow-hidden border-t-2 bg-card/70 py-4"
              style={{ borderTopColor: color }}
            >
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
                    slot 0{index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ background: color }}
                    />
                    <button
                      type="button"
                      onClick={() => removeSlot(index)}
                      disabled={items.length <= 2}
                      aria-label={`Remover ${tech.name}`}
                      title={
                        items.length <= 2
                          ? "Compare pelo menos 2 tecnologias"
                          : `Remover ${tech.name}`
                      }
                      className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>

                <Select
                  items={options}
                  value={tech.slug}
                  onValueChange={(value) => updateSlot(index, value as string)}
                >
                  <SelectTrigger
                    className="h-9! w-full bg-background/50 text-xs"
                    aria-label={`Tecnologia do slot ${index + 1}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <CategoryIcon
                    category={tech.category}
                    className="size-8 rounded-lg"
                    iconClassName="size-3.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="truncate text-sm font-semibold">
                        {tech.name}
                      </span>
                      <span className="font-mono text-[9px] text-muted-foreground">
                        {versionLabel(tech)}
                      </span>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-[9px] text-muted-foreground">
                      <CategoryDot category={tech.category} />
                      {meta.shortLabel}
                    </p>
                  </div>
                  <MaturityBadge maturity={tech.maturity} />
                </div>

                <Sparkline
                  data={tech.series ?? []}
                  color={color}
                  className="h-9"
                  filled={false}
                  strokeWidth={1.6}
                />

                <div className="grid grid-cols-3 gap-1 border-t border-border/60 pt-2">
                  {[
                    {
                      label: "Adoção",
                      value: `${tech.adoption}`,
                    },
                    {
                      label: "Momentum",
                      value: `${tech.momentum}`,
                    },
                    {
                      label: "Cresc. 30d",
                      value: formatSigned(tech.growth),
                    },
                  ].map((metric) => (
                    <div key={metric.label} className="text-center">
                      <p className="text-[8px] tracking-wide text-muted-foreground uppercase">
                        {metric.label}
                      </p>
                      <p className="mt-0.5 font-mono text-xs font-medium tabular-nums">
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {items.length < 3 && (
          <button
            type="button"
            onClick={addSlot}
            className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/30 p-4 text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-card/60 hover:text-foreground"
          >
            <span className="flex size-9 items-center justify-center rounded-full border bg-background">
              <Plus className="size-4" />
            </span>
            <span className="text-xs font-medium">Adicionar tecnologia</span>
            <span className="text-[10px]">Compare até três</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Reveal delay={80} className="xl:col-span-7">
          <CompareRadar items={items} />
        </Reveal>

        <Reveal delay={130} className="xl:col-span-5">
          <Card className="h-full gap-3 bg-card/70">
            <CardHeader>
              <CardTitle>Leitura rápida</CardTitle>
              <CardDescription>Onde cada uma se destaca</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {items.map((tech, index) => (
                <div
                  key={tech.slug}
                  className="rounded-lg border border-border/60 bg-background/30 p-3"
                  style={{
                    borderLeftColor: SLOT_COLORS[index % SLOT_COLORS.length],
                    borderLeftWidth: 2,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{tech.name}</span>
                    <span className="font-mono text-[9px] text-muted-foreground">
                      {versionLabel(tech)}
                    </span>
                    <span className="ml-auto text-[9px] text-muted-foreground">
                      #{tech.momentum} momentum
                    </span>
                  </div>
                  <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Melhor para:{" "}
                    </span>
                    {tech.useCase}
                  </p>
                  <div className="mt-2 space-y-1">
                    {tech.highlights.slice(0, 2).map((highlight) => (
                      <div
                        key={highlight}
                        className="flex gap-1.5 text-[9px] leading-relaxed text-muted-foreground"
                      >
                        <Check
                          className="mt-0.5 size-2.5 shrink-0 text-chart-1"
                          aria-hidden="true"
                        />
                        {highlight}
                      </div>
                    ))}
                    <div className="flex gap-1.5 text-[9px] leading-relaxed text-muted-foreground">
                      <TriangleAlert
                        className="mt-0.5 size-2.5 shrink-0 text-chart-5"
                        aria-hidden="true"
                      />
                      {tech.tradeoffs[0]}
                    </div>
                  </div>
                  <Link
                    href={`/tendencias?tech=${tech.slug}`}
                    className="mt-2 inline-flex items-center gap-0.5 text-[9px] font-medium text-foreground transition-opacity hover:opacity-70"
                  >
                    Ficha completa
                    <ArrowUpRight className="size-2.5" aria-hidden="true" />
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={160}>
        <Card className="gap-3 bg-card/70">
          <CardHeader>
            <CardTitle>Ficha técnica</CardTitle>
            <CardDescription>
              Métricas lado a lado · melhores valores destacados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-[10px] text-muted-foreground md:hidden">
              Deslize para o lado para ver todas as colunas →
            </p>
            <div
              className="overflow-x-auto focus-visible:ring-2 focus-visible:ring-ring/40"
              tabIndex={0}
              role="region"
              aria-label="Tabela comparativa de tecnologias"
            >
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border/70">
                    <th
                      scope="col"
                      className="sticky left-0 z-10 w-40 bg-card px-3 py-2 font-mono text-[9px] font-normal tracking-[0.14em] text-muted-foreground uppercase"
                    >
                      métrica
                    </th>
                    {items.map((tech, index) => (
                      <th
                        key={tech.slug}
                        scope="col"
                        className="px-3 py-2"
                      >
                        <span className="flex items-center gap-1.5">
                          <span
                            className="size-1.5 rounded-full"
                            style={{
                              background:
                                SLOT_COLORS[index % SLOT_COLORS.length],
                            }}
                          />
                          <span className="text-xs font-medium">
                            {tech.name}
                          </span>
                          <span className="font-mono text-[9px] font-normal text-muted-foreground">
                            {versionLabel(tech)}
                          </span>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BASE_ROWS.map((row) => {
                    const rawValues = row.raw
                      ? items.map((tech) => row.raw!(tech))
                      : null;
                    const max = rawValues ? Math.max(...rawValues) : null;
                    const bestCount = rawValues
                      ? rawValues.filter((value) => value === max).length
                      : 0;

                    return (
                      <tr
                        key={row.label}
                        className="border-b border-border/40 last:border-0 hover:bg-muted/20"
                      >
                        <th
                          scope="row"
                          className="sticky left-0 z-10 bg-card px-3 py-2 text-[10px] font-normal text-muted-foreground"
                        >
                          {row.label}
                        </th>
                        {items.map((tech, index) => {
                          const best =
                            max !== null &&
                            bestCount === 1 &&
                            rawValues?.[index] === max;

                          return (
                            <td
                              key={tech.slug}
                              className="px-3 py-2 text-[11px] whitespace-nowrap"
                            >
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5",
                                  best && "font-medium",
                                )}
                              >
                                {row.render(tech)}
                                {best && (
                                  <span className="inline-flex items-center gap-1">
                                    <span
                                      className="size-1 rounded-full bg-chart-1"
                                      aria-hidden="true"
                                    />
                                    <span className="sr-only">
                                      Melhor valor do comparativo
                                    </span>
                                  </span>
                                )}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  <tr className="bg-muted/30">
                    <th
                      colSpan={items.length + 1}
                      scope="colgroup"
                      className="px-3 py-2 font-mono text-[9px] font-normal tracking-[0.14em] text-muted-foreground uppercase"
                    >
                      scores editoriais · 0–100
                    </th>
                  </tr>

                  {SCORE_ROWS.map((row) => {
                    const rawValues = items.map((tech) => row.raw!(tech));
                    const max = Math.max(...rawValues);
                    const bestCount = rawValues.filter(
                      (value) => value === max,
                    ).length;

                    return (
                      <tr
                        key={row.label}
                        className="border-b border-border/40 last:border-0 hover:bg-muted/20"
                      >
                        <th
                          scope="row"
                          className="sticky left-0 z-10 bg-card px-3 py-2 text-[10px] font-normal text-muted-foreground"
                        >
                          {row.label}
                        </th>
                        {items.map((tech, index) => {
                          const value = row.raw!(tech);
                          const best = bestCount === 1 && value === max;

                          return (
                            <td
                              key={tech.slug}
                              className="px-3 py-2 text-[11px] whitespace-nowrap"
                            >
                              <span className="inline-flex items-center gap-2">
                                <span
                                  className={cn(
                                    "font-mono tabular-nums",
                                    best && "font-semibold text-foreground",
                                  )}
                                >
                                  {value}
                                </span>
                                <span className="h-1 w-16 overflow-hidden rounded-full bg-muted">
                                  <span
                                    className="block h-full rounded-full"
                                    style={{
                                      width: `${value}%`,
                                      background:
                                        SLOT_COLORS[
                                          index % SLOT_COLORS.length
                                        ],
                                    }}
                                  />
                                </span>
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1 rounded-full bg-chart-1" />
                melhor valor do comparativo
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-3" />
                scores são uma leitura editorial, não um benchmark
              </span>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <Sparkles className="size-3 text-chart-1" aria-hidden="true" />
        Dados públicos de npm + GitHub. Use os presets para trocar o contexto da
        comparação.
      </p>
    </div>
  );
}
