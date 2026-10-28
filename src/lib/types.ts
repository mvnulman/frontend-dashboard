export const CATEGORY_IDS = [
  "frameworks",
  "meta",
  "ui",
  "tooling",
  "state",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export const MATURITY_IDS = ["adopt", "trial", "assess", "hold"] as const;

export type MaturityId = (typeof MATURITY_IDS)[number];

export interface TechnologyScores {
  dx: number;
  performance: number;
  ecosystem: number;
  learning: number;
  stability: number;
}

export interface Technology {
  slug: string;
  name: string;
  version: string;
  category: CategoryId;
  maturity: MaturityId;
  tagline: string;
  description: string;
  adoption: number;
  growth: number;
  momentum: number;
  stars: number;
  downloads: number;
  latestRelease: string;
  license: string;
  maintainer: string;
  website: string;
  docs: string;
  tags: string[];
  highlights: string[];
  tradeoffs: string[];
  scores: TechnologyScores;
  useCase: string;
  kind: "library" | "platform";
  /** Série semanal de downloads (12 semanas), quando houver fonte npm. */
  series?: number[];
  /** Indica se as métricas vieram de fontes públicas atualizadas. */
  live?: boolean;
  /** Releases publicados nos últimos 90 dias, via GitHub. */
  releasesLast90d?: number;
  /** Observação sobre a origem ou limitação da medição. */
  sourceNote?: string;
}

export type ReleaseType = "major" | "minor" | "preview";
export type ReleaseImpact = "alto" | "médio" | "baixo";

export interface Release {
  id: string;
  techSlug: string;
  version: string;
  date: string;
  type: ReleaseType;
  impact: ReleaseImpact;
  title: string;
  summary: string;
  tags: string[];
  url?: string;
}

export interface Signal {
  id: string;
  type: "release" | "growth" | "rfc" | "ecosystem";
  source: string;
  title: string;
  description: string;
  metric: string;
  time: string;
}

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
}

export interface MaturityMeta {
  id: MaturityId;
  label: string;
  description: string;
  color: string;
}

export type SourceStatus = "ok" | "partial" | "disabled";

export interface DownloadPoint {
  week: string;
  frameworks: number;
  meta: number;
  ui: number;
  tooling: number;
  state: number;
}

export interface ReleaseCounts {
  major: number;
  minor: number;
  preview: number;
}

export interface DashboardData {
  technologies: Technology[];
  releases: Release[];
  signals: Signal[];
  categorySeries: DownloadPoint[];
  sources: {
    npm: SourceStatus;
    github: SourceStatus;
  };
  generatedAt: string;
  githubConfigured: boolean;
  liveCount: number;
  releases90d: number;
  releaseCounts: ReleaseCounts;
}
