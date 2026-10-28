"use client";

import { useMemo, useState } from "react";

import {
  CATEGORIES,
  CATEGORY_MAP,
} from "@/lib/data";
import { MATURITY_IDS, type CategoryId, type Technology } from "@/lib/types";
import { cn } from "@/lib/utils";

const SIZE = 840;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 280;
const RING_SIZE = 70;
const LABEL_RADIUS = 326;
const DOT_LABEL_HEIGHT = 22;

function hashSlug(slug: string) {
  return slug.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

function pointOnCircle(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: Math.round((CENTER + Math.cos(radians) * radius) * 100) / 100,
    y: Math.round((CENTER + Math.sin(radians) * radius) * 100) / 100,
  };
}

function sectorPath(startAngle: number, endAngle: number) {
  const start = pointOnCircle(startAngle, OUTER_RADIUS);
  const end = pointOnCircle(endAngle, OUTER_RADIUS);
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 0 1 ${end.x} ${end.y} Z`;
}

export function RadarChart({
  technologies,
  category,
  selectedSlug,
  onSelect,
}: {
  technologies: Technology[];
  category: CategoryId | "all";
  selectedSlug: string;
  onSelect: (tech: Technology) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      category === "all"
        ? technologies
        : technologies.filter((tech) => tech.category === category),
    [category, technologies],
  );

  const dots = useMemo(() => {
    return CATEGORIES.flatMap((cat, categoryIndex) => {
      const members = visible
        .filter((tech) => tech.category === cat.id)
        .sort((a, b) => b.momentum - a.momentum);

      return members.map((tech, index) => {
        const ringIndex = MATURITY_IDS.indexOf(tech.maturity);
        const angle =
          -126 +
          categoryIndex * 72 +
          8 +
          ((index + 0.5) / members.length) * 56 +
          ((hashSlug(tech.slug) % 7) - 3) * 0.7;
        const jitter = ((hashSlug(tech.slug) % 19) - 9) * 1.4;
        const radius = ringIndex * RING_SIZE + 35 + jitter;
        const point = pointOnCircle(angle, radius);

        return {
          tech,
          ...point,
          color: CATEGORY_MAP[tech.category].color,
        };
      });
    });
  }, [visible]);

  const hoveredTech = visible.find((tech) => tech.slug === hovered) ?? null;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="mx-auto w-full max-w-[720px]"
        role="group"
        aria-label="Radar de tecnologias por categoria e maturidade"
      >
        <defs>
          <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
            <stop
              offset="0%"
              stopColor="var(--chart-1)"
              stopOpacity="0.12"
            />
            <stop
              offset="65%"
              stopColor="var(--chart-1)"
              stopOpacity="0.03"
            />
            <stop
              offset="100%"
              stopColor="var(--chart-1)"
              stopOpacity="0"
            />
          </radialGradient>
        </defs>

        <circle
          cx={CENTER}
          cy={CENTER}
          r={OUTER_RADIUS}
          fill="var(--card)"
          stroke="var(--radar-line)"
        />
        <circle cx={CENTER} cy={CENTER} r={OUTER_RADIUS} fill="url(#radar-glow)" />

        {CATEGORIES.map((cat, index) => {
          const start = -126 + index * 72;
          const end = start + 72;
          const middle = start + 36;
          const isActiveSector = hoveredTech?.category === cat.id || category === cat.id;
          const label = pointOnCircle(middle, LABEL_RADIUS);
          const cos = Math.cos((middle * Math.PI) / 180);
          const sin = Math.sin((middle * Math.PI) / 180);
          const textAnchor =
            cos > 0.25 ? "start" : cos < -0.25 ? "end" : "middle";
          const labelDy = sin < -0.4 ? -10 : sin > 0.4 ? 20 : 4;
          const count = visible.filter((tech) => tech.category === cat.id).length;

          return (
            <g key={cat.id}>
              <path
                d={sectorPath(start, end)}
                fill={isActiveSector ? cat.color : "var(--foreground)"}
                fillOpacity={isActiveSector ? 0.055 : index % 2 === 0 ? 0.02 : 0.005}
              />
              <line
                x1={CENTER}
                y1={CENTER}
                x2={pointOnCircle(start, OUTER_RADIUS).x}
                y2={pointOnCircle(start, OUTER_RADIUS).y}
                stroke="var(--radar-line)"
                strokeWidth={1}
              />
              <g className="pointer-events-none opacity-0 sm:opacity-100">
                <text
                  x={label.x}
                  y={label.y + labelDy}
                  textAnchor={textAnchor}
                  fill="var(--foreground)"
                  fontSize={14}
                  fontWeight={600}
                  letterSpacing="0.01em"
                >
                  {cat.shortLabel}
                </text>
                <text
                  x={label.x}
                  y={label.y + labelDy + 15}
                  textAnchor={textAnchor}
                  fill="var(--muted-foreground)"
                  fontSize={10.5}
                  fontFamily="var(--font-geist-mono)"
                >
                  {count} {count === 1 ? "tech" : "techs"}
                </text>
              </g>
            </g>
          );
        })}

        {[1, 2, 3, 4].map((ring) => (
          <circle
            key={ring}
            cx={CENTER}
            cy={CENTER}
            r={ring * RING_SIZE}
            fill="none"
            stroke="var(--radar-line)"
            strokeDasharray="2 6"
            strokeOpacity={1}
          />
        ))}

        <circle
          cx={CENTER}
          cy={CENTER}
          r={2.5}
          fill="var(--muted-foreground)"
        />

        {dots.map((dot) => {
          const isSelected = dot.tech.slug === selectedSlug;
          const isHovered = dot.tech.slug === hovered;
          const dimmed =
            (category !== "all" && dot.tech.category !== category) ||
            (hovered !== null && !isHovered);

          return (
            <g
              key={dot.tech.slug}
              role="button"
              tabIndex={0}
              aria-label={`${dot.tech.name}, ${dot.tech.maturity}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(dot.tech)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(dot.tech);
                }
              }}
              onMouseEnter={() => setHovered(dot.tech.slug)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(dot.tech.slug)}
              onBlur={() => setHovered(null)}
              className={cn(
                "cursor-pointer outline-none transition-opacity duration-200",
                dimmed ? "opacity-30" : "opacity-100",
              )}
            >
              {(isHovered || isSelected) && (
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={isSelected ? 14 : 11}
                  fill={dot.color}
                  fillOpacity={0.16}
                  stroke={dot.color}
                  strokeOpacity={0.4}
                  strokeWidth={1}
                  className="radar-halo"
                />
              )}
              <circle
                cx={dot.x}
                cy={dot.y}
                r={26}
                fill="transparent"
              />
              <circle
                cx={dot.x}
                cy={dot.y}
                r={isHovered ? 8.5 : isSelected ? 8 : 6.5}
                fill={dot.color}
                stroke="var(--card)"
                strokeWidth={2.5}
                className={cn("radar-dot", isSelected && "radar-dot-active")}
                style={{ transition: "r 150ms ease" }}
              />
            </g>
          );
        })}

        {hoveredTech &&
          (() => {
            const dot = dots.find((item) => item.tech.slug === hoveredTech.slug);
            if (!dot) return null;
            const width = Math.max(76, hoveredTech.name.length * 7 + 24);
            const labelY = Math.max(12, dot.y - 26);
            const labelX = Math.min(
              SIZE - width / 2 - 8,
              Math.max(width / 2 + 8, dot.x),
            );

            return (
              <g pointerEvents="none">
                <rect
                  x={labelX - width / 2}
                  y={labelY}
                  width={width}
                  height={DOT_LABEL_HEIGHT}
                  rx={11}
                  fill="var(--popover)"
                  stroke="var(--border)"
                />
                <text
                  x={labelX}
                  y={labelY + 14.5}
                  textAnchor="middle"
                  fill="var(--popover-foreground)"
                  fontSize={11}
                  fontWeight={500}
                >
                  {hoveredTech.name}
                </text>
              </g>
            );
          })()}
      </svg>
    </div>
  );
}
