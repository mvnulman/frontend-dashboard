"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  LayoutDashboard,
  Moon,
  Radar as RadarIcon,
  RefreshCcw,
  Search,
  Tag,
  TrendingUp,
  GitCompareArrows,
} from "lucide-react";
import { useTheme } from "next-themes";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { CategoryDot } from "@/components/category-icon";
import { GithubIcon } from "@/components/icons";
import { CATEGORY_MAP, technologies } from "@/lib/data";
import { Button } from "@/components/ui/button";

const pages = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/tendencias", label: "Tendências", icon: TrendingUp },
  { href: "/radar", label: "Radar", icon: RadarIcon },
  { href: "/releases", label: "Releases", icon: Tag },
  { href: "/comparar", label: "Comparar", icon: GitCompareArrows },
];

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-8 w-52 items-center gap-2 rounded-lg border border-input/70 bg-muted/30 px-2.5 text-xs text-muted-foreground transition-colors outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/40 lg:flex xl:w-60"
      >
        <Search className="size-3.5" aria-hidden="true" />
        <span>Buscar no painel</span>
        <kbd className="ml-auto rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Buscar no painel"
        onClick={() => setOpen(true)}
      >
        <Search />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={(nextOpen) => setOpen(nextOpen)}
        title="Busca rápida"
        description="Navegue entre páginas e tecnologias do painel."
      >
        <CommandInput placeholder="Buscar páginas ou tecnologias..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Páginas">
            {pages.map((page) => (
              <CommandItem
                key={page.href}
                value={`${page.label} ${page.href}`}
                onSelect={() => go(page.href)}
              >
                <page.icon className="text-muted-foreground" />
                {page.label}
                <ArrowRight className="ml-auto size-3.5 text-muted-foreground" />
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Tecnologias">
            {technologies.map((tech) => (
              <CommandItem
                key={tech.slug}
                value={`${tech.name} ${tech.version} ${tech.tags.join(" ")} ${tech.category}`}
                onSelect={() => go(`/tendencias?tech=${tech.slug}`)}
              >
                <CategoryDot category={tech.category} />
                <span className="truncate">{tech.name}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  v{tech.version}
                </span>
                <CommandShortcut>
                  {CATEGORY_MAP[tech.category].shortLabel}
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Ações">
            <CommandItem
              value="alternar tema claro escuro"
              onSelect={() => {
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
                setOpen(false);
              }}
            >
              <Moon className="text-muted-foreground" />
              Alternar tema
            </CommandItem>
            <CommandItem
              value="repositório github código fonte"
              onSelect={() => {
                setOpen(false);
                window.open(
                  "https://github.com/mvnulman/frontend-dashboard",
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
            >
              <GithubIcon className="size-4 text-muted-foreground" />
              Abrir repositório
            </CommandItem>
            <CommandItem
              value="atualizar snapshot dados"
              onSelect={() => {
                setOpen(false);
                router.refresh();
              }}
            >
              <RefreshCcw className="text-muted-foreground" />
              Atualizar snapshot
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
