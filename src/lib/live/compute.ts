import { CATEGORY_IDS } from "@/lib/types";
import type { DownloadPoint, ReleaseType, Technology } from "@/lib/types";

export interface DownloadDay {
  day: string;
  downloads: number;
}

export interface WeekBucket {
  start: string;
  end: string;
  label: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, amount: number) {
  return new Date(date.getTime() + amount * DAY_MS);
}

export function formatWeekLabel(date: Date) {
  return `${String(date.getUTCDate()).padStart(2, "0")}/${String(
    date.getUTCMonth() + 1,
  ).padStart(2, "0")}`;
}

export function buildWeekBuckets(end: Date, weeks = 12): WeekBucket[] {
  const buckets: WeekBucket[] = [];

  for (let index = weeks - 1; index >= 0; index -= 1) {
    const bucketEnd = addDays(end, -index * 7);
    const bucketStart = addDays(bucketEnd, -6);
    buckets.push({
      start: toISODate(bucketStart),
      end: toISODate(bucketEnd),
      label: formatWeekLabel(bucketEnd),
    });
  }

  return buckets;
}

export function aggregateWeeklyDownloads(
  days: DownloadDay[],
  buckets: WeekBucket[],
): number[] {
  const byDay = new Map(days.map((item) => [item.day, item.downloads]));

  return buckets.map((bucket) => {
    let total = 0;
    let cursor = new Date(`${bucket.start}T00:00:00.000Z`);

    for (let index = 0; index < 7; index += 1) {
      total += byDay.get(toISODate(cursor)) ?? 0;
      cursor = addDays(cursor, 1);
    }

    return total;
  });
}

export function computeDownloadGrowth(days: DownloadDay[], end: Date) {
  const byDay = new Map(days.map((item) => [item.day, item.downloads]));

  const sumWindow = (start: Date, length: number) => {
    let total = 0;
    for (let index = 0; index < length; index += 1) {
      total += byDay.get(toISODate(addDays(start, index))) ?? 0;
    }
    return total;
  };

  const currentStart = addDays(end, -29);
  const previousStart = addDays(end, -59);
  const current = sumWindow(currentStart, 30);
  const previous = sumWindow(previousStart, 30);

  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function percentileRanks(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);

  return values.map((value) => {
    const first = sorted.indexOf(value);
    const last = sorted.lastIndexOf(value);
    return (first + last) / 2 / Math.max(1, sorted.length - 1);
  });
}

export interface IndexInput {
  slug: string;
  downloads: number;
  stars: number;
  growth: number;
  releasesLast90d: number;
}

export interface LiveIndex {
  adoption: number;
  momentum: number;
}

export function computeLiveIndexes(
  items: IndexInput[],
): Record<string, LiveIndex> {
  if (items.length === 0) return {};

  const downloadRanks = percentileRanks(items.map((item) => item.downloads));
  const starRanks = percentileRanks(items.map((item) => item.stars));
  const releaseRanks = percentileRanks(
    items.map((item) => item.releasesLast90d),
  );
  const growthRanks = percentileRanks(items.map((item) => item.growth));

  return Object.fromEntries(
    items.map((item, index) => {
      const adoption = Math.round(
        (downloadRanks[index] * 0.6 +
          starRanks[index] * 0.3 +
          releaseRanks[index] * 0.1) *
          100,
      );
      const momentum = Math.round(
        (growthRanks[index] * 0.7 + releaseRanks[index] * 0.3) * 99,
      );

      return [
        item.slug,
        {
          adoption: Math.min(100, Math.max(0, adoption)),
          momentum: Math.min(99, Math.max(1, momentum)),
        },
      ];
    }),
  );
}

export function aggregateCategorySeries(
  technologies: Technology[],
  labels: string[],
): DownloadPoint[] {
  return labels.map((week, weekIndex) => {
    const point: DownloadPoint = {
      week,
      frameworks: 0,
      meta: 0,
      ui: 0,
      tooling: 0,
      state: 0,
    };

    for (const tech of technologies) {
      if (!tech.series?.length) continue;
      point[tech.category] += tech.series[weekIndex] ?? 0;
    }

    for (const category of CATEGORY_IDS) {
      point[category] = Math.round(point[category]);
    }

    return point;
  });
}

export function classifyReleaseTag(tag: string): ReleaseType {
  const clean = tag.replace(/^v/i, "").trim();

  if (/-(alpha|beta|rc|canary|next|preview)/i.test(clean)) {
    return "preview";
  }

  if (/^\d+$/.test(clean)) {
    return "major";
  }

  const [major, minor, patch] = clean.split(".").map(Number);

  if (
    Number.isFinite(major) &&
    major > 0 &&
    minor === 0 &&
    (patch === 0 || !Number.isFinite(patch))
  ) {
    return "major";
  }

  return "minor";
}

export function stripMarkdown(input: string, limit = 220) {
  const clean = input
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`~]/g, " ")
    .replace(/\r?\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit - 1).trimEnd()}…`;
}
