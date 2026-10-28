"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Download,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
  SearchX,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { CategoryDot, CategoryIcon } from "@/components/category-icon";
import { GrowthBadge } from "@/components/growth-badge";
import { MaturityBadge } from "@/components/maturity-badge";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { TechCard } from "@/components/tendencias/tech-card";
import { TechDetailDialog } from "@/components/tech-detail-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  MATURITIES,
  SNAPSHOT,
  getTechBySlug,
  technologies,
} from "@/lib/data";
import { downloadTechnologiesCsv } from "@/lib/csv";
import { formatCompact } from "@/lib/format";
import type { CategoryId, MaturityId, Technology } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategoryFilter = CategoryId | "all";
type MaturityFilter = MaturityId | "all";
type SortKey = "momentum" | "adoption" | "growth" | "name" | "downloads";
type ViewMode = "grid" | "list";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "momentum", label: "Momentum" },
  { value: "adoption", label: "Adoção" },
  { value: "growth", label: "Crescimento" },
  { value: "downloads", label: "Downloads" },
  { value: "name", label: "Nome (A–Z)" },
];

const MATURITY_OPTIONS: { value: MaturityFilter; label: string }[] = [
  { value: "all", label: "Toda maturidade" },
  ...MATURITIES.map((maturity) => ({
    value: maturity.id,
    label: maturity.label,
  })),
];

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string; count: number }[] =
  [
    { value: "all", label: "Todas", count: technologies.length },
    ...CATEGORIES.map((category) => ({
      value: category.id,
      label: category.label,
      count: technologies.filter((tech) => tech.category === category.id).length,
    })),
  ];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function parseSort(value: string | null): SortKey {
  return SORT_OPTIONS.some((option) => option.value === value)
    ? (value as SortKey)
    : "momentum";
}

export function TrendsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [maturity, setMaturity] = useState<MaturityFilter>("all");
  const [sort, setSort] = useState<SortKey>(() =>
    parseSort(searchParams.get("sort")),
  );
  const [view, setView] = useState<ViewMode>("grid");
  const deferredQuery = useDeferredValue(query);

  const selectedTech = useMemo(() => {
    const slug = searchParams.get("tech");
    if (!slug) return null;
    return getTechBySlug(slug) ?? null;
  }, [searchParams]);

  const filtered = useMemo(() => {
    const term = normalize(deferredQuery.trim());

    const result = technologies.filter((tech) => {
      const matchesCategory = category === "all" || tech.category === category;
      const matchesMaturity = maturity === "all" || tech.maturity === maturity;
      const haystack = normalize(
        [
          tech.name,
          tech.version,
          tech.tagline,
          tech.description,
          tech.maintainer,
          ...tech.tags,
        ].join(" "),
      );
      return matchesCategory && matchesMaturity && haystack.includes(term);
    });

    return result.sort((a, b) => {
      switch (sort) {
        case "adoption":
          return b.adoption - a.adoption;
        case "growth":
          return b.growth - a.growth;
        case "downloads":
          return b.downloads - a.downloads;
        case "name":
          return a.name.localeCompare(b.name, "pt-BR");
        default:
          return b.momentum - a.momentum;
      }
    });
  }, [category, deferredQuery, maturity, sort]);

  const hasFilters =
    query.length > 0 || category !== "all" || maturity !== "all";

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setMaturity("all");
  };

  const openTech = (tech: Technology) => {
    const suffix = sort === "momentum" ? "" : `&sort=${sort}`;
    router.replace(`/tendencias?tech=${tech.slug}${suffix}`, { scroll: false });
  };

  const closeTech = () => {
    const suffix = sort === "momentum" ? "" : `?sort=${sort}`;
    router.replace(`/tendencias${suffix}`, { scroll: false });
  };

  const exportCsv = () => {
    downloadTechnologiesCsv(filtered);
    toast.success(`${filtered.length} tecnologias exportadas`, {
      description: "Arquivo CSV com os filtros atuais.",
    });
  };

  return (
    <div className="space-y-4">
      <Reveal>
        <PageHeader
          eyebrow={`catálogo · ${SNAPSHOT.label}`}
          title="Tendências & tecnologias"
          description="Explore o catálogo completo, filtre por estágio de maturidade e compare o momentum de cada ferramenta."
          actions={
            <Button variant="outline" onClick={exportCsv} disabled={!filtered.length}>
              <Download />
              Exportar CSV
            </Button>
          }
        />
      </Reveal>

      <Reveal delay={60}>
        <div className="rounded-xl border bg-card/60 p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative w-full xl:max-w-sm">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar tecnologia, tag ou mantenedor..."
                aria-label="Buscar tecnologias"
                className="h-9 bg-background/50 pl-8 pr-8 text-sm"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Limpar busca"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:ml-auto">
              <div className="hidden items-center gap-1.5 text-[10px] text-muted-foreground sm:flex">
                <SlidersHorizontal className="size-3" aria-hidden="true" />
                Filtrar
              </div>

              <Select
                items={MATURITY_OPTIONS}
                value={maturity}
                onValueChange={(value) =>
                  setMaturity(value as MaturityFilter)
                }
              >
                <SelectTrigger
                  size="sm"
                  className="h-8 bg-background/50 text-xs"
                  aria-label="Filtrar por maturidade"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATURITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                items={SORT_OPTIONS}
                value={sort}
                onValueChange={(value) => setSort(value as SortKey)}
              >
                <SelectTrigger
                  size="sm"
                  className="h-8 bg-background/50 text-xs"
                  aria-label="Ordenar tecnologias"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex h-8 items-center gap-0.5 rounded-lg border bg-muted/30 p-0.5">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  aria-label="Visualizar em grade"
                  aria-pressed={view === "grid"}
                  className={cn(
                    "flex size-6.5 items-center justify-center rounded-[6px] text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
                    view === "grid" &&
                      "bg-background text-foreground shadow-sm ring-1 ring-border/70",
                  )}
                >
                  <LayoutGrid className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  aria-label="Visualizar em lista"
                  aria-pressed={view === "list"}
                  className={cn(
                    "flex size-6.5 items-center justify-center rounded-[6px] text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
                    view === "list" &&
                      "bg-background text-foreground shadow-sm ring-1 ring-border/70",
                  )}
                >
                  <List className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {CATEGORY_OPTIONS.map((option) => {
              const active = category === option.value;
              const color =
                option.value === "all"
                  ? undefined
                  : CATEGORY_MAP[option.value].color;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCategory(option.value)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[11px] transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    active
                      ? "border-foreground/80 bg-foreground text-background"
                      : "border-border/80 bg-background/40 text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                  )}
                >
                  {color ? (
                    <span
                      className="size-1.5 rounded-full"
                      style={{ background: color }}
                    />
                  ) : (
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        active ? "bg-background" : "bg-foreground/60",
                      )}
                    />
                  )}
                  {option.label}
                  <span
                    className={cn(
                      "font-mono text-[9px] tabular-nums",
                      active ? "text-background/70" : "text-muted-foreground",
                    )}
                  >
                    {option.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-[11px] text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">{filtered.length}</span>{" "}
          de {technologies.length} tecnologias
          {hasFilters && " com os filtros atuais"}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            Limpar filtros
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/40 px-6 py-20 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchX className="size-5" />
          </span>
          <p className="mt-4 text-sm font-medium">Nenhuma tecnologia encontrada</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Tente outro termo ou remova os filtros de categoria e maturidade.
          </p>
          <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
            Limpar filtros
          </Button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((tech, index) => (
            <Reveal key={tech.slug} delay={Math.min(index * 24, 240)}>
              <TechCard tech={tech} onSelect={openTech} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card/70">
          <div className="hidden grid-cols-[minmax(0,1.8fr)_130px_120px_80px_90px_110px] items-center gap-3 border-b bg-muted/30 px-4 py-2 font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase md:grid">
            <span>Tecnologia</span>
            <span>Categoria</span>
            <span>Maturidade</span>
            <span className="text-right">Adoção</span>
            <span className="text-right">Momentum</span>
            <span className="text-right">Crescimento</span>
          </div>
          {filtered.map((tech) => {
            const meta = CATEGORY_MAP[tech.category];
            return (
              <button
                key={tech.slug}
                type="button"
                onClick={() => openTech(tech)}
                className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/60 px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-muted/30 focus-visible:bg-muted/30 focus-visible:outline-none md:grid-cols-[minmax(0,1.8fr)_130px_120px_80px_90px_110px] md:px-4"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <CategoryIcon
                    category={tech.category}
                    className="size-7 rounded-md"
                    iconClassName="size-3.5"
                  />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="truncate text-xs font-medium">
                        {tech.name}
                      </span>
                      <span className="font-mono text-[9px] text-muted-foreground">
                        {tech.kind === "platform"
                          ? tech.version
                          : `v${tech.version}`}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground md:hidden">
                      {meta.shortLabel} ·{" "}
                      {tech.kind === "platform"
                        ? "padrão web"
                        : `${formatCompact(tech.downloads)} / semana`}
                    </p>
                  </div>
                </div>

                <span className="hidden items-center gap-1.5 text-[11px] text-muted-foreground md:flex">
                  <CategoryDot category={tech.category} />
                  {meta.shortLabel}
                </span>
                <span className="hidden md:block">
                  <MaturityBadge maturity={tech.maturity} />
                </span>
                <span className="hidden text-right font-mono text-xs tabular-nums md:block">
                  {tech.adoption}
                </span>
                <span className="text-right font-mono text-xs font-medium tabular-nums">
                  {tech.momentum}
                </span>
                <span className="hidden justify-end md:flex">
                  <GrowthBadge value={tech.growth} suffix="" />
                </span>
              </button>
            );
          })}
        </div>
      )}

      <p className="text-center text-[10px] text-muted-foreground">
        Clique em uma tecnologia para abrir a ficha completa · snapshot{" "}
        {SNAPSHOT.label}
      </p>

      <TechDetailDialog tech={selectedTech} onClose={closeTech} />
    </div>
  );
}
