import "server-only";

import { unstable_cache } from "next/cache";

import { technologies as catalog } from "@/lib/data";
import type {
  DashboardData,
  Release,
  ReleaseImpact,
  Signal,
  Technology,
} from "@/lib/types";
import { mapWithConcurrency } from "./concurrency";
import {
  addDays,
  aggregateCategorySeries,
  aggregateWeeklyDownloads,
  buildWeekBuckets,
  classifyReleaseTag,
  computeDownloadGrowth,
  computeLiveIndexes,
  stripMarkdown,
  toISODate,
  type DownloadDay,
} from "./compute";
import { fetchGitHubMetrics } from "./github";
import { fetchNpmDownloads } from "./npm";
import { TECH_SOURCES } from "./source-map";

export const LIVE_REFRESH_SECONDS = 1800;
const WEEKS = 12;
const RANGE_DAYS = 120;
const RELEASES_WINDOW_DAYS = 90;
const MAX_RELEASES = 120;

interface TechResult {
  tech: Technology;
  npmDays: DownloadDay[];
  stars: number;
  releases: {
    tagName: string;
    name: string | null;
    body: string | null;
    publishedAt: string;
    url: string;
    prerelease: boolean;
  }[];
  npmOk: boolean;
  githubOk: boolean;
}

function stableVersionFromTag(tag: string) {
  const rawTag = tag.trim();
  const atIndex = rawTag.lastIndexOf("@");
  const candidate =
    atIndex > 0 ? rawTag.slice(atIndex + 1) : rawTag.replace(/^v/i, "");

  if (!/^\d/.test(candidate) || candidate.includes("-")) return null;
  return candidate;
}

function relativeTime(iso: string, now: Date) {
  const timestamp = new Date(iso).getTime();
  if (!Number.isFinite(timestamp)) return "recentemente";

  const diff = now.getTime() - timestamp;
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));

  if (hours < 1) return "agora";
  if (hours < 24) return `há ${hours}h`;
  if (days < 30) return `há ${days}d`;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(timestamp));
}

function cleanReleaseSummary(body: string | null, fallback: string) {
  if (!body) return fallback;

  const clean = stripMarkdown(body, 260)
    .replace(/^(patch|minor|major) changes\s*[-–:]?\s*/i, "")
    .replace(/\b[0-9a-f]{7,40}\b/gi, "")
    .replace(/thanks @[\w-]+!?/gi, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return clean || fallback;
}

function buildReleases(
  results: TechResult[],
  now: Date,
): { releases: Release[]; byTech: Map<string, number>; counts: { major: number; minor: number; preview: number } } {
  const cutoff = addDays(now, -RELEASES_WINDOW_DAYS).getTime();
  const recentCutoff = addDays(now, -90).getTime();
  const byTech = new Map<string, number>();
  const counts = { major: 0, minor: 0, preview: 0 };
  const releases: Release[] = [];

  for (const result of results) {
    if (!result.githubOk) continue;

    for (const raw of result.releases) {
      const timestamp = new Date(raw.publishedAt).getTime();
      if (!Number.isFinite(timestamp) || timestamp < cutoff) continue;

      const rawTag = raw.tagName.trim();
      if (!rawTag) continue;
      if (/canary|nightly|dev\./i.test(rawTag)) continue;

      const atIndex = rawTag.lastIndexOf("@");
      let version = rawTag.replace(/^v/i, "");

      if (atIndex > 0) {
        const prefix = rawTag.slice(0, atIndex);
        version = rawTag.slice(atIndex + 1).replace(/^v/i, "");
        const npmPackage = TECH_SOURCES[result.tech.slug]?.npm;

        // Monorepos publicam releases de subpacotes; mantemos só o pacote principal.
        if (npmPackage && prefix !== npmPackage) continue;
      }

      if (!/^\d/.test(version)) continue;

      const type = classifyReleaseTag(version);

      if (timestamp >= recentCutoff) {
        byTech.set(result.tech.slug, (byTech.get(result.tech.slug) ?? 0) + 1);
        counts[type] += 1;
      }

      const impact: ReleaseImpact =
        type === "major" ? "alto" : type === "preview" ? "médio" : "baixo";
      const releaseName = raw.name?.trim();
      const title = stripMarkdown(
        releaseName &&
          !releaseName.includes("@") &&
          releaseName !== rawTag &&
          !releaseName.startsWith("v")
          ? releaseName
          : `${result.tech.name} ${version}`,
        90,
      );
      const summary = cleanReleaseSummary(
        raw.body,
        `Nova versão de ${result.tech.name} publicada no GitHub.`,
      );

      releases.push({
        id: `${result.tech.slug}-${version}`
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, "-"),
        techSlug: result.tech.slug,
        version,
        date: new Date(timestamp).toISOString().slice(0, 10),
        type,
        impact,
        title,
        summary,
        tags: result.tech.tags.slice(0, 3),
        url: raw.url,
      });
    }
  }

  return {
    releases: releases
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, MAX_RELEASES),
    byTech,
    counts,
  };
}

function buildSignals(
  merged: Technology[],
  releases: Release[],
  now: Date,
): Signal[] {
  const signals: Signal[] = [];
  const seenTechs = new Set<string>();

  for (const release of releases) {
    if (seenTechs.has(release.techSlug)) continue;
    seenTechs.add(release.techSlug);

    signals.push({
      id: `signal-release-${release.id}`,
      type: "release",
      source: "GitHub",
      title: release.title,
      description: release.summary,
      metric: release.version,
      time: relativeTime(`${release.date}T12:00:00.000Z`, now),
    });

    if (signals.length >= 4) break;
  }

  const fastest = merged
    .filter((tech) => tech.live && tech.downloads > 0 && tech.growth > 0)
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 2);

  for (const tech of fastest) {
    signals.push({
      id: `signal-growth-${tech.slug}`,
      type: "growth",
      source: "npm",
      title: `${tech.name} acelera downloads`,
      description: `Crescimento de ${tech.growth}% nas últimas quatro semanas.`,
      metric: `+${tech.growth}%`,
      time: "30d",
    });
  }

  return signals;
}

async function loadDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1),
  );
  const start = addDays(end, -(RANGE_DAYS - 1));
  const rangeStart = toISODate(start);
  const rangeEnd = toISODate(end);
  const buckets = buildWeekBuckets(end, WEEKS);
  const labels = buckets.map((bucket) => bucket.label);
  const token = process.env.GITHUB_TOKEN;

  const liveCatalog = catalog.filter((tech) => {
    const source = TECH_SOURCES[tech.slug];
    return source && source.metrics !== "editorial";
  });

  const npmPackages = liveCatalog
    .map((tech) => TECH_SOURCES[tech.slug]?.npm)
    .filter((pkg): pkg is string => Boolean(pkg));

  const npmDownloads = await fetchNpmDownloads(
    npmPackages,
    rangeStart,
    rangeEnd,
  );

  const results = await mapWithConcurrency(
    liveCatalog,
    4,
    async (tech): Promise<TechResult> => {
      const source = TECH_SOURCES[tech.slug];
      const github =
        source.github && token
          ? await fetchGitHubMetrics(source.github, token).catch(() => null)
          : null;
      const npmDays = source.npm ? npmDownloads[source.npm] : undefined;

      return {
        tech,
        npmDays: npmDays ?? [],
        stars: github?.stars ?? 0,
        releases: github?.releases ?? [],
        npmOk: Boolean(npmDays),
        githubOk: Boolean(github),
      };
    },
  );

  const resultsBySlug = new Map(results.map((result) => [result.tech.slug, result]));

  const merged: Technology[] = catalog.map((tech) => {
    const result = resultsBySlug.get(tech.slug);

    if (!result) {
      return {
        ...tech,
        live: false,
        series: [],
        adoption: 0,
        momentum: 0,
        growth: 0,
        downloads: 0,
        stars: 0,
        sourceNote:
          TECH_SOURCES[tech.slug]?.note ??
          "Métricas automáticas indisponíveis para esta tecnologia.",
      };
    }

    const series = aggregateWeeklyDownloads(result.npmDays, buckets);
    const downloads = series.at(-1) ?? 0;
    const growth = computeDownloadGrowth(result.npmDays, end);
    const latestReleaseAt = result.releases
      .filter((release) => Boolean(stableVersionFromTag(release.tagName)))
      .map((release) => release.publishedAt)
      .filter(Boolean)
      .sort()
      .at(-1);

    return {
      ...tech,
      version:
        result.releases
          .map((release) => stableVersionFromTag(release.tagName))
          .find((value): value is string => Boolean(value)) ?? tech.version,
      license: tech.license,
      latestRelease:
        latestReleaseAt?.slice(0, 10) ?? tech.latestRelease,
      downloads,
      stars: result.stars,
      growth,
      series,
      live: result.npmOk || result.githubOk,
      sourceNote: TECH_SOURCES[tech.slug]?.note,
    };
  });

  const { releases, byTech, counts } = buildReleases(results, now);
  const releases90 = new Map(
    [...byTech.entries()].map(([slug, count]) => [slug, count]),
  );

  for (const tech of merged) {
    tech.releasesLast90d = releases90.get(tech.slug) ?? 0;
  }

  const indexInputs = merged
    .filter((tech) => tech.live)
    .map((tech) => ({
      slug: tech.slug,
      downloads: tech.downloads,
      stars: tech.stars,
      growth: tech.growth,
      releasesLast90d: tech.releasesLast90d ?? 0,
    }));

  const indexes = computeLiveIndexes(indexInputs);

  for (const tech of merged) {
    if (!tech.live) continue;
    const index = indexes[tech.slug];
    if (!index) continue;
    tech.adoption = index.adoption;
    tech.momentum = index.momentum;
  }

  const npmExpected = results.filter(
    (result) => Boolean(TECH_SOURCES[result.tech.slug]?.npm),
  ).length;
  const npmOk = results.filter((result) => result.npmOk).length;
  const githubExpected = results.filter(
    (result) => Boolean(TECH_SOURCES[result.tech.slug]?.github),
  ).length;
  const githubOk = results.filter((result) => result.githubOk).length;

  return {
    technologies: merged,
    releases,
    signals: buildSignals(merged, releases, now),
    categorySeries: aggregateCategorySeries(merged, labels),
    sources: {
      npm:
        npmOk === 0
          ? "disabled"
          : npmOk === npmExpected
            ? "ok"
            : "partial",
      github: !token
        ? "disabled"
        : githubOk === 0
          ? "disabled"
          : githubOk === githubExpected
            ? "ok"
            : "partial",
    },
    generatedAt: now.toISOString(),
    githubConfigured: Boolean(token),
    liveCount: merged.filter((tech) => tech.live).length,
    releases90d: [...byTech.values()].reduce((total, count) => total + count, 0),
    releaseCounts: counts,
  };
}

export const getDashboardData = unstable_cache(
  loadDashboardData,
  ["dashboard-live-data"],
  { revalidate: LIVE_REFRESH_SECONDS, tags: ["dashboard"] },
);
