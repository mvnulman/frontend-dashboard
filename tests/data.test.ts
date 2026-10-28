import { describe, expect, it } from "vitest";

import {
  MONTH_LABELS,
  getAdoptionSeries,
  getCategoryGrowthSeries,
  getMaturityCounts,
  getMomentumLeaders,
  getReleaseCountByMonth,
  getRisingTechnologies,
  getTechBySlug,
  releases,
  technologies,
} from "@/lib/data";
import { CATEGORY_IDS, MATURITY_IDS } from "@/lib/types";

describe("technology dataset", () => {
  it("has unique slugs and valid taxonomy", () => {
    const slugs = technologies.map((tech) => tech.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const tech of technologies) {
      expect(CATEGORY_IDS).toContain(tech.category);
      expect(MATURITY_IDS).toContain(tech.maturity);
      expect(tech.adoption).toBeGreaterThanOrEqual(0);
      expect(tech.adoption).toBeLessThanOrEqual(100);
      expect(tech.momentum).toBeGreaterThanOrEqual(0);
      expect(tech.momentum).toBeLessThanOrEqual(100);
      expect(tech.latestRelease).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("covers every category and maturity at least once", () => {
    for (const category of CATEGORY_IDS) {
      expect(
        technologies.some((tech) => tech.category === category),
      ).toBe(true);
    }

    for (const maturity of MATURITY_IDS) {
      expect(
        technologies.some((tech) => tech.maturity === maturity),
      ).toBe(true);
    }
  });

  it("keeps the adoption series deterministic and anchored on the current value", () => {
    for (const tech of technologies) {
      const series = getAdoptionSeries(tech, 24);
      expect(series).toHaveLength(24);
      expect(series[series.length - 1]).toBe(tech.adoption);
      expect(getAdoptionSeries(tech, 24)).toEqual(series);
      expect(series.every((value) => value >= 0)).toBe(true);
    }
  });

  it("builds indexed category series for every period", () => {
    for (const months of [6, 12, 24]) {
      const series = getCategoryGrowthSeries(months);
      expect(series).toHaveLength(months);
      expect(series[0].month).toBe(MONTH_LABELS[24 - months]);

      for (const category of CATEGORY_IDS) {
        expect(series[0][category]).toBe(100);
        expect(series[series.length - 1][category]).toBeGreaterThan(0);
      }
    }
  });

  it("sorts momentum leaders and rising technologies", () => {
    const leaders = getMomentumLeaders(5);
    expect(leaders).toHaveLength(5);
    expect(leaders.map((tech) => tech.momentum)).toEqual(
      [...leaders.map((tech) => tech.momentum)].sort((a, b) => b - a),
    );

    const rising = getRisingTechnologies();
    expect(rising.every((tech) => tech.growth >= 15)).toBe(true);
  });

  it("accounts for every technology in the maturity distribution", () => {
    const total = getMaturityCounts().reduce(
      (sum, item) => sum + item.count,
      0,
    );
    expect(total).toBe(technologies.length);
  });
});

describe("release dataset", () => {
  it("references existing technologies and stays sorted by date", () => {
    for (const release of releases) {
      expect(getTechBySlug(release.techSlug)).toBeDefined();
      expect(release.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }

    const dates = releases.map((release) => release.date);
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  });

  it("adds up to the total number of releases", () => {
    const byMonth = getReleaseCountByMonth();
    expect(byMonth.reduce((sum, item) => sum + item.count, 0)).toBe(
      releases.length,
    );
  });
});
