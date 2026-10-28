import { GithubIcon } from "@/components/icons";
import { TriangleAlert } from "lucide-react";

import type { DashboardData } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SourceNotice({
  sources,
  githubConfigured,
  className,
}: {
  sources: DashboardData["sources"];
  githubConfigured: boolean;
  className?: string;
}) {
  const hasIssue =
    sources.npm !== "ok" ||
    (!githubConfigured && sources.github === "disabled") ||
    (githubConfigured && sources.github !== "ok");

  if (!hasIssue) return null;

  const message = !githubConfigured
    ? "GitHub não configurado no servidor. Estrelas e releases automáticos estão desativados — defina GITHUB_TOKEN para ativá-los."
    : sources.github === "partial" || sources.npm === "partial"
      ? "Algumas fontes não responderam nesta atualização. Os números podem estar incompletos."
      : "Não foi possível consultar todas as fontes agora. Os dados podem estar defasados.";

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border border-chart-4/25 bg-chart-4/5 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {githubConfigured ? (
        <TriangleAlert
          className="mt-0.5 size-3.5 shrink-0 text-chart-4"
          aria-hidden="true"
        />
      ) : (
        <GithubIcon className="mt-0.5 size-3.5 shrink-0 text-chart-4" />
      )}
      <p>{message}</p>
    </div>
  );
}
