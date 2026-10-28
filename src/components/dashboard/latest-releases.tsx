import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTechBySlug, releases } from "@/lib/data";
import { formatDay, formatMonth } from "@/lib/format";
import type { ReleaseType } from "@/lib/types";

const TYPE_STYLES: Record<ReleaseType, { label: string; color: string }> = {
  major: { label: "Major", color: "var(--chart-4)" },
  minor: { label: "Minor", color: "var(--chart-2)" },
  preview: { label: "Preview", color: "var(--chart-3)" },
};

export function LatestReleases() {
  return (
    <Card className="h-full gap-3 bg-card/70">
      <CardHeader>
        <CardTitle>Últimos lançamentos</CardTitle>
        <CardDescription>Versões que mudaram o jogo</CardDescription>
        <CardAction>
          <Link
            href="/releases"
            className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Timeline
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="divide-y divide-border/60">
          {releases.slice(0, 5).map((release) => {
            const tech = getTechBySlug(release.techSlug);
            const type = TYPE_STYLES[release.type];

            return (
              <Link
                key={release.id}
                href={`/releases#${release.id}`}
                className="group flex gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <span className="flex w-8 shrink-0 flex-col items-center pt-0.5 font-mono">
                  <span className="text-sm leading-none font-medium tabular-nums">
                    {formatDay(release.date)}
                  </span>
                  <span className="mt-1 text-[9px] tracking-wide text-muted-foreground uppercase">
                    {formatMonth(release.date)}
                  </span>
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                    <span className="truncate text-[13px] font-medium">
                      {tech?.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      v{release.version}
                    </span>
                    <span
                      className="rounded px-1 py-px font-mono text-[9px] ring-1 ring-inset ring-current/20"
                      style={{
                        color: type.color,
                        backgroundColor: `color-mix(in oklab, ${type.color} 10%, transparent)`,
                      }}
                    >
                      {type.label}
                    </span>
                  </span>
                  <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                    {release.title}
                  </span>
                </span>

                <ArrowUpRight
                  className="mt-1 size-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="mt-auto justify-between border-t border-border/60 bg-transparent px-4 pt-3 text-[10px] text-muted-foreground">
        <span>{releases.length} releases rastreados</span>
        <Link
          href="/releases"
          className="inline-flex items-center gap-0.5 transition-colors hover:text-foreground"
        >
          Ver timeline
          <ArrowUpRight className="size-3" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}
