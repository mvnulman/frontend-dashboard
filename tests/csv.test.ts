import { describe, expect, it } from "vitest";

import { buildTechnologiesCsv } from "@/lib/csv";
import { technologies } from "@/lib/data";

describe("CSV export", () => {
  it("exports a header plus one row per technology", () => {
    const csv = buildTechnologiesCsv(technologies.slice(0, 3));
    const lines = csv.split("\r\n");

    expect(lines).toHaveLength(4);
    expect(lines[0]).toContain("nome;versao;categoria;maturidade");
    expect(lines[0]).not.toContain("@");
    expect(lines[1]).toContain("React");
  });

  it("leaves downloads empty for platform technologies", () => {
    const viewTransitions = technologies.find(
      (tech) => tech.slug === "view-transitions",
    );
    expect(viewTransitions).toBeDefined();

    const csv = buildTechnologiesCsv([viewTransitions!]);
    const row = csv.split("\r\n")[1].split(";");
    const downloadsIndex = csv.split("\r\n")[0].split(";").indexOf("downloads_semana");

    expect(row[downloadsIndex]).toBe("");
  });
});
