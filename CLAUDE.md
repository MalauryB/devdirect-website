# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Package Management:**
- Uses pnpm (pnpm-lock.yaml present)

## Architecture

This is a Next.js 14 website using the App Router with TypeScript and Tailwind CSS.

**Key Structure:**
- `/app` - Next.js App Router pages (page.tsx, layout.tsx, globals.css)
- `/components` - React components organized as:
  - Main page sections: header.tsx, hero.tsx, services.tsx, process.tsx, team.tsx, cta.tsx, footer.tsx
  - `/ui` - shadcn/ui component library components
  - theme-provider.tsx for dark/light theme support
- `/hooks` - Custom React hooks (use-mobile.ts, use-toast.ts)
- `/lib` - Utility functions (utils.ts)
- `/styles` - Additional stylesheets
- `/assets` - Static assets
- `/public` - Public static files

**UI Framework:**
- Uses shadcn/ui component system (components.json configuration)
- Tailwind CSS with Tailwind CSS v4
- Radix UI primitives for accessibility
- Lucide React for icons
- next-themes for theme switching

**Styling:**
- Path alias `@/*` points to root directory
- CSS variables enabled for theming
- Uses "new-york" style variant from shadcn/ui

**Configuration:**
- ESLint and TypeScript errors ignored during builds (next.config.mjs)
- Images unoptimized in Next.js config
- Strict TypeScript configuration with absolute imports via `@/*`