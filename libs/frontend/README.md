# Frontend

A modern web application built with [SvelteKit](https://kit.svelte.dev/).

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

## Architecture Overview

### Key Technologies

- **SvelteKit** - Framework for applications
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling framework
- **Vite** - Build tool and dev server
- **CodeMirror** - Code editor component
- **Zod** - Runtime validation (shared via `types` package)

## Getting Started

### Prerequisites

1. **Node.js 20+** and **pnpm** installed
2. **Backend API** running (see [backend README](../backend/README.md))
3. Backend must be accessible at the URL you configure

### Quick Setup

1. **Install dependencies** using pnpm (workspace-aware):

   ```bash
   pnpm install
   ```

2. **Set up environment variables**:

   Create a `.env` file in `libs/frontend/`:

3. **Start development server**:

   ```bash
   pnpm dev
   ```

4. **Open in browser**:

Navigate to `http://localhost:5173` and start exploring!

## Environment Variables

Create a `.env` file in `libs/frontend/` based on `.env.example`:

### Why `VITE_` prefix?

Vite only exposes environment variables prefixed with `VITE_` to the client-side code. This prevents accidentally exposing sensitive server-side variables.

## Resources

- [Svelte Documentation](https://svelte.dev/)
- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [CodeMirror 5 Documentation](https://codemirror.net/5/)
- [Vite Documentation](https://vitejs.dev/)

---

**Questions?** Check the main [project README](../../README.md) or ask in discussions.
