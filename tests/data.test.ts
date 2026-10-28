import { describe, expect, it } from "vitest";

import { technologies } from "@/lib/data";
import { TECH_SOURCES } from "@/lib/live/source-map";
import { CATEGORY_IDS, MATURITY_IDS } from "@/lib/types";

describe("technology catalog", () => {
  it("has unique slugs and valid taxonomy", () => {
    const slugs = technologies.map((tech) => tech.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const tech of technologies) {
      expect(CATEGORY_IDS).toContain(tech.category);
      expect(MATURITY_IDS).toContain(tech.maturity);
      expect(tech.latestRelease).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(tech.scores.dx).toBeGreaterThanOrEqual(0);
      expect(tech.scores.dx).toBeLessThanOrEqual(100);
    }
  });

  it("maps every technology to a data source or an explicit editorial mode", () => {
    for (const tech of technologies) {
      const source = TECH_SOURCES[tech.slug];
      expect(source, `source missing for ${tech.slug}`).toBeDefined();
      expect(
        source.metrics === "editorial" || Boolean(source.npm || source.github),
        `${tech.slug} must have a source or editorial mode`,
      ).toBe(true);
    }
  });

  it("keeps at least one technology in every category and maturity", () => {
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
});
