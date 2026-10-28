import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
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

import { CategoryDownloadsChart } from "@/components/dashboard/downloads-chart";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { LatestReleases } from "@/components/dashboard/latest-releases";
import { MaturityDonut } from "@/components/dashboard/maturity-donut";
import { MomentumList } from "@/components/dashboard/momentum-list";
import { SignalFeed } from "@/components/dashboard/signal-feed";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { SourceNotice } from "@/components/source-notice";
import { PageSkeleton } from "@/components/shell/page-skeleton";
import { Sparkline } from "@/components/sparkline";
import { buttonVariants } from "@/components/ui/button";
import { CATEGORIES, MATURITIES } from "@/lib/data";
import { getDashboardData } from "@/lib/live";
import {
  formatCompact,
  formatMonthShortKey,
  formatSigned,
} from "@/lib/format";
import type { DashboardData, MaturityId } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Visão geral",
};

export default function OverviewPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <OverviewContent />
    </Suspense>
  );
}

async function OverviewContent() {
  await connection();
  const data = await getDashboardData();

  return <OverviewView data={data} />;
}

function OverviewView({ data }: { data: DashboardData }) {
  const live = data.technologies.filter((tech) => tech.live);
  const rising = live
    .filter((tech) => tech.growth >= 15)
    .sort((a, b) => b.growth - a.growth);
  const topGrowth = [...live].sort((a, b) => b.growth - a.growth)[0];
  const momentumLeaders = [...live]
    .sort((a, b) => b.momentum - a.momentum)
    .slice(0, 5);
  const averageMomentum = live.length
    ? Math.round(
        live.reduce((total, tech) => total + tech.momentum, 0) / live.length,
      )
    : 0;

  const categoryMomentum = CATEGORIES.map((category) => {
    const members = live.filter((tech) => tech.category === category.id);
    return {
      ...category,
      average: members.length
        ? Math.round(
            members.reduce((total, tech) => total + tech.momentum, 0) /
              members.length,
          )
        : 0,
    };
  }).sort((a, b) => b.average - a.average);

  const topCategory = categoryMomentum[0];
  const categoryCounts = CATEGORIES.map((category) => ({
    id: category.id,
    count: data.technologies.filter((tech) => tech.category === category.id)
      .length,
  }));
  const maturityCounts = MATURITIES.map((maturity) => ({
    id: maturity.id as MaturityId,
    count: data.technologies.filter((tech) => tech.maturity === maturity.id)
      .length,
  }));

  const generatedAt = new Date(data.generatedAt);
  const majorCount = data.releaseCounts.major;
  const previewCount = data.releaseCounts.preview;

  const releaseMonths = Array.from({ length: 3 }, (_, index) => {
    const date = new Date(
      Date.UTC(generatedAt.getUTCFullYear(), generatedAt.getUTCMonth() - index, 1),
    );
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    return {
      key,
      label: formatMonthShortKey(key),
      count: data.releases.filter((release) => release.date.startsWith(key))
        .length,
    };
  }).reverse();
  const maxReleases = Math.max(...releaseMonths.map((item) => item.count), 1);

  const topCategoryLabel =
    categoryCounts.find((item) => item.id === "tooling")?.count ?? 0;

  return (
    <div className="space-y-3">
      <Reveal>
        <PageHeader
          eyebrow={`visão geral · ${data.liveCount} métricas ao vivo`}
          title="O pulso do frontend"
          description="Uma leitura real do ecossistema: downloads, releases e atividade do GitHub atualizados automaticamente."
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

      <SourceNotice
        sources={data.sources}
        githubConfigured={data.githubConfigured}
      />

      <Reveal delay={60}>
        <Link
          href={
            topGrowth ? `/tendencias?tech=${topGrowth.slug}` : "/tendencias"
          }
          className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-chart-1/25 bg-card/60 px-4 py-3.5 transition-colors hover:border-chart-1/45 hover:bg-card sm:flex-row sm:items-center"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 w-72 bg-[radial-gradient(ellipse_at_left,color-mix(in_oklab,var(--chart-1)_14%,transparent),transparent_70%)]" />
          <span className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-chart-1/12 text-chart-1 ring-1 ring-chart-1/20 ring-inset">
            <Zap className="size-4" aria-hidden="true" />
          </span>
          <div className="relative min-w-0 flex-1">
            <p className="font-mono text-[9px] tracking-[0.18em] text-chart-1 uppercase">
              maior tração agora
            </p>
            <p className="mt-0.5 text-[13px] leading-snug font-medium">
              {topGrowth && topGrowth.growth > 0
                ? `${topGrowth.name} lidera o crescimento: ${formatSigned(topGrowth.growth)} em downloads nas últimas 4 semanas.`
                : "Acompanhando downloads e releases reais do ecossistema."}
            </p>
          </div>
          <div className="relative flex items-center gap-4 self-end sm:self-auto">
            <div className="hidden w-24 md:block">
              {topGrowth?.series?.length ? (
                <Sparkline
                  data={topGrowth.series}
                  color="var(--chart-1)"
                  className="h-7"
                  filled={false}
                  strokeWidth={1.5}
                />
              ) : null}
            </div>
            <div className="text-right">
              <p className="font-mono text-lg leading-none font-semibold text-chart-1 tabular-nums">
                {topGrowth ? formatSigned(topGrowth.growth) : "—"}
              </p>
              <p className="mt-0.5 text-[9px] tracking-wide text-muted-foreground uppercase">
                30 dias
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
            value={String(data.technologies.length)}
            icon={Layers}
            delta={
              <span className="rounded-full bg-chart-1/10 px-1.5 py-0.5 text-[10px] font-medium text-chart-1">
                {data.liveCount} ao vivo
              </span>
            }
            hint={`5 categorias · ${topCategoryLabel} em build & tooling`}
          >
            <div className="flex h-1.5 w-full gap-px overflow-hidden rounded-full">
              {categoryCounts.map((item) => (
                <span
                  key={item.id}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{
                    width: `${(item.count / data.technologies.length) * 100}%`,
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
                {rising.length} de {live.length}
              </span>
            }
            hint="crescimento de downloads ≥ 15% em 30 dias"
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
              {rising.length > 3 && (
                <span className="px-1 py-0.5 text-[9px] text-muted-foreground">
                  +{rising.length - 3}
                </span>
              )}
            </div>
          </KpiCard>
        </Reveal>

        <Reveal delay={170}>
          <KpiCard
            label="Releases · 90 dias"
            value={String(data.releases90d)}
            icon={Tag}
            accent="var(--chart-4)"
            delta={
              <span className="rounded-full bg-chart-4/10 px-1.5 py-0.5 text-[10px] font-medium text-chart-4">
                {majorCount} major
              </span>
            }
            hint={
              data.releases90d > 0
                ? `${previewCount} previews e ${Math.max(0, data.releases90d - majorCount - previewCount)} minors no período`
                : "Configure o GITHUB_TOKEN para carregar releases"
            }
          >
            <div className="flex h-6 items-end gap-1.5">
              {releaseMonths.map((item) => (
                <span
                  key={item.key}
                  className="flex-1 rounded-sm bg-chart-4/25"
                  style={{
                    height: `${Math.max(8, (item.count / maxReleases) * 100)}%`,
                  }}
                  title={`${item.count} releases`}
                />
              ))}
            </div>
            <div className="flex gap-1.5 font-mono text-[9px] text-muted-foreground">
              {releaseMonths.map((item) => (
                <span key={item.key} className="flex-1 text-center">
                  {item.label}
                </span>
              ))}
            </div>
          </KpiCard>
        </Reveal>

        <Reveal delay={210}>
          <KpiCard
            label="Momentum médio"
            value={`${averageMomentum}`}
            icon={Sparkles}
            accent="var(--chart-3)"
            delta={
              <span className="text-[10px] text-muted-foreground">/ 100</span>
            }
            hint={
              topCategory.average > 0
                ? `${topCategory.shortLabel} lidera com média ${topCategory.average}`
                : "Sem dados suficientes para o índice"
            }
          >
            <div className="space-y-1.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-chart-2 via-chart-1 to-chart-4"
                  style={{ width: `${averageMomentum}%` }}
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
          <CategoryDownloadsChart series={data.categorySeries} />
        </Reveal>
        <Reveal delay={200} className="xl:col-span-4">
          <MomentumList technologies={data.technologies} />
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Reveal delay={160} className="xl:col-span-5">
          <SignalFeed signals={data.signals} />
        </Reveal>
        <Reveal delay={220} className="xl:col-span-3">
          <MaturityDonut counts={maturityCounts} />
        </Reveal>
        <Reveal delay={260} className="xl:col-span-4">
          <LatestReleases
            releases={data.releases}
            technologies={data.technologies}
          />
        </Reveal>
      </div>

      <Reveal delay={200}>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
          {[
            {
              title: "Downloads",
              text: "Soma semanal real vinda da API de downloads do npm.",
            },
            {
              title: "Momentum",
              text: "Variação de downloads em 30 dias combinada à cadência de releases.",
            },
            {
              title: "Adoção",
              text: "Índice atual de 0 a 100 com downloads, estrelas e releases.",
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
            Dados públicos de npm + GitHub. Maturidade e scores são curadoria
            editorial.
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
        Painel com {data.liveCount} tecnologias com métricas ao vivo de npm e
        GitHub, atualizado automaticamente.
        {momentumLeaders.length > 0 &&
          ` Líder de momentum: ${momentumLeaders[0].name}.`}
        {topGrowth &&
          ` Maior crescimento de downloads: ${topGrowth.name}, ${formatCompact(topGrowth.downloads)} downloads por semana.`}
      </p>
    </div>
  );
}
