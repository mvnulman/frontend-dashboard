import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Frontend Radar — tendências do ecossistema frontend",
    template: "%s · Frontend Radar",
  },
  description:
    "Painel interativo com tendências, releases e maturidade das tecnologias que estão moldando o desenvolvimento frontend.",
  applicationName: "Frontend Radar",
  keywords: [
    "frontend",
    "dashboard",
    "tendências",
    "React",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "shadcn/ui",
  ],
  authors: [{ name: "mvnulman", url: "https://github.com/mvnulman" }],
  creator: "mvnulman",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Frontend Radar — tendências do ecossistema frontend",
    description:
      "Tendências, releases e maturidade das tecnologias que estão moldando o frontend.",
    siteName: "Frontend Radar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frontend Radar",
    description:
      "Tendências, releases e maturidade das tecnologias que estão moldando o frontend.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0b100e" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-svh">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Toaster position="bottom-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
