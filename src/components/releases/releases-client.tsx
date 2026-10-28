"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Filter,
  GitBranch,
  Sparkles,
  Tag,
  TrendingUp,
  X,
} from "lucide-react";

import { CategoryDot } from "@/components/category-icon";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { Segmented } from "@/components/segmented";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
  CATEGORIES,
  CATEGORY_MAP,
  SNAPSHOT,
  getReleaseCountByMonth,
  getTechBySlug,
  releases,
} from "@/lib/data";
import {
  formatDay,
  formatMonth,
  formatMonthKey,
  formatMonthShortKey,
} from "@/lib/format";
import type { CategoryId, Release, ReleaseType } from "@/lib/types";
import { cn } from "@/lib/utils";

type TypeFilter = ReleaseType | "all";
type CategoryFilter = CategoryId | "all";

const TYPE_META: Record<
  ReleaseType,
  { label: string; color: string; description: string }
> = {
  major: {
    label: "Major",
    color: "var(--chart-4)",
    description: "Pode exigir migração",
  },
  minor: {
    label: "Minor",
    color: "var(--chart-2)",
    description: "Evolução incremental",
  },
  preview: {
    label: "Preview",
    color: "var(--chart-3)",
    description: "Ainda não é estável",
  },
};

const IMPACT_META = {
  alto: { label: "impacto alto", color: "var(--chart-5)" },
  médio: { label: "impacto médio", color: "var(--chart-4)" },
  baixo: { label: "impacto baixo", color: "var(--muted-foreground)" },
} as const;

const majorCount = releases.filter((release) => release.type === "major").length;
const minorCount = releases.filter((release) => release.type === "minor").length;
const previewCount = releases.filter(
  (release) => release.type === "preview",
).length;

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: `Todos ${releases.length}` },
  { value: "major", label: `Major ${majorCount}` },
  { value: "minor", label: `Minor ${minorCount}` },
  { value: "preview", label: `Preview ${previewCount}` },
];

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "Toda categoria" },
  ...CATEGORIES.map((category) => ({
    value: category.id,
    label: category.label,
  })),
];

const categoryCounts = CATEGORIES.map((category) => ({
  ...category,
  count: releases.filter(
    (release) => getTechBySlug(release.techSlug)?.category === category.id,
  ).length,
})).sort((a, b) => b.count - a.count);

const impactCounts = (["alto", "médio", "baixo"] as const).map((impact) => ({
  impact,
  count: releases.filter((release) => release.impact === impact).length,
}));

const monthCounts = getReleaseCountByMonth().slice(-3);
const maxMonthCount = Math.max(...monthCounts.map((item) => item.count));

function ReleaseRow({ release }: { release: Release }) {
  const tech = getTechBySlug(release.techSlug);
  const type = TYPE_META[release.type];
  const impact = IMPACT_META[release.impact];

  return (
    <article
      id={release.id}
      className="group relative scroll-mt-28 pb-5 pl-7 last:pb-0"
    >
      <span
        className="absolute top-1 left-[3px] size-2.5 rounded-full ring-4 ring-background"
        style={{ background: type.color }}
        aria-hidden="true"
      />

      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-[13px] leading-snug font-medium">
              {release.title}
            </h3>
            <span
              className="inline-flex h-4 items-center rounded px-1 font-mono text-[9px] ring-1 ring-inset ring-current/20"
              style={{
                color: type.color,
                backgroundColor: `color-mix(in oklab, ${type.color} 10%, transparent)`,
              }}
            >
              {type.label}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-[9px] text-muted-foreground">
            <span className="text-foreground/70">
              {tech?.name}{" "}
              {tech?.kind === "platform"
                ? release.version
                : `v${release.version}`}
            </span>
            {tech && (
              <>
                <span className="text-border">/</span>
                <span className="inline-flex items-center gap-1">
                  <CategoryDot category={tech.category} />
                  {CATEGORY_MAP[tech.category].shortLabel}
                </span>
              </>
            )}
            <span className="text-border">/</span>
            <span className="inline-flex items-center gap-1">
              <span
                className="size-1 rounded-full"
                style={{ background: impact.color }}
              />
              {impact.label}
            </span>
          </div>

          <p className="mt-1.5 max-w-2xl text-[11px] leading-relaxed text-muted-foreground">
            {release.summary}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1">
            {release.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-border/60 bg-muted/20 px-1.5 py-0.5 text-[9px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            <Link
              href={`/tendencias?tech=${release.techSlug}`}
              className="ml-1 inline-flex items-center gap-0.5 text-[9px] text-muted-foreground transition-colors hover:text-foreground"
            >
              ver tecnologia
              <ArrowUpRight className="size-2.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
          <span className="font-mono text-[10px] text-muted-foreground capitalize">
            {formatMonth(release.date)}
          </span>
          <span className="font-mono text-sm font-medium tabular-nums">
            {formatDay(release.date)}
          </span>
        </div>
      </div>
    </article>
  );
}

export function ReleasesClient() {
  const [type, setType] = useState<TypeFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");

  const filtered = useMemo(() => {
    return releases.filter((release) => {
      const matchesType = type === "all" || release.type === type;
      const tech = getTechBySlug(release.techSlug);
      const matchesCategory =
        category === "all" || tech?.category === category;
      return matchesType && matchesCategory;
    });
  }, [category, type]);

  const groups = useMemo(() => {
    const map = new Map<string, Release[]>();
    for (const release of filtered) {
      const key = release.date.slice(0, 7);
      map.set(key, [...(map.get(key) ?? []), release]);
    }
    return [...map.entries()].sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const hasFilters = type !== "all" || category !== "all";

  return (
    <div className="space-y-4">
      <Reveal>
        <PageHeader
          eyebrow={`releases · ${SNAPSHOT.label}`}
          title="Timeline de lançamentos"
          description="O ritmo de evolução do ecossistema em um só lugar. Filtre por tipo de release ou categoria e acompanhe o que muda em cada versão."
          actions={
            <>
              <Link
                href="/radar"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <GitBranch />
                Abrir radar
              </Link>
              <Link href="/tendencias" className={cn(buttonVariants())}>
                <TrendingUp />
                Explorar tendências
              </Link>
            </>
          }
        />
      </Reveal>

      <Reveal delay={50}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            {
              label: "Releases",
              value: releases.length,
              hint: "últimos 90 dias",
              icon: Tag,
              color: "var(--chart-2)",
            },
            {
              label: "Major",
              value: majorCount,
              hint: "breaking changes",
              icon: GitBranch,
              color: "var(--chart-4)",
            },
            {
              label: "Minor",
              value: minorCount,
              hint: "evolução contínua",
              icon: CalendarDays,
              color: "var(--chart-1)",
            },
            {
              label: "Preview",
              value: previewCount,
              hint: "aguardando estabilidade",
              icon: Sparkles,
              color: "var(--chart-3)",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border bg-card/60 px-3.5 py-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  {stat.label}
                </span>
                <stat.icon
                  className="size-3.5"
                  style={{ color: stat.color }}
                  aria-hidden="true"
                />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {stat.hint}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Reveal delay={100} className="xl:col-span-8">
          <Card className="h-full gap-3 bg-card/70">
            <CardHeader>
              <CardTitle>Linha do tempo</CardTitle>
              <CardDescription>
                {filtered.length} de {releases.length} releases · mais recentes
                primeiro
              </CardDescription>
              <CardAction>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setType("all");
                      setCategory("all");
                    }}
                    className="inline-flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-3" aria-hidden="true" />
                    Limpar
                  </button>
                )}
              </CardAction>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Segmented
                  ariaLabel="Filtrar por tipo de release"
                  options={TYPE_OPTIONS}
                  value={type}
                  onChange={setType}
                />
                <div className="ml-auto flex items-center gap-1.5">
                  <Filter
                    className="size-3 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Select
                    items={CATEGORY_OPTIONS}
                    value={category}
                    onValueChange={(value) =>
                      setCategory(value as CategoryFilter)
                    }
                  >
                    <SelectTrigger
                      size="sm"
                      className="h-8 bg-background/50 text-xs"
                      aria-label="Filtrar releases por categoria"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-16 text-center">
                  <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Filter className="size-4" />
                  </span>
                  <p className="mt-3 text-xs font-medium">
                    Nenhum release neste filtro
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Tente combinar outro tipo com outra categoria.
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <div
                    className="absolute top-4 bottom-4 left-[7px] w-px bg-border"
                    aria-hidden="true"
                  />
                  {groups.map(([month, items]) => (
                    <div key={month} className="relative">
                      <div className="sticky top-14 z-10 -mx-1 mb-1 flex items-center gap-2.5 bg-card/95 px-1 py-2 backdrop-blur">
                        <span className="text-xs font-medium">
                          {formatMonthKey(month)}
                        </span>
                        <span className="font-mono text-[9px] text-muted-foreground">
                          {items.length}{" "}
                          {items.length === 1 ? "release" : "releases"}
                        </span>
                        <span className="h-px flex-1 bg-border/70" />
                      </div>
                      {items.map((release) => (
                        <ReleaseRow key={release.id} release={release} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={150} className="xl:col-span-4">
          <div className="flex flex-col gap-3 xl:sticky xl:top-20">
            <Card className="gap-3 bg-card/70">
              <CardHeader>
                <CardTitle>Resumo do trimestre</CardTitle>
                <CardDescription>
                  ago–out 2026 · {releases.length} releases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                    <span className="font-mono tracking-[0.14em] uppercase">
                      cadência
                    </span>
                    <span>releases / mês</span>
                  </div>
                  <div className="mt-2 flex h-16 items-end gap-2">
                    {monthCounts.map((item) => (
                      <div
                        key={item.month}
                        className="flex flex-1 flex-col items-center gap-1"
                      >
                        <span className="font-mono text-[9px] text-muted-foreground tabular-nums">
                          {item.count}
                        </span>
                        <div
                          className="w-full overflow-hidden rounded-sm bg-muted"
                          style={{ height: 40 }}
                        >
                          <div
                            className="mt-auto h-full w-full rounded-sm bg-gradient-to-t from-chart-2/50 to-chart-2 transition-all duration-700"
                            style={{
                              height: `${Math.max(18, (item.count / maxMonthCount) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono text-[8px] text-muted-foreground">
                          {formatMonthShortKey(item.month)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <p className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
                    por categoria
                  </p>
                  {categoryCounts.map((category) => (
                    <div key={category.id} className="flex items-center gap-2">
                      <CategoryDot category={category.id} />
                      <span className="w-28 truncate text-[10px] text-muted-foreground">
                        {category.shortLabel}
                      </span>
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(category.count / releases.length) * 100}%`,
                            background: category.color,
                          }}
                        />
                      </div>
                      <span className="w-4 text-right font-mono text-[9px] tabular-nums">
                        {category.count}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <p className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
                    impacto
                  </p>
                  <div className="flex gap-2">
                    {impactCounts.map((item) => (
                      <div
                        key={item.impact}
                        className="flex flex-1 items-center gap-1.5 rounded-md border border-border/60 bg-background/30 px-2 py-1.5"
                      >
                        <span
                          className="size-1.5 rounded-full"
                          style={{ background: IMPACT_META[item.impact].color }}
                        />
                        <span className="text-[9px] text-muted-foreground capitalize">
                          {item.impact}
                        </span>
                        <span className="ml-auto font-mono text-[10px] tabular-nums">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gap-3 border-chart-1/20 bg-card/60">
              <CardHeader>
                <CardTitle className="text-sm">O que observar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {[
                  `${categoryCounts[0].label} concentra ${categoryCounts[0].count} dos ${releases.length} lançamentos do trimestre.`,
                  `${majorCount} majors em 90 dias: revise o plano de upgrades antes do próximo ciclo.`,
                  "TypeScript 7 está em preview público — vale testar, mas ainda não é padrão de produção.",
                ].map((insight) => (
                  <div key={insight} className="flex gap-2">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-chart-1" />
                    <p className="text-[10px] leading-relaxed text-muted-foreground">
                      {insight}
                    </p>
                  </div>
                ))}
                <Link
                  href="/comparar"
                  className="inline-flex items-center gap-1 pt-1 text-[10px] font-medium text-foreground transition-opacity hover:opacity-70"
                >
                  Comparar tecnologias
                  <ArrowUpRight className="size-3" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
