"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";

import {
  Card,
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
import type { Technology } from "@/lib/types";

const AXES: { key: keyof Technology["scores"]; label: string }[] = [
  { key: "dx", label: "DX" },
  { key: "performance", label: "Performance" },
  { key: "ecosystem", label: "Ecossistema" },
  { key: "learning", label: "Facilidade" },
  { key: "stability", label: "Estabilidade" },
];

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

export function CompareRadar({
  items,
  colorOffset = 0,
}: {
  items: Technology[];
  colorOffset?: number;
}) {
  const data = AXES.map((axis) => {
    const point: Record<string, string | number> = { axis: axis.label };
    items.forEach((tech, index) => {
      point[`tech${index}`] = tech.scores[axis.key];
    });
    return point;
  });

  const config = items.reduce<ChartConfig>((accumulator, tech, index) => {
    accumulator[`tech${index}`] = {
      label: tech.name,
      color: COLORS[(index + colorOffset) % COLORS.length],
    };
    return accumulator;
  }, {});

  return (
    <Card className="h-full gap-3 bg-card/70">
      <CardHeader>
        <CardTitle>Perfil comparativo</CardTitle>
        <CardDescription>Scores editoriais de 0 a 100</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={config}
          className="mx-auto aspect-square h-[400px] w-full max-w-[500px] md:h-[430px]"
        >
          <RadarChart data={data} outerRadius="72%">
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarGrid stroke="var(--radar-line)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 10,
              }}
            />
            <PolarRadiusAxis
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            {items.map((tech, index) => (
              <Radar
                key={tech.slug}
                dataKey={`tech${index}`}
                stroke={COLORS[(index + colorOffset) % COLORS.length]}
                fill={COLORS[(index + colorOffset) % COLORS.length]}
                fillOpacity={0.06}
                strokeWidth={2.2}
                strokeDasharray={
                  index === 0 ? undefined : index === 1 ? "5 3" : "2 3"
                }
                dot={{ r: 2.5, strokeWidth: 0 }}
                isAnimationActive
                animationDuration={700}
              />
            ))}
          </RadarChart>
        </ChartContainer>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {items.map((tech, index) => (
            <span
              key={tech.slug}
              className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground"
            >
              <span
                className="size-1.5 rounded-full"
                style={{
                  background: COLORS[(index + colorOffset) % COLORS.length],
                }}
              />
              {tech.name}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
