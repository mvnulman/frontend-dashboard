"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Maximize2,
} from "lucide-react";

import { CategoryDot, CategoryIcon } from "@/components/category-icon";
import { GrowthBadge } from "@/components/growth-badge";
import { MaturityBadge } from "@/components/maturity-badge";
import { PageHeader } from "@/components/page-header";
import { RadarChart } from "@/components/radar/radar-chart";
import { Reveal } from "@/components/reveal";
import { Sparkline } from "@/components/sparkline";
import { TechDetailDialog } from "@/components/tech-detail-dialog";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CATEGORIES,
  CATEGORY_MAP,
  MATURITIES,
  MATURITY_MAP,
  SNAPSHOT,
  getAdoptionSeries,
  getMaturityCounts,
  getMomentumLeaders,
  technologies,
} from "@/lib/data";
import { formatCompact } from "@/lib/format";
import type { CategoryId, Technology } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategoryFilter = CategoryId | "all";

const maturityCounts = getMaturityCounts();
const ranked = [...technologies].sort((a, b) => b.momentum - a.momentum);

export function RadarClient() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [selected, setSelected] = useState<Technology>(() => getMomentumLeaders(1)[0]);
  const [dialogTech, setDialogTech] = useState<Technology | null>(null);

  const visible = useMemo(
    () =>
      category === "all"
        ? technologies
        : technologies.filter((tech) => tech.category === category),
    [category],
  );

  const visibleRanked = useMemo(
    () => [...visible].sort((a, b) => b.momentum - a.momentum),
    [visible],
  );

  const selectTech = (tech: Technology) => {
    setSelected(tech);
    if (category !== "all" && tech.category !== category) {
      setCategory("all");
    }
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      document
        .getElementById("radar-detail")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const cycle = (direction: 1 | -1) => {
    const list = visibleRanked.length ? visibleRanked : ranked;
    const current = list.findIndex((tech) => tech.slug === selected.slug);
    const nextIndex =
      (current + direction + list.length) % list.length;
    setSelected(list[nextIndex]);
  };

  const changeCategory = (next: CategoryFilter) => {
    setCategory(next);
    if (next === "all") return;
    const first = technologies
      .filter((tech) => tech.category === next)
      .sort((a, b) => b.momentum - a.momentum)[0];
    if (first) setSelected(first);
  };

  const meta = CATEGORY_MAP[selected.category];
  const maturity = MATURITY_MAP[selected.maturity];
  const rank = ranked.findIndex((tech) => tech.slug === selected.slug) + 1;
  const selectedSeries = getAdoptionSeries(selected, 12);

  return (
    <div className="space-y-4">
      <Reveal>
        <PageHeader
          eyebrow={`radar · ${SNAPSHOT.label}`}
          title="Radar de tecnologias"
          description="Uma leitura do ciclo de adoção: raio indica maturidade, cor indica categoria. Clique em qualquer ponto para investigar."
          actions={
            <>
              <Link
                href="/tendencias"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <Maximize2 />
                Ver catálogo
              </Link>
              <Link href="/comparar" className={cn(buttonVariants())}>
                Comparar
              </Link>
            </>
          }
        />
      </Reveal>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Reveal delay={60} className="xl:col-span-8">
          <Card className="h-full gap-3 bg-card/70">
            <CardHeader>
              <CardTitle>Mapa de adoção</CardTitle>
              <CardDescription>
                {visible.length} tecnologias · anéis de maturidade · 5 categorias
              </CardDescription>
              <CardAction>
                <span className="hidden items-center gap-1.5 font-mono text-[9px] text-muted-foreground sm:flex">
                  <span className="size-1.5 rounded-full bg-chart-1" />
                  raio = maturidade
                </span>
              </CardAction>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setCategory("all")}
                  aria-pressed={category === "all"}
                  className={cn(
                    "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[11px] transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    category === "all"
                      ? "border-foreground/80 bg-foreground text-background"
                      : "border-border/80 bg-background/40 text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      category === "all" ? "bg-background" : "bg-foreground/60",
                    )}
                  />
                  Todas
                  <span className="font-mono text-[9px] opacity-60">
                    {technologies.length}
                  </span>
                </button>
                {CATEGORIES.map((item) => {
                  const active = category === item.id;
                  const count = technologies.filter(
                    (tech) => tech.category === item.id,
                  ).length;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => changeCategory(item.id)}
                      aria-pressed={active}
                      className={cn(
                        "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[11px] transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                        active
                          ? "border-foreground/80 bg-foreground text-background"
                          : "border-border/80 bg-background/40 text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                      )}
                    >
                      <span
                        className="size-1.5 rounded-full"
                        style={{ background: item.color }}
                      />
                      {item.shortLabel}
                      <span className="font-mono text-[9px]">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <RadarChart
                category={category}
                selectedSlug={selected.slug}
                onSelect={selectTech}
              />

              <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-3 lg:grid-cols-4">
                {MATURITIES.map((item, index) => {
                  const count =
                    maturityCounts.find((entry) => entry.id === item.id)
                      ?.count ?? 0;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/30 px-2 py-1.5"
                    >
                      <span
                        className="flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed font-mono text-[9px]"
                        style={{ borderColor: item.color, color: item.color }}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium">
                          {item.label}
                          <span className="ml-1 font-mono text-[9px] font-normal text-muted-foreground">
                            {count}
                          </span>
                        </p>
                        <p className="truncate text-[9px] text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={120} className="xl:col-span-4">
          <Card
            id="radar-detail"
            className="h-fit scroll-mt-20 gap-3 bg-card/70 xl:sticky xl:top-20"
          >
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[9px] tracking-[0.18em] text-muted-foreground uppercase">
                  em foco
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <CategoryDot category={selected.category} />
                  {meta.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CategoryIcon
                  category={selected.category}
                  className="size-10 rounded-xl"
                  iconClassName="size-4.5"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <CardTitle className="truncate text-lg">
                      {selected.name}
                    </CardTitle>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {selected.kind === "platform"
                        ? selected.version
                        : `v${selected.version}`}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <MaturityBadge maturity={selected.maturity} />
                    <span className="font-mono text-[9px] text-muted-foreground">
                      #{rank} em momentum
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {selected.tagline}
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Adoção", value: `${selected.adoption}`, hint: "/100" },
                  {
                    label: "Momentum",
                    value: `${selected.momentum}`,
                    hint: "/100",
                  },
                  {
                    label: "Crescimento",
                    value: null,
                    hint: null,
                  },
                  {
                    label: "Alcance",
                    value:
                      selected.kind === "platform"
                        ? "Web"
                        : formatCompact(selected.downloads),
                    hint: selected.kind === "platform" ? "padrão" : "/semana",
                  },
                ].map((metric) =>
                  metric.label === "Crescimento" ? (
                    <div
                      key={metric.label}
                      className="rounded-lg border border-border/60 bg-background/30 px-2.5 py-2"
                    >
                      <p className="text-[9px] tracking-wide text-muted-foreground uppercase">
                        {metric.label}
                      </p>
                      <div className="mt-1">
                        <GrowthBadge value={selected.growth} suffix="" />
                      </div>
                    </div>
                  ) : (
                    <div
                      key={metric.label}
                      className="rounded-lg border border-border/60 bg-background/30 px-2.5 py-2"
                    >
                      <p className="text-[9px] tracking-wide text-muted-foreground uppercase">
                        {metric.label}
                      </p>
                      <p className="mt-1 font-mono text-base leading-none font-semibold tabular-nums">
                        {metric.value}
                        <span className="ml-0.5 text-[9px] font-normal text-muted-foreground">
                          {metric.hint}
                        </span>
                      </p>
                    </div>
                  ),
                )}
              </div>

              <div className="rounded-lg border border-border/60 bg-background/30 px-2.5 pt-2 pb-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground">
                    Trajetória · 12 meses
                  </span>
                  <span className="font-mono text-[9px] tabular-nums">
                    {selected.adoption}
                  </span>
                </div>
                <Sparkline
                  data={selectedSeries}
                  color={meta.color}
                  className="h-12"
                  showDot
                />
              </div>

              <p className="line-clamp-3 text-[11px] leading-relaxed text-muted-foreground">
                {selected.description}
              </p>

              <div className="flex flex-wrap gap-1">
                {selected.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-border/60 bg-muted/20 px-1.5 py-0.5 text-[9px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-1.5 border-t border-border/60 pt-2.5">
                {selected.highlights.slice(0, 2).map((highlight) => (
                  <div
                    key={highlight}
                    className="flex gap-1.5 text-[10px] leading-relaxed text-muted-foreground"
                  >
                    <Check
                      className="mt-0.5 size-3 shrink-0"
                      style={{ color: meta.color }}
                      aria-hidden="true"
                    />
                    {highlight}
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-border/60 bg-background/30 px-2.5 py-2 text-[9px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">Quando usar: </span>
                {selected.useCase}
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/30 px-2.5 py-2 text-[9px] text-muted-foreground">
                <span>
                  Anel {MATURITIES.findIndex((m) => m.id === selected.maturity) + 1} de 4
                </span>
                <span style={{ color: maturity.color }}>{maturity.label}</span>
              </div>
            </CardContent>

            <CardFooter className="mt-auto justify-between border-t border-border/60 bg-transparent px-4 pt-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => cycle(-1)}
                  aria-label="Tecnologia anterior"
                  className="flex size-7 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => cycle(1)}
                  aria-label="Próxima tecnologia"
                  className="flex size-7 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ChevronRight className="size-3.5" />
                </button>
                <Link
                  href="/tendencias"
                  className="ml-1 inline-flex items-center gap-0.5 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Catálogo
                  <ExternalLink className="size-2.5" />
                </Link>
              </div>
              <button
                type="button"
                onClick={() => setDialogTech(selected)}
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Ficha completa
                <ArrowUpRight />
              </button>
            </CardFooter>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={180}>
        <Card className="gap-3 bg-card/70">
          <CardHeader>
            <CardTitle>Índice do radar</CardTitle>
            <CardDescription>
              Todas as {technologies.length} tecnologias organizadas por
              categoria · ordem de momentum
            </CardDescription>
            <CardAction>
              <button
                type="button"
                onClick={() => setCategory("all")}
                className="text-[10px] text-muted-foreground transition-colors hover:text-foreground"
              >
                Ver todas
              </button>
            </CardAction>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-5">
            {CATEGORIES.map((cat) => {
              const items = technologies
                .filter((tech) => tech.category === cat.id)
                .sort((a, b) => b.momentum - a.momentum);
              const active = category === cat.id;

              return (
                <div key={cat.id}>
                  <button
                    type="button"
                    onClick={() =>
                      changeCategory(active ? "all" : cat.id)
                    }
                    className={cn(
                      "flex w-full items-center gap-1.5 rounded-md px-1 py-1 text-left text-[10px] font-medium transition-colors hover:bg-muted/40",
                      active && "bg-muted/50",
                    )}
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ background: cat.color }}
                    />
                    {cat.label}
                    <span className="ml-auto font-mono text-[9px] font-normal text-muted-foreground">
                      {items.length}
                    </span>
                  </button>

                  <ul className="mt-1 space-y-px">
                    {items.map((tech) => {
                      const isSelected = tech.slug === selected.slug;
                      return (
                        <li key={tech.slug}>
                          <button
                            type="button"
                            onClick={() => selectTech(tech)}
                            className={cn(
                              "flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[10px] transition-colors",
                              isSelected
                                ? "bg-foreground/8 text-foreground"
                                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                            )}
                          >
                            <span
                              className="size-1 shrink-0 rounded-full"
                              style={{
                                background: MATURITY_MAP[tech.maturity].color,
                              }}
                            />
                            <span className="truncate">{tech.name}</span>
                            <span className="ml-auto font-mono text-[9px] tabular-nums">
                              {tech.momentum}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </Reveal>

      <TechDetailDialog
        tech={dialogTech}
        onClose={() => setDialogTech(null)}
      />
    </div>
  );
}
