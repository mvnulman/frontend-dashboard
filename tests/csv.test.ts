import { describe, expect, it } from "vitest";

import { buildTechnologiesCsv } from "@/lib/csv";
import { technologies } from "@/lib/data";

describe("CSV export", () => {
  it("exports a header plus one row per technology", () => {
    const sample = technologies.slice(0, 3).map((tech) => ({
      ...tech,
      live: true,
      adoption: 80,
      growth: 12,
      momentum: 90,
      stars: 1000,
      downloads: 2000,
    }));
    const csv = buildTechnologiesCsv(sample);
    const lines = csv.split("\r\n");

    expect(lines).toHaveLength(4);
    expect(lines[0]).toContain("nome;versao;categoria;maturidade");
    expect(lines[0]).toContain("fonte_metricas");
    expect(lines[1]).toContain("React");
    expect(lines[1]).toContain("npm + github");
  });

  it("leaves live metrics empty for editorial entries", () => {
    const editorial = technologies.find((tech) => tech.slug === "turbopack");
    expect(editorial).toBeDefined();

    const csv = buildTechnologiesCsv([editorial!]);
    const rows = csv.split("\r\n");
    const row = rows[1].split(";");

    expect(row).toContain("curadoria");
    expect(row[5]).toBe("");
    expect(row[6]).toBe("");
  });

  it("leaves downloads and stars empty for platform technologies", () => {
    const platform = technologies.find(
      (tech) => tech.slug === "view-transitions",
    );
    expect(platform).toBeDefined();

    const csv = buildTechnologiesCsv([{ ...platform!, live: true }]);
    const rows = csv.split("\r\n");
    const header = rows[0].split(";");
    const row = rows[1].split(";");

    expect(row[header.indexOf("downloads_semana")]).toBe("");
    expect(row[header.indexOf("estrelas")]).toBe("");
  });
});
