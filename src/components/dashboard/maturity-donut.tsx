"use client";

import { Cell, Pie, PieChart } from "recharts";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { MATURITIES } from "@/lib/data";
import type { MaturityId } from "@/lib/types";
import { cn } from "@/lib/utils";

const chartConfig = MATURITIES.reduce<ChartConfig>((config, maturity) => {
  config[maturity.id] = {
    label: maturity.label,
    color: maturity.color,
  };
  return config;
}, {});

export function MaturityDonut({
  counts,
}: {
  counts: { id: MaturityId; count: number }[];
}) {
  const total = counts.reduce((sum, item) => sum + item.count, 0);
  const data = counts.map((item) => {
    const meta = MATURITIES.find((maturity) => maturity.id === item.id)!;
    return {
      id: item.id,
      label: meta.label,
      count: item.count,
      fill: meta.color,
    };
  });

  return (
    <Card className="h-full gap-3 bg-card/70">
      <CardHeader>
        <CardTitle>Maturidade</CardTitle>
        <CardDescription>Distribuição das tecnologias no radar</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="relative mx-auto h-[168px] w-full max-w-[210px]">
          <ChartContainer
            config={chartConfig}
            className="h-full w-full aspect-square"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent nameKey="label" hideLabel />}
              />
              <Pie
                data={data}
                dataKey="count"
                nameKey="label"
                innerRadius="58%"
                outerRadius="88%"
                paddingAngle={4}
                cornerRadius={6}
                strokeWidth={0}
                isAnimationActive
                animationDuration={800}
                animationEasing="ease-out"
              >
                {data.map((item) => (
                  <Cell key={item.id} fill={`var(--color-${item.id})`} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
              {total}
            </span>
            <span className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
              tecnologias
            </span>
          </div>
        </div>

        <div className="grid gap-2">
          {data.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-2 rounded-md px-1 py-0.5 text-[11px]",
              )}
              title={MATURITIES.find((m) => m.id === item.id)?.description}
            >
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: item.fill }}
              />
              <span className="text-muted-foreground">{item.label}</span>
              <span className="ml-auto font-mono font-medium tabular-nums">
                {item.count}
              </span>
              <span className="w-9 text-right font-mono text-[10px] text-muted-foreground tabular-nums">
                {Math.round((item.count / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="mt-auto justify-between border-t border-border/60 bg-transparent px-4 pt-3 text-[10px] text-muted-foreground">
        <span>Do centro para fora</span>
        <Link
          href="/radar"
          className="inline-flex items-center gap-0.5 transition-colors hover:text-foreground"
        >
          Abrir radar
          <ArrowUpRight className="size-3" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}
