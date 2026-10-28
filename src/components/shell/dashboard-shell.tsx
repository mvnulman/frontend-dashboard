import Link from "next/link";
import type { ReactNode } from "react";

import { AppSidebar } from "@/components/shell/app-sidebar";
import { SiteHeader } from "@/components/shell/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <SiteHeader />
        <div className="flex-1 overflow-x-clip px-4 py-6 md:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1500px]">{children}</div>
        </div>
        <footer className="mt-auto border-t border-border/70 px-4 py-5 md:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-2 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-mono font-medium text-foreground/80">
                frontend.radar
              </span>{" "}
              · dados públicos de npm e GitHub · atualização automática a cada
              30 min.
            </p>
            <p className="flex items-center gap-1.5">
              <span>Next.js</span>
              <span className="text-border">/</span>
              <span>TypeScript</span>
              <span className="text-border">/</span>
              <span>Tailwind</span>
              <span className="text-border">/</span>
              <Link
                href="https://ui.shadcn.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                shadcn/ui
              </Link>
            </p>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
