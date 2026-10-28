export interface TechSource {
  /** Pacote oficial no npm, quando existir. */
  npm?: string;
  /** Repositório principal no GitHub, no formato owner/repo. */
  github?: string;
  /**
   * "editorial" para tecnologias sem fonte pública direta.
   * Entram no catálogo e no radar, mas não nos cálculos automáticos.
   */
  metrics?: "live" | "editorial";
  note?: string;
}

export const TECH_SOURCES: Record<string, TechSource> = {
  react: { npm: "react", github: "facebook/react" },
  vue: { npm: "vue", github: "vuejs/core" },
  svelte: { npm: "svelte", github: "sveltejs/svelte" },
  angular: { npm: "@angular/core", github: "angular/angular" },
  solid: { npm: "solid-js", github: "solidjs/solid" },
  nextjs: { npm: "next", github: "vercel/next.js" },
  astro: { npm: "astro", github: "withastro/astro" },
  nuxt: { npm: "nuxt", github: "nuxt/nuxt" },
  "react-router": { npm: "react-router", github: "remix-run/react-router" },
  "tanstack-start": {
    npm: "@tanstack/react-start",
    github: "TanStack/router",
  },
  tailwindcss: { npm: "tailwindcss", github: "tailwindlabs/tailwindcss" },
  "shadcn-ui": { npm: "shadcn", github: "shadcn-ui/ui" },
  "base-ui": { npm: "@base-ui/react", github: "mui/base-ui" },
  motion: { npm: "motion", github: "motiondivision/motion" },
  "view-transitions": {
    github: "WICG/view-transitions",
    note: "Especificação web; adoção aproximada pela atividade do repositório.",
  },
  "panda-css": { npm: "@pandacss/dev", github: "chakra-ui/panda" },
  vite: { npm: "vite", github: "vitejs/vite" },
  turbopack: {
    metrics: "editorial",
    note: "Distribuído dentro do Next.js; sem pacote ou repositório isolado.",
  },
  rolldown: { npm: "rolldown", github: "rolldown/rolldown" },
  biome: { npm: "@biomejs/biome", github: "biomejs/biome" },
  oxlint: { npm: "oxlint", github: "oxc-project/oxc" },
  bun: { npm: "bun", github: "oven-sh/bun" },
  typescript: { npm: "typescript", github: "microsoft/TypeScript" },
  vitest: { npm: "vitest", github: "vitest-dev/vitest" },
  playwright: { npm: "playwright", github: "microsoft/playwright" },
  webpack: { npm: "webpack", github: "webpack/webpack" },
  rspack: { npm: "@rspack/core", github: "web-infra-dev/rspack" },
  storybook: { npm: "storybook", github: "storybookjs/storybook" },
  "tanstack-query": {
    npm: "@tanstack/react-query",
    github: "TanStack/query",
  },
  zustand: { npm: "zustand", github: "pmndrs/zustand" },
  jotai: { npm: "jotai", github: "pmndrs/jotai" },
  trpc: { npm: "@trpc/server", github: "trpc/trpc" },
  "redux-toolkit": {
    npm: "@reduxjs/toolkit",
    github: "reduxjs/redux-toolkit",
  },
  xstate: { npm: "xstate", github: "statelyai/xstate" },
};
