"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex max-w-md flex-col items-center rounded-xl border bg-card/70 px-6 py-10 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-chart-5/10 text-chart-5">
          <TriangleAlert className="size-5" />
        </span>
        <h2 className="mt-4 text-lg font-semibold tracking-tight">
          Algo saiu do radar
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Não foi possível carregar esta seção. Tente novamente — se o erro
          persistir, recarregue o painel.
        </p>
        <Button variant="outline" onClick={reset} className="mt-5">
          <RotateCcw />
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
