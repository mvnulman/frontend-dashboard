# Frontend Radar

Dashboard interativo para acompanhar **tendências, releases e atividade das tecnologias do ecossistema frontend** com dados públicos de **npm e GitHub**.

[![CI](https://github.com/mvnulman/frontend-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/mvnulman/frontend-dashboard/actions/workflows/ci.yml)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-components-000000)](https://ui.shadcn.com)

![Preview do Frontend Radar](docs/preview.png)

## O que é

O **Frontend Radar** combina métricas reais de adoção com uma camada editorial para transformar o ecossistema em uma leitura visual: downloads, releases, momentum, maturidade, categorias e comparações lado a lado.

- **Dados automáticos:** npm Downloads, npm Registry e GitHub.
- **Atualização:** cache de 30 minutos no servidor; a primeira requisição busca as fontes, as seguintes reutilizam o cache.
- **Camada editorial:** maturidade no radar, scores e contexto de uso, com data de revisão.
- **Sem banco de dados:** o painel funciona somente com as APIs públicas e o cache do Next.js.

> Adoção e momentum são **índices calculados** a partir de métricas públicas. Não são uma pesquisa de mercado nem um benchmark oficial. Os scores editoriais também não são medições objetivas.

## Funcionalidades

- **Visão geral** com KPIs, destaque de maior tração, downloads reais por categoria, líderes de momentum, maturidade, sinais e últimos lançamentos.
- **Catálogo de tendências** com busca tolerante a acentos, filtros por categoria e maturidade, ordenação, grade/lista, ficha detalhada e exportação CSV.
- **Radar interativo** em SVG com cinco setores, quatro anéis de maturidade, filtros por categoria, painel “em foco” e índice completo.
- **Timeline de releases** capturada no GitHub, com filtros por tipo e categoria, resumo de cadência e impacto.
- **Comparador** de até três tecnologias com presets, radar chart de scores, leitura rápida e ficha técnica.
- **Command palette** (`⌘K` / `Ctrl+K`) para navegar, buscar tecnologias, alternar tema e copiar o link da página.
- **Tema claro e escuro**, layout responsivo de 320 px a telas amplas e sidebar em sheet no mobile.
- **Acessibilidade** auditada com axe (teclado, landmarks, labels, contraste e `prefers-reduced-motion`).
- **Degradação transparente:** se o GitHub não estiver configurado, o painel continua com os dados do npm e exibe um aviso.

## Stack

| Camada | Escolha |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, PPR) |
| Linguagem | TypeScript strict |
| Estilo | Tailwind CSS v4 |
| Componentes | shadcn/ui (Base UI primitives) |
| Gráficos | Recharts + shadcn `chart` |
| Ícones | Lucide React |
| Tema | next-themes |
| Toasts | Sonner |
| Testes | Vitest |
| Qualidade | ESLint + `tsc --noEmit` |

## Rotas

| Rota | Descrição |
| --- | --- |
| `/` | Visão geral, downloads por categoria e sinais |
| `/tendencias` | Catálogo filtrável de tecnologias |
| `/radar` | Radar de adoção e maturidade |
| `/releases` | Timeline de lançamentos do GitHub |
| `/comparar` | Comparação de 2–3 tecnologias |

## Rodando localmente

Requisitos: **Node.js 22+** e npm.

```bash
npm install
cp .env.example .env.local
# preencha GITHUB_TOKEN e, se quiser, NEXT_PUBLIC_SITE_URL
npm run dev
```

Para gerar um token local rapidamente com o GitHub CLI:

```bash
gh auth token
```

Abra [http://localhost:3000](http://localhost:3000).

> Sem `GITHUB_TOKEN`, estrelas e releases não são carregados. Os downloads e a maior parte do dashboard continuam funcionando, com um aviso de cobertura parcial.

## Variáveis de ambiente

```env
# URL pública usada para resolver a imagem de Open Graph.
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Token somente leitura para estrelas e releases do GitHub.
GITHUB_TOKEN=github_pat_...
```

## Scripts

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção
npm run start      # servidor de produção
npm run lint       # ESLint
npm run typecheck  # TypeScript sem emitir arquivos
npm run test       # Vitest
npm run check      # lint + typecheck + testes
```

## Estrutura

```text
src/
├── app/
│   ├── (dashboard)/        # rotas do painel + shell
│   ├── layout.tsx          # fontes, tema, metadata e toaster
│   ├── opengraph-image.tsx # OG image gerada em runtime
│   └── globals.css         # tokens, tema e utilitários
├── components/
│   ├── dashboard/          # blocos da visão geral
│   ├── tendencias/         # catálogo, cards e filtros
│   ├── radar/              # SVG e painel do radar
│   ├── releases/           # timeline e resumo
│   ├── compare/            # comparador e radar chart
│   ├── shell/              # sidebar, header e command palette
│   └── ui/                 # shadcn/ui
└── lib/
    ├── data.ts             # catálogo e curadoria editorial
    ├── live/               # npm, GitHub, cálculo e cache
    ├── types.ts            # contratos do domínio
    ├── format.ts           # formatadores pt-BR
    └── csv.ts              # exportação CSV
tests/                      # testes de cálculo e integridade
```

## Como os números são calculados

- **Downloads:** soma dos últimos 7 dias, com série semanal de 12 semanas, via API pública do npm.
- **Crescimento:** comparação dos últimos 30 dias com os 30 dias anteriores.
- **Adoção:** índice 0–100 calculado por percentis de downloads, estrelas e releases no conjunto monitorado.
- **Momentum:** índice 0–100 que combina crescimento de downloads e cadência de releases.
- **Maturidade e scores:** curadoria editorial, não automática.
- **Releases:** tags do GitHub normalizadas; subpacotes de monorepos e canaries são filtrados.

Tecnologias sem fonte pública direta — como o Turbopack, distribuído dentro do Next.js — aparecem no catálogo como **curadoria** e ficam fora dos índices automáticos.

## Limitações

- O GitHub não expõe histórico público de estrelas; o gráfico principal usa downloads do npm, que têm histórico real.
- A primeira requisição após o cache expirar pode levar alguns segundos.
- APIs públicas podem falhar ou impor limites; o painel sinaliza cobertura parcial.
- O cache usa o Data Cache do Next.js. Em serverless, a persistência é garantida pelo cache do framework, não por um banco próprio.

## Deploy

O projeto precisa de um host com runtime Node.js — **não use exportação estática**, porque os dados são buscados no servidor.

Na Vercel:

- Framework preset: **Next.js**
- Root directory: `./`
- Build command: `npm run build`
- Node.js: **22.x**
- Variáveis: `GITHUB_TOKEN` e `NEXT_PUBLIC_SITE_URL`

## Autor

Feito por [mvnulman](https://github.com/mvnulman).

Se este projeto foi útil, deixe uma estrela no repositório.
