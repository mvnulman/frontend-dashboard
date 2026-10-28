"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

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
import { formatDecimal } from "@/lib/format";
import type { AdoptionPoint } from "@/lib/data";
import type { CategoryId } from "@/lib/types";
import { cn } from "@/lib/utils";

export type PeriodKey = "6" | "12" | "24";
export type AdoptionSeries = Record<PeriodKey, AdoptionPoint[]>;

const chartConfig = CATEGORIES.reduce<ChartConfig>((config, category) => {
  config[category.id] = {
    label: category.label,
    color: category.color,
  };
  return config;
}, {});

const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "6", label: "6m" },
  { value: "12", label: "12m" },
  { value: "24", label: "24m" },
];

export function CategoryAdoptionChart({ series }: { series: AdoptionSeries }) {
  const [period, setPeriod] = useState<PeriodKey>("12");
  const [hidden, setHidden] = useState<CategoryId[]>([]);
  const data = series[period];

  const visibleCategories = CATEGORIES.filter(
    (category) => !hidden.includes(category.id),
  );
  const values = data.flatMap((point) =>
    visibleCategories.map((category) => point[category.id]),
  );
  const min = values.length ? Math.min(100, ...values) : 100;
  const max = values.length ? Math.max(...values) : 110;
  const domain: [number, number] = [
    Math.floor((min - 6) / 10) * 10,
    Math.ceil((max + 6) / 10) * 10,
  ];

  const toggleCategory = (id: CategoryId) => {
    setHidden((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  return (
    <Card className="h-full gap-3 bg-card/70">
      <CardHeader>
        <CardTitle>Tração por categoria</CardTitle>
        <CardDescription>
          Crescimento acumulado no período · base 100
        </CardDescription>
        <CardAction>
          <Segmented
            ariaLabel="Período do gráfico"
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
              dataKey="month"
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
              width={38}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            />
            <ReferenceLine
              y={100}
              stroke="var(--border)"
              strokeDasharray="3 5"
            />
            <ChartTooltip
              cursor={{
                stroke: "var(--border)",
                strokeDasharray: "3 4",
              }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(label) => `Índice · ${label}`}
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
            const lastValue = data[data.length - 1][category.id];

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
                  {formatDecimal(lastValue)}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
