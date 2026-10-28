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
