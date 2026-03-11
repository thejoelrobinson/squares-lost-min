# FeedbackLoop

A Duolingo-inspired app that teaches managers to give effective feedback in 1:1s. 10 parts: onboarding + 9 lessons, each with a podcast, comprehension check, and puzzle-piece reward.

## Stack

- **SvelteKit 2 + Svelte 5** — runes only (`$state`, `$derived`, `$props`, `$effect`, `{@render children()}`). No legacy `$:`, `export let`, or `<slot>`.
- **Tailwind CSS 4** — theme via `@theme` block in `layout.css`. No `tailwind.config.js`.
- **Drizzle + better-sqlite3** — local SQLite. Schema in `src/lib/server/db/schema.ts`.
- **MDsveX** — `.svx` lesson transcripts in `src/lib/content/lessons/`.
- **Bits UI** — unstyled accessible primitives.
- **TypeScript** — strict mode, `@typescript-eslint/no-explicit-any` enforced via ESLint.

## Lesson System

Each lesson follows three phases: **podcast** (audio player) → **comprehension** (quiz or voice) → **reward** (puzzle piece).

### Creating/editing lessons

1. **Add the `.svx` transcript** to `src/lib/content/lessons/` — pure markdown with YAML frontmatter (`part`, `title`, `slug`). No component imports.
2. **Add quiz and content data** to `src/lib/content/lesson-data.ts` — objectives, quiz questions (`multiple-choice`, `order`, `freeform`), voice prompt template.
3. **Add the lesson row** to the seed script in `src/lib/server/db/seed.ts`, then run `npm run db:push && npm run db:seed`.
4. **Place audio** in `static/audio/{part}-{slug}.mp3`.

Lessons are loaded by slug. The `lesson-data.ts` record and the DB `lessons` table must share the same slug.

## Comprehension Strategies

- **Quiz mode** (default): multiple-choice, drag-to-order, and freeform response. Freeform answers are scored by an LLM via OpenRouter (`src/lib/server/llm.ts`). Pass threshold: 0.6.
- **Voice mode**: ElevenLabs Conversational AI Socratic dialogue. Transcript sent to LLM for scoring on completion. Falls back to quiz if unconfigured.

## Theming

All colors are defined once in the `@theme` block in `src/routes/layout.css`. This generates both CSS custom properties and Tailwind utilities automatically:

```
bg-primary, text-text, bg-surface-raised, text-text-muted, border-error, etc.
```

Base body styles live in `src/lib/theme/tokens.css`. Use theme utilities everywhere — do not hardcode colors.

## Quality Checks

Run these regularly and before finishing any task:

- **`/simplify`** — review changed code for reuse, quality, and efficiency.
- **Svelte MCP `svelte-autofixer`** — validates Svelte components. Run on every `.svelte` file you write or edit. Keep calling until zero issues.
- **`npx eslint src/`** — enforces `no-explicit-any`, unused vars, and Svelte rules. Must pass clean.
- **`npx svelte-check`** — full type checking. Zero errors required.

## Key Conventions

- IDs: `ulid()` from `ulidx`. Never `crypto.randomUUID()`.
- DB timestamps: `integer('...', { mode: 'timestamp' })`.
- Single-user MVP: `hooks.server.ts` sets `locals.userId` from the first DB user.
- API routes return JSON via SvelteKit's `json()` helper.
- Unused function params: prefix with `_` (e.g., `_event`).

## Svelte MCP

Use `list-sections` to discover documentation, then `get-documentation` to fetch relevant sections. Always run `svelte-autofixer` on Svelte code before considering it done.

## Workflow

Delegate work to teammates or subagents when possible to preserve main chat context. Keep the main conversation for coordination, decisions, and user communication.
