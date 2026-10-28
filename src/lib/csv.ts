import { CATEGORY_MAP, MATURITY_MAP } from "@/lib/data";
import type { Technology } from "@/lib/types";

function escapeCell(value: string | number) {
  const text = String(value);
  if (/[";\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function buildTechnologiesCsv(technologies: Technology[]) {
  const header = [
    "nome",
    "versao",
    "categoria",
    "maturidade",
    "adocao",
    "crescimento_yoy",
    "momentum",
    "estrelas",
    "downloads_semana",
    "ultima_release",
    "licenca",
    "mantenedor",
    "site",
  ];

  const rows = technologies.map((tech) => [
    tech.name,
    tech.version,
    CATEGORY_MAP[tech.category].label,
    MATURITY_MAP[tech.maturity].label,
    tech.adoption,
    tech.growth,
    tech.momentum,
    tech.kind === "platform" ? "" : tech.stars,
    tech.kind === "platform" ? "" : tech.downloads,
    tech.latestRelease,
    tech.license,
    tech.maintainer,
    tech.website,
  ]);

  return [header, ...rows]
    .map((row) => row.map(escapeCell).join(";"))
    .join("\r\n");
}

export function downloadTechnologiesCsv(
  technologies: Technology[],
  filename = "frontend-radar-tendencias.csv",
) {
  const csv = buildTechnologiesCsv(technologies);
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
