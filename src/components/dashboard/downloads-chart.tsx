"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Segmented } from "@/components/segmented";
import { CATEGORIES } from "@/lib/data";
import { formatCompact } from "@/lib/format";
import type { DownloadPoint } from "@/lib/types";
import type { CategoryId } from "@/lib/types";
import { cn } from "@/lib/utils";

type PeriodKey = "4" | "8" | "12";

const chartConfig = CATEGORIES.reduce<ChartConfig>((config, category) => {
  config[category.id] = {
    label: category.label,
    color: category.color,
  };
  return config;
}, {});

const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "4", label: "4s" },
  { value: "8", label: "8s" },
  { value: "12", label: "12s" },
];

export function CategoryDownloadsChart({
  series,
}: {
  series: DownloadPoint[];
}) {
  const [period, setPeriod] = useState<PeriodKey>("12");
  const [hidden, setHidden] = useState<CategoryId[]>([]);
  const weeks = Number(period);
  const data = series.slice(-weeks);

  const visibleCategories = CATEGORIES.filter(
    (category) => !hidden.includes(category.id),
  );
  const values = data.flatMap((point) =>
    visibleCategories.map((category) => point[category.id]),
  );
  const max = values.length ? Math.max(...values) : 0;
  const domain: [number, number] = [0, max > 0 ? Math.ceil(max * 1.08) : 100];

  const toggleCategory = (id: CategoryId) => {
    setHidden((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const lastPoint = data[data.length - 1];

  return (
    <Card className="h-full gap-3 bg-card/70">
      <CardHeader>
        <CardTitle>Downloads por categoria</CardTitle>
        <CardDescription>
          Soma semanal real · npm · últimas {weeks} semanas
        </CardDescription>
        <CardAction>
          <Segmented
            ariaLabel="Semanas exibidas no gráfico"
            options={PERIOD_OPTIONS}
            value={period}
            onChange={setPeriod}
          />
        </CardAction>
      </CardHeader>

      <CardContent className="pt-2">
        <ChartContainer
          config={chartConfig}
          className="chart-draw h-[290px] w-full md:h-[320px]"
        >
          <LineChart
            key={period}
            accessibilityLayer
            data={data}
            margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="2 7"
            />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={26}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            />
            <YAxis
              domain={domain}
              tickCount={5}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={42}
              tickFormatter={(value) => formatCompact(Number(value))}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            />
            <ChartTooltip
              cursor={{
                stroke: "var(--border)",
                strokeDasharray: "3 4",
              }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(label) => `Semana de ${label}`}
                  formatter={(value) => formatCompact(Number(value))}
                />
              }
            />
            {visibleCategories.map((category) => (
              <Line
                key={category.id}
                type="monotone"
                dataKey={category.id}
                stroke={`var(--color-${category.id})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ChartContainer>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {CATEGORIES.map((category) => {
            const isHidden = hidden.includes(category.id);
            const value = lastPoint?.[category.id] ?? 0;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id)}
                aria-pressed={!isHidden}
                className={cn(
                  "group flex items-center gap-1.5 rounded-md text-[11px] transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  isHidden && "opacity-35",
                )}
              >
                <span
                  className="h-0.5 w-4 rounded-full transition-all group-hover:h-1"
                  style={{ background: category.color }}
                />
                <span className="text-muted-foreground group-hover:text-foreground">
                  {category.shortLabel}
                </span>
                <span className="font-mono font-medium tabular-nums">
                  {formatCompact(value)}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
