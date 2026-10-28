import Link from "next/link";
import {
  ArrowUpRight,
  GitCompareArrows,
  Layers,
  Radar,
  Sparkles,
  Tag,
  TrendingUp,
  Zap,
} from "lucide-react";

import { CategoryAdoptionChart, type AdoptionSeries } from "@/components/dashboard/adoption-chart";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { LatestReleases } from "@/components/dashboard/latest-releases";
import { MaturityDonut } from "@/components/dashboard/maturity-donut";
import { MomentumList } from "@/components/dashboard/momentum-list";
import { SignalFeed } from "@/components/dashboard/signal-feed";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { Sparkline } from "@/components/sparkline";
import { buttonVariants } from "@/components/ui/button";
import {
  CATEGORIES,
  MOMENTUM_AVERAGE,
  SNAPSHOT,
  getAdoptionSeries,
  getCategoryCounts,
  getCategoryGrowthSeries,
  getOverallSeries,
  getReleaseCountByMonth,
  getRisingTechnologies,
  getTechBySlug,
  releases,
  technologies,
} from "@/lib/data";
import { formatMonthShortKey } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Visão geral",
};

const series: AdoptionSeries = {
  "6": getCategoryGrowthSeries(6),
  "12": getCategoryGrowthSeries(12),
  "24": getCategoryGrowthSeries(24),
};

const categoryCounts = getCategoryCounts();
const rising = getRisingTechnologies();
const releaseMonths = getReleaseCountByMonth().slice(-3);
const maxReleases = Math.max(...releaseMonths.map((item) => item.count));
const majorCount = releases.filter((release) => release.type === "major").length;
const previewCount = releases.filter(
  (release) => release.type === "preview",
).length;

const categoryMomentum = CATEGORIES.map((category) => {
  const members = technologies.filter((tech) => tech.category === category.id);
  return {
    ...category,
    average: Math.round(
      members.reduce((total, tech) => total + tech.momentum, 0) / members.length,
    ),
  };
}).sort((a, b) => b.average - a.average);

const topCategory = categoryMomentum[0];
const typescript = getTechBySlug("typescript")!;
const overallSeries = getOverallSeries(12);

export default function OverviewPage() {
  return (
    <div className="space-y-3">
      <Reveal>
        <PageHeader
          eyebrow={`snapshot · ${SNAPSHOT.label}`}
          title="O pulso do frontend"
          description="Uma leitura visual do que está crescendo, do que já é padrão e do que merece um teste no seu próximo projeto."
          actions={
            <>
              <Link
                href="/radar"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <Radar />
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

      <Reveal delay={60}>
        <Link
          href="/tendencias?tech=typescript"
          className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-chart-1/25 bg-card/60 px-4 py-3.5 transition-colors hover:border-chart-1/45 hover:bg-card sm:flex-row sm:items-center"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 w-72 bg-[radial-gradient(ellipse_at_left,color-mix(in_oklab,var(--chart-1)_14%,transparent),transparent_70%)]" />
          <span className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-chart-1/12 text-chart-1 ring-1 ring-chart-1/20 ring-inset">
            <Zap className="size-4" aria-hidden="true" />
          </span>
          <div className="relative min-w-0 flex-1">
            <p className="font-mono text-[9px] tracking-[0.18em] text-chart-1 uppercase">
              destaque do snapshot
            </p>
            <p className="mt-0.5 text-[13px] leading-snug font-medium">
              TypeScript 7 é o maior salto de DX do trimestre: compilador nativo
              em Go, até 10x mais rápido.
            </p>
          </div>
          <div className="relative flex items-center gap-4 self-end sm:self-auto">
            <div className="hidden w-24 md:block">
              <Sparkline
                data={getAdoptionSeries(typescript, 12)}
                color="var(--chart-1)"
                className="h-7"
                filled={false}
                strokeWidth={1.5}
              />
            </div>
            <div className="text-right">
              <p className="font-mono text-lg leading-none font-semibold text-chart-1 tabular-nums">
                +210%
              </p>
              <p className="mt-0.5 text-[9px] tracking-wide text-muted-foreground uppercase">
                YoY
              </p>
            </div>
            <ArrowUpRight
              className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
              aria-hidden="true"
            />
          </div>
        </Link>
      </Reveal>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Reveal delay={90}>
          <KpiCard
            label="Tecnologias monitoradas"
            value={String(technologies.length)}
            icon={Layers}
            delta={
              <span className="rounded-full bg-chart-1/10 px-1.5 py-0.5 text-[10px] font-medium text-chart-1">
                +6
              </span>
            }
            hint={`5 categorias · ${categoryCounts.find((item) => item.id === "tooling")?.count} em build & tooling`}
          >
            <div className="flex h-1.5 w-full gap-px overflow-hidden rounded-full">
              {categoryCounts.map((item) => (
                <span
                  key={item.id}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{
                    width: `${(item.count / technologies.length) * 100}%`,
                    background:
                      CATEGORIES.find((category) => category.id === item.id)
                        ?.color ?? "var(--chart-1)",
                  }}
                  title={`${item.count} tecnologias`}
                />
              ))}
            </div>
          </KpiCard>
        </Reveal>

        <Reveal delay={130}>
          <KpiCard
            label="Em ascensão"
            value={String(rising.length)}
            icon={TrendingUp}
            accent="var(--chart-2)"
            delta={
              <span className="rounded-full bg-chart-2/10 px-1.5 py-0.5 text-[10px] font-medium text-chart-2">
                {rising.length} de {technologies.length}
              </span>
            }
            hint="crescimento igual ou acima de 15% YoY"
          >
            <div className="flex flex-wrap gap-1">
              {rising.slice(0, 3).map((tech) => (
                <span
                  key={tech.slug}
                  className="rounded border border-border/70 bg-muted/30 px-1.5 py-0.5 text-[9px] text-muted-foreground"
                >
                  {tech.name}
                </span>
              ))}
              <span className="px-1 py-0.5 text-[9px] text-muted-foreground">
                +{rising.length - 3}
              </span>
            </div>
          </KpiCard>
        </Reveal>

        <Reveal delay={170}>
          <KpiCard
            label="Releases · 90 dias"
            value={String(releases.length)}
            icon={Tag}
            accent="var(--chart-4)"
            delta={
              <span className="rounded-full bg-chart-4/10 px-1.5 py-0.5 text-[10px] font-medium text-chart-4">
                {majorCount} major
              </span>
            }
            hint={`${previewCount} preview e ${releases.length - majorCount - previewCount} minors no período`}
          >
            <div className="flex h-6 items-end gap-1.5">
              {releaseMonths.map((item) => (
                <span
                  key={item.month}
                  className="flex-1 rounded-sm bg-chart-4/25"
                  style={{
                    height: `${Math.max(20, (item.count / maxReleases) * 100)}%`,
                  }}
                  title={`${item.count} releases`}
                />
              ))}
            </div>
            <div className="flex gap-1.5 font-mono text-[9px] text-muted-foreground">
              {releaseMonths.map((item) => (
                <span key={item.month} className="flex-1 text-center">
                  {formatMonthShortKey(item.month)}
                </span>
              ))}
            </div>
          </KpiCard>
        </Reveal>

        <Reveal delay={210}>
          <KpiCard
            label="Momentum médio"
            value={`${MOMENTUM_AVERAGE}`}
            icon={Sparkles}
            accent="var(--chart-3)"
            delta={<span className="text-[10px] text-muted-foreground">/ 100</span>}
            hint={`${topCategory.shortLabel} lidera com média ${topCategory.average}`}
          >
            <div className="space-y-1.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-chart-2 via-chart-1 to-chart-4"
                  style={{ width: `${MOMENTUM_AVERAGE}%` }}
                />
              </div>
              <div className="flex items-center justify-between font-mono text-[9px] text-muted-foreground">
                <span>0</span>
                <span>100</span>
              </div>
            </div>
          </KpiCard>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Reveal delay={140} className="xl:col-span-8">
          <CategoryAdoptionChart series={series} />
        </Reveal>
        <Reveal delay={200} className="xl:col-span-4">
          <MomentumList />
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Reveal delay={160} className="xl:col-span-5">
          <SignalFeed />
        </Reveal>
        <Reveal delay={220} className="xl:col-span-3">
          <MaturityDonut />
        </Reveal>
        <Reveal delay={260} className="xl:col-span-4">
          <LatestReleases />
        </Reveal>
      </div>

      <Reveal delay={200}>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
          {[
            {
              title: "Adoção",
              text: "Índice de 0 a 100 que combina uso, downloads e intenção de adoção.",
            },
            {
              title: "Momentum",
              text: "Velocidade de crescimento somada à atividade do ecossistema.",
            },
            {
              title: "Anéis do radar",
              text: "Adotar → Testar → Avaliar → Observar. Do centro para fora.",
            },
          ].map((item, index) => (
            <div key={item.title} className="bg-card/80 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] text-muted-foreground tabular-nums">
                  0{index + 1}
                </span>
                <span className="text-xs font-medium">{item.title}</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={240}>
        <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-dashed px-4 py-3 text-[11px] text-muted-foreground sm:flex-row sm:items-center">
          <p className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-chart-1" aria-hidden="true" />
            Dados demonstrativos com curadoria editorial. Última atualização em{" "}
            {SNAPSHOT.updatedAt.split("-").reverse().join("/")}.
          </p>
          <Link
            href="/comparar"
            className="inline-flex items-center gap-1 font-medium text-foreground transition-opacity hover:opacity-70"
          >
            <GitCompareArrows className="size-3.5" aria-hidden="true" />
            Comparar tecnologias
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>

      <p className="sr-only">
        {`Tendência geral de adoção no período: ${overallSeries[0]} para ${overallSeries[overallSeries.length - 1]}.`}
      </p>
    </div>
  );
}
