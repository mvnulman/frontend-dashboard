import { mapWithConcurrency } from "./concurrency";
import type { DownloadDay } from "./compute";

const CACHE = {
  next: {
    revalidate: 1800,
    tags: ["dashboard"],
  },
};

const HEADERS = {
  Accept: "application/json",
  "User-Agent": "frontend-radar/1.0 (https://github.com/mvnulman/frontend-dashboard)",
};

async function fetchJson<T>(url: string, attempt = 0): Promise<T> {
  const response = await fetch(url, {
    headers: HEADERS,
    signal: AbortSignal.timeout(15_000),
    ...CACHE,
  });

  if (!response.ok) {
    if (attempt < 3 && (response.status === 429 || response.status >= 500)) {
      const retryAfter = Number(response.headers.get("retry-after")) * 1000;
      await new Promise((resolve) =>
        setTimeout(resolve, retryAfter || 1200 * (attempt + 1)),
      );
      return fetchJson<T>(url, attempt + 1);
    }
    throw new Error(`npm request failed (${response.status}): ${url}`);
  }

  return response.json() as Promise<T>;
}

interface RangePayload {
  downloads: DownloadDay[];
  package?: string;
}

type BulkRangePayload = Record<string, RangePayload>;

function rangeUrl(packages: string[], start: string, end: string) {
  const path = packages.map((pkg) => encodeURIComponent(pkg)).join(",");
  return `https://api.npmjs.org/downloads/range/${start}:${end}/${path}`;
}

async function fetchSingleRange(
  pkg: string,
  start: string,
  end: string,
): Promise<DownloadDay[]> {
  const payload = await fetchJson<RangePayload>(rangeUrl([pkg], start, end));
  return payload.downloads ?? [];
}

/**
 * O endpoint de range aceita vários pacotes comuns em uma única chamada.
 * Pacotes com escopo (@scope/pkg) ainda não são suportados em bulk,
 * então são buscados individualmente.
 */
export async function fetchNpmDownloads(
  packages: string[],
  start: string,
  end: string,
): Promise<Record<string, DownloadDay[]>> {
  const uniquePackages = [...new Set(packages)];
  const unscoped = uniquePackages.filter((pkg) => !pkg.startsWith("@"));
  const scoped = uniquePackages.filter((pkg) => pkg.startsWith("@"));

  const result: Record<string, DownloadDay[]> = {};

  if (unscoped.length > 0) {
    try {
      const bulk = await fetchJson<BulkRangePayload>(rangeUrl(unscoped, start, end));
      for (const pkg of unscoped) {
        if (bulk[pkg]) result[pkg] = bulk[pkg].downloads ?? [];
      }
    } catch {
      // Fallback: se o bulk falhar, tenta pacote a pacote com baixa concorrência.
      await mapWithConcurrency(unscoped, 2, async (pkg) => {
        try {
          result[pkg] = await fetchSingleRange(pkg, start, end);
        } catch {
          // Mantém o pacote ausente para sinalizar cobertura parcial.
        }
      });
    }
  }

  await mapWithConcurrency(scoped, 2, async (pkg) => {
    try {
      result[pkg] = await fetchSingleRange(pkg, start, end);
    } catch {
      // Mantém o pacote ausente para sinalizar cobertura parcial.
    }
  });

  return result;
}
