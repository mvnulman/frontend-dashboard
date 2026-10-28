import { cn } from "@/lib/utils";

function buildHash(values: number[], color: string) {
  return `${color}-${values.join("-")}`.replace(/[^a-zA-Z0-9-]/g, "");
}

export function Sparkline({
  data,
  color = "var(--chart-1)",
  className,
  strokeWidth = 1.75,
  filled = true,
  showDot = false,
}: {
  data: number[];
  color?: string;
  className?: string;
  strokeWidth?: number;
  filled?: boolean;
  showDot?: boolean;
}) {
  if (data.length < 2) return null;

  const width = 160;
  const height = 48;
  const padding = 4;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * width,
    y:
      height -
      padding -
      ((value - min) / range) * (height - padding * 2),
  }));

  const path = points.reduce((accumulator, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const controlX = (previous.x + point.x) / 2;
    return `${accumulator} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, "");

  const area = `${path} L ${width} ${height} L 0 ${height} Z`;
  const gradientId = `spark-${buildHash(data, color)}`;
  const lastPoint = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("h-12 w-full overflow-visible", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {filled && <path d={area} fill={`url(#${gradientId})`} />}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {showDot && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="2.4"
          fill={color}
          stroke="var(--card)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
