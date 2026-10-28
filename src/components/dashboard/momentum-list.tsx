import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { CategoryDot } from "@/components/category-icon";
import { Sparkline } from "@/components/sparkline";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CATEGORY_MAP, getAdoptionSeries, getMomentumLeaders } from "@/lib/data";
import { formatSigned } from "@/lib/format";

export function MomentumList() {
  const leaders = getMomentumLeaders(5);

  return (
    <Card className="h-full gap-3 bg-card/70">
      <CardHeader>
        <CardTitle>Maior momentum</CardTitle>
        <CardDescription>Score 0–100 de tração no ecossistema</CardDescription>
        <CardAction>
          <Link
            href="/tendencias"
            className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Ver todas
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-0.5">
        {leaders.map((tech, index) => {
          const meta = CATEGORY_MAP[tech.category];

          return (
            <Link
              key={tech.slug}
              href={`/tendencias?tech=${tech.slug}`}
              className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <span className="w-4 shrink-0 font-mono text-[10px] text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-1.5">
                  <span className="truncate text-[13px] font-medium">
                    {tech.name}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    v{tech.version}
                  </span>
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <CategoryDot category={tech.category} />
                  {meta.shortLabel}
                  <span className="text-border">·</span>
                  <span
                    className={
                      tech.growth >= 0 ? "text-chart-1" : "text-chart-5"
                    }
                  >
                    {formatSigned(tech.growth)}
                  </span>
                </span>
              </span>

              <span className="hidden w-16 shrink-0 opacity-70 transition-opacity group-hover:opacity-100 sm:block">
                <Sparkline
                  data={getAdoptionSeries(tech, 12)}
                  color={meta.color}
                  className="h-8"
                  filled={false}
                  strokeWidth={1.5}
                />
              </span>

              <span className="w-8 shrink-0 text-right font-mono text-sm font-medium tabular-nums">
                {tech.momentum}
              </span>
            </Link>
          );
        })}
      </CardContent>

      <CardFooter className="mt-auto justify-between border-t border-border/60 bg-transparent px-4 pt-3 text-[10px] text-muted-foreground">
        <span>Adoção + crescimento + atividade</span>
        <Link
          href="/tendencias?sort=momentum"
          className="inline-flex items-center gap-0.5 transition-colors hover:text-foreground"
        >
          Ranking completo
          <ArrowUpRight className="size-3" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}
