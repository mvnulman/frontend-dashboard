import Link from "next/link";
import { ArrowLeft, Radar } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-6">
      <div className="bg-grid mask-radial-soft absolute inset-0 opacity-60" />
      <div className="relative flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/10">
          <Radar className="size-7" />
        </div>
        <p className="font-mono text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
          erro 404
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Esta página saiu do radar.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          O endereço que você tentou abrir não existe ou foi movido para outro
          lugar do painel.
        </p>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
        >
          <ArrowLeft />
          Voltar à visão geral
        </Link>
      </div>
    </div>
  );
}
