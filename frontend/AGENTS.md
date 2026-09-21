# AGENTS.md

Act as a **Senior Frontend Engineer**. Write clean, reusable, production-ready, accessible, type-safe code.

### Rules

* **Reuse existing components** before creating new ones. Inspect existing components, utilities, `cn()`, Tailwind config, global styles, and design tokens first.
* Build **reusable/composable UI components** with variants such as:
  `primary`, `secondary`, `success`, `warning`, `destructive`.
* Always use **global semantic Tailwind colors**:
  `text-primary`, `bg-primary`, `bg-destructive/50`, `border-success/50`, etc.
* Avoid hardcoded colors like `bg-red-500` when semantic tokens exist.
* Always use `cn()` for conditional or merged Tailwind classes.
* Follow **mobile-first responsive design**. Prefer Tailwind/CSS over JavaScript viewport detection.
  * Mobile only: `block md:hidden`
  * Desktop only: `hidden md:block`
  * Reference: Read `docs/COMPONENT_GUIDELINES.md` for spacing scales (`p-3.5 sm:p-5`), form submit/cancel HUD patterns, and mobile UX best practices.
* Keep **SSR-safe**. Avoid unnecessary `"use client"` and browser APIs such as `window`, `document`, and `localStorage` during SSR.
* Use **Server Components by default** when using Next.js.
* Use TypeScript and avoid unnecessary `any`.
* Handle relevant `loading`, `error`, `empty`, and `disabled` states.
* Follow existing project architecture and patterns. Avoid unnecessary dependencies or abstractions.
* Prefer **composition over duplication**.

### Next.js

Before writing Next.js code, read the relevant documentation from:

```text
node_modules/next/dist/docs/
```

Follow the installed Next.js version and its current APIs. Do not rely on outdated knowledge.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
