"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GitCompareArrows,
  LayoutDashboard,
  Radar,
  Tag,
  TrendingUp,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { GithubIcon } from "@/components/icons";
import { releases, SNAPSHOT, technologies } from "@/lib/data";

const primaryNav = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/tendencias", label: "Tendências", icon: TrendingUp },
  { href: "/radar", label: "Radar", icon: Radar },
  { href: "/releases", label: "Releases", icon: Tag },
];

const analysisNav = [
  { href: "/comparar", label: "Comparar", icon: GitCompareArrows },
];

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="pt-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Frontend Radar"
              render={<Link href="/" aria-label="Frontend Radar — início" />}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Radar className="size-4.5" />
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-mono text-[13px] font-semibold tracking-tight">
                  frontend.radar
                </span>
                <span className="truncate text-[11px] font-normal text-muted-foreground">
                  trend observatory
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
            Painel
          </SidebarGroupLabel>
          <SidebarMenu>
            {primaryNav.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={isActive(item.href)}
                  tooltip={item.label}
                  render={<Link href={item.href} />}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
                {item.href === "/tendencias" && (
                  <SidebarMenuBadge>{technologies.length}</SidebarMenuBadge>
                )}
                {item.href === "/releases" && (
                  <SidebarMenuBadge>{releases.length}</SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
            Análise
          </SidebarGroupLabel>
          <SidebarMenu>
            {analysisNav.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={isActive(item.href)}
                  tooltip={item.label}
                  render={<Link href={item.href} />}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] tracking-[0.18em] uppercase">
            Recurso
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Repositório no GitHub"
                render={
                  <a
                    href="https://github.com/mvnulman/frontend-dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <GithubIcon className="size-4" />
                <span>GitHub</span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  ↗
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="pb-2">
        <div className="rounded-lg border border-sidebar-border bg-card/60 p-3 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2 text-[11px] font-medium">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-chart-1 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-chart-1" />
            </span>
            Snapshot · {SNAPSHOT.label}
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            {technologies.length} tecnologias monitoradas.
            <br />
            Dados demonstrativos.
          </p>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
