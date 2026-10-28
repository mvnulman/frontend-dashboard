import Link from "next/link";
import {
  ArrowUpRight,
  Boxes,
  FileCode2,
  Tag,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signals } from "@/lib/data";
import type { Signal } from "@/lib/types";

const SIGNAL_STYLES: Record<
  Signal["type"],
  { icon: LucideIcon; color: string; label: string }
> = {
  release: { icon: Tag, color: "var(--chart-2)", label: "Release" },
  growth: { icon: TrendingUp, color: "var(--chart-1)", label: "Crescimento" },
  rfc: { icon: FileCode2, color: "var(--chart-4)", label: "RFC" },
  ecosystem: { icon: Boxes, color: "var(--chart-3)", label: "Ecossistema" },
};

export function SignalFeed() {
  return (
    <Card className="h-full gap-3 bg-card/70">
      <CardHeader>
        <CardTitle>Sinais recentes</CardTitle>
        <CardDescription>O que movimentou o ecossistema</CardDescription>
        <CardAction>
          <Link
            href="/releases"
            className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Releases
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="divide-y divide-border/60">
          {signals.slice(0, 5).map((signal) => {
            const style = SIGNAL_STYLES[signal.type];

            return (
              <div
                key={signal.id}
                className="group flex gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span
                  className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md ring-1 ring-inset ring-foreground/5"
                  style={{
                    color: style.color,
                    backgroundColor: `color-mix(in oklab, ${style.color} 12%, transparent)`,
                  }}
                  aria-hidden="true"
                >
                  <style.icon className="size-3.5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
                      {signal.source}
                    </span>
                    <span className="text-border">/</span>
                    <span className="text-[10px] text-muted-foreground">
                      {signal.time}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-snug font-medium">
                    {signal.title}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                    {signal.description}
                  </p>
                </div>

                <span className="mt-1 hidden shrink-0 self-start rounded-md border border-border/70 bg-muted/30 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground tabular-nums sm:block">
                  {signal.metric}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
