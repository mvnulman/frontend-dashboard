const CACHE = {
  next: {
    revalidate: 1800,
    tags: ["dashboard"],
  },
};

export interface GitHubRelease {
  tagName: string;
  name: string | null;
  body: string | null;
  publishedAt: string;
  url: string;
  prerelease: boolean;
}

export interface GitHubRepoMetrics {
  stars: number;
  forks: number;
  releases: GitHubRelease[];
}

interface GitHubRepoResponse {
  stargazers_count?: number;
  forks_count?: number;
}

interface GitHubReleaseResponse {
  tag_name?: string;
  name?: string | null;
  body?: string | null;
  published_at?: string;
  html_url?: string;
  draft?: boolean;
  prerelease?: boolean;
}

function headers(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "frontend-radar/1.0",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function fetchGitHub<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, {
    headers: headers(token),
    signal: AbortSignal.timeout(10_000),
    ...CACHE,
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed (${response.status}): ${url}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchGitHubMetrics(
  repo: string,
  token: string,
): Promise<GitHubRepoMetrics | null> {
  const [repoResult, releasesResult] = await Promise.allSettled([
    fetchGitHub<GitHubRepoResponse>(`https://api.github.com/repos/${repo}`, token),
    fetchGitHub<GitHubReleaseResponse[]>(
      `https://api.github.com/repos/${repo}/releases?per_page=8`,
      token,
    ),
  ]);

  const repoData =
    repoResult.status === "fulfilled" ? repoResult.value : null;
  const releases =
    releasesResult.status === "fulfilled" ? releasesResult.value : [];

  if (!repoData) return null;

  return {
    stars: repoData.stargazers_count ?? 0,
    forks: repoData.forks_count ?? 0,
    releases: releases
      .filter((release) => !release.draft && release.published_at)
      .map((release) => ({
        tagName: release.tag_name ?? "",
        name: release.name ?? null,
        body: release.body ?? null,
        publishedAt: release.published_at ?? "",
        url: release.html_url ?? "",
        prerelease: Boolean(release.prerelease),
      })),
  };
}
