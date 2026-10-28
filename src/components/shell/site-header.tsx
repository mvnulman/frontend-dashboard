"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { CommandMenu } from "@/components/shell/command-menu";
import { GithubIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/": "Visão geral",
  "/tendencias": "Tendências",
  "/radar": "Radar",
  "/releases": "Releases",
  "/comparar": "Comparar",
};

export function SiteHeader() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Visão geral";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/80 bg-background/80 px-3 backdrop-blur-xl md:px-5">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-1 h-4!" />
      <nav aria-label="Você está em" className="flex min-w-0 items-center gap-1.5 text-xs">
        <Link
          href="/"
          className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline"
        >
          Painel
        </Link>
        <ChevronRight
          className="hidden size-3 text-muted-foreground/50 sm:inline"
          aria-hidden="true"
        />
        <span className="truncate font-medium">{title}</span>
      </nav>

      <div className="ml-auto flex items-center gap-1">
        <Badge
          variant="outline"
          className="mr-1 hidden h-6 gap-1.5 border-border/80 bg-card/50 px-2 font-mono text-[10px] font-normal text-muted-foreground md:flex"
        >
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-chart-1 opacity-70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-chart-1" />
          </span>
          dados ao vivo
        </Badge>
        <CommandMenu />
        <Separator orientation="vertical" className="mx-1 h-4!" />
        <a
          href="https://github.com/mvnulman/frontend-dashboard"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir repositório no GitHub"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <GithubIcon className="size-4" />
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
