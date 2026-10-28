import { describe, expect, it } from "vitest";

import {
  aggregateCategorySeries,
  aggregateWeeklyDownloads,
  buildWeekBuckets,
  classifyReleaseTag,
  computeDownloadGrowth,
  computeLiveIndexes,
  percentileRanks,
  stripMarkdown,
  toISODate,
} from "@/lib/live/compute";
import type { Technology } from "@/lib/types";

describe("weekly downloads", () => {
  const end = new Date("2026-10-27T00:00:00.000Z");
  const buckets = buildWeekBuckets(end, 2);

  it("builds complete week buckets", () => {
    expect(buckets).toHaveLength(2);
    expect(buckets[0]).toEqual({
      start: "2026-10-14",
      end: "2026-10-20",
      label: "20/10",
    });
    expect(buckets[1].end).toBe("2026-10-27");
  });

  it("aggregates daily values into weekly totals", () => {
    const days = Array.from({ length: 14 }, (_, index) => {
      const date = new Date("2026-10-14T00:00:00.000Z");
      date.setUTCDate(date.getUTCDate() + index);
      return { day: toISODate(date), downloads: 10 };
    });

    expect(aggregateWeeklyDownloads(days, buckets)).toEqual([70, 70]);
  });

  it("computes 30-day growth against the previous window", () => {
    const days = Array.from({ length: 60 }, (_, index) => {
      const date = new Date("2026-08-29T00:00:00.000Z");
      date.setUTCDate(date.getUTCDate() + index);
      return { day: toISODate(date), downloads: index < 30 ? 100 : 150 };
    });

    expect(computeDownloadGrowth(days, end)).toBe(50);
  });
});

describe("indexes", () => {
  it("ranks values between 0 and 1", () => {
    const ranks = percentileRanks([10, 20, 20, 40]);
    expect(ranks[0]).toBe(0);
    expect(ranks[1]).toBe(0.5);
    expect(ranks[2]).toBe(0.5);
    expect(ranks[3]).toBe(1);
  });

  it("keeps adoption and momentum in the 0-100 range", () => {
    const indexes = computeLiveIndexes([
      { slug: "a", downloads: 100, stars: 50, growth: 10, releasesLast90d: 1 },
      { slug: "b", downloads: 900, stars: 5, growth: 80, releasesLast90d: 4 },
      { slug: "c", downloads: 500, stars: 100, growth: -20, releasesLast90d: 0 },
    ]);

    for (const index of Object.values(indexes)) {
      expect(index.adoption).toBeGreaterThanOrEqual(0);
      expect(index.adoption).toBeLessThanOrEqual(100);
      expect(index.momentum).toBeGreaterThanOrEqual(1);
      expect(index.momentum).toBeLessThanOrEqual(99);
    }

    expect(indexes.b.momentum).toBeGreaterThan(indexes.c.momentum);
  });

  it("sums weekly downloads by category", () => {
    const base: Technology = {
      slug: "x",
      name: "X",
      version: "1.0",
      category: "frameworks",
      maturity: "adopt",
      tagline: "",
      description: "",
      adoption: 0,
      growth: 0,
      momentum: 0,
      stars: 0,
      downloads: 0,
      latestRelease: "2026-01-01",
      license: "MIT",
      maintainer: "",
      website: "",
      docs: "",
      tags: [],
      highlights: [],
      tradeoffs: [],
      scores: { dx: 0, performance: 0, ecosystem: 0, learning: 0, stability: 0 },
      useCase: "",
      kind: "library",
      live: true,
      series: [10, 20],
    };

    const series = aggregateCategorySeries([base], ["w1", "w2"]);
    expect(series[0].frameworks).toBe(10);
    expect(series[1].frameworks).toBe(20);
    expect(series[0].tooling).toBe(0);
  });
});

describe("release helpers", () => {
  it("classifies tags", () => {
    expect(classifyReleaseTag("v17.0.0")).toBe("major");
    expect(classifyReleaseTag("v17.1.0")).toBe("minor");
    expect(classifyReleaseTag("v17.0.0-beta.1")).toBe("preview");
    expect(classifyReleaseTag("21")).toBe("major");
  });

  it("strips markdown and truncates", () => {
    const result = stripMarkdown("## Título\n\n**Novo** [link](https://x.com)", 40);
    expect(result).toContain("Título");
    expect(result).not.toContain("**");
    expect(result.length).toBeLessThanOrEqual(40);
  });
});
