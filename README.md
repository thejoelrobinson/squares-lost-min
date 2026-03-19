# FeedbackLoop

> A Duolingo-inspired app that teaches managers to give effective feedback in 1:1s.

Learners complete 9 lessons through a **podcast → comprehension check → puzzle reward** loop. Each lesson awards a puzzle piece; finishing the course assembles a complete image.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Lessons](#lessons)
- [Learning Flow](#learning-flow)
- [Comprehension Strategies](#comprehension-strategies)
- [Gamification](#gamification)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Quality Checks](#quality-checks)
- [Conventions](#conventions)

---

## Overview

FeedbackLoop is a single-user, local-first web app. A manager works through 9 lessons covering the SBI feedback framework, psychological safety, cognitive resistance, and advanced dialogue tactics. Each lesson has three phases:

1. **Podcast** — A short, conversational audio episode with synced subtitles and a transcript.
2. **Comprehension Check** — Quiz, voice dialogue (ElevenLabs), or text-based roleplay depending on the lesson.
3. **Puzzle Reward** — An animated puzzle piece is awarded on pass. Collect all 9 to complete the board.

Progress, XP, and streaks persist in a local SQLite database. No login required — the first user in the database is automatically authenticated.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 (runes only) |
| Styling | Tailwind CSS 4 (`@theme` block, no config file) |
| Database | SQLite via `better-sqlite3` |
| ORM | Drizzle ORM |
| Content | MDsveX (`.svx` lesson transcripts) |
| UI Primitives | Bits UI (unstyled, accessible) |
| Voice AI | ElevenLabs Conversational AI |
| LLM Evaluation | OpenRouter (Gemini 2.0 Flash by default) |
| Animations | Lottie Web |
| IDs | `ulidx` (ULID generation) |
| Type Checking | TypeScript strict mode |
| Linting | ESLint + `@typescript-eslint/no-explicit-any` |

**Svelte 5 runes only**: `$state`, `$derived`, `$props`, `$effect`, `{@render children()}`. No legacy `$:`, `export let`, or `<slot>`.

---

## Project Structure

```
src/
├── lib/
│   ├── components/          # UI components
│   │   ├── quiz/            # MultipleChoice, DragToOrder, FillInTheBlank, TrueFalse, MatchPairs, FreeformResponse
│   │   ├── PodcastPlayer.svelte
│   │   ├── ComprehensionCheck.svelte   # Dispatcher: quiz / voice / roleplay
│   │   ├── VoiceChat.svelte            # ElevenLabs Conversational AI
│   │   ├── ScenarioChat.svelte         # Text-based roleplay
│   │   ├── LessonMap.svelte            # Home screen SVG lesson map
│   │   ├── PuzzleBoard.svelte
│   │   ├── PuzzleReward.svelte         # Lottie reward animation
│   │   ├── FeedbackPanel.svelte        # Structured AI feedback display
│   │   ├── OnboardingForm.svelte
│   │   └── WelcomeTour.svelte
│   ├── server/
│   │   ├── db/
│   │   │   ├── schema.ts    # Drizzle table definitions
│   │   │   ├── index.ts     # DB client
│   │   │   ├── queries.ts   # CRUD helpers
│   │   │   └── seed.ts      # Lesson seeding script
│   │   ├── llm.ts           # OpenRouter integration
│   │   └── elevenlabs.ts    # ElevenLabs TTS / agent setup
│   ├── content/
│   │   ├── lesson-data.ts   # Lesson metadata registry (objectives, quiz questions, voice prompts)
│   │   └── lessons/
│   │       ├── 01-onboarding/
│   │       ├── 02-psychology-perception/   # quiz.ts, subtitles.ts, transcript.svx
│   │       ├── 03-chronology-intervention/
│   │       ├── 04-sbi-structural-model/
│   │       ├── 05-test-1/
│   │       ├── 06-delivery-into-dialogue/
│   │       ├── 07-case-studies-scenarios/
│   │       ├── 08-cognitive-resistance/
│   │       ├── 10-advanced-tactics/
│   │       └── sam-quotes.ts              # Motivational quotes shown during quiz
│   ├── types.ts
│   ├── theme/tokens.css
│   └── utils/
│       ├── soundEffects.ts
│       └── haptics.ts
├── routes/
│   ├── +layout.svelte          # App shell: header, footer, settings panel
│   ├── +layout.server.ts       # Loads user + all lesson progress
│   ├── +page.svelte            # Home / lesson map
│   ├── onboarding/
│   ├── lesson/[slug]/          # Lesson orchestrator (podcast → comprehension → reward)
│   ├── puzzle/                 # Full puzzle board view
│   └── api/                    # REST API routes (see API Routes section)
├── hooks.server.ts             # Sets locals.userId to first DB user
static/
└── audio/                      # Podcast MP3s: {part:padded}-{slug}/podcast.mp3
```

---

## Lessons

| Part | Slug | Title |
|------|------|-------|
| 1 | `onboarding` | Getting to Know You |
| 2 | `why-feedback-matters` | The Psychology and Perception of Feedback |
| 3 | `sbi-framework` | The Chronology and Purpose of Intervention |
| 4 | `timing-is-everything` | The SBI Structural Model |
| 5 | `test-1` | Test 1 (Roleplay Assessment) |
| 6 | `reading-the-room` | Transforming Delivery into Dialogue (SBI-N Model) |
| 7 | `being-specific` | Real-World Case Studies and Scenarios |
| 8 | `hard-conversations` | Navigating Cognitive Resistance (The 4 Ds) |
| 9 | `test-2` | Test 2 (Roleplay Assessment) |
| 10 | `listening-after-you-speak` | Advanced Tactics for Guiding Difficult Conversations |
| 11 | `final-test` | Final Test (Roleplay Assessment) |

Lessons 5, 9, and 11 are assessment checkpoints that use text-based roleplay instead of a standard podcast + quiz flow.

---

## Learning Flow

```
Home (Lesson Map)
    │
    ▼
lesson/[slug]
    │
    ├── Phase 1: Podcast
    │     Audio player with playback controls, speed toggle,
    │     transcript viewer, and synced subtitles.
    │     Complete → advances to Phase 2.
    │
    ├── Phase 2: Comprehension Check
    │     (see Comprehension Strategies below)
    │     Pass → advances to Phase 3.
    │
    └── Phase 3: Puzzle Reward
          Lottie animation plays. Puzzle piece saved.
          Returns to home map with lesson marked complete.
```

---

## Comprehension Strategies

`ComprehensionCheck.svelte` dispatches to one of three modes based on lesson configuration and available API keys.

### Quiz Mode (default)

Multi-question quiz with **3 hearts** (lives). Wrong answers re-queue the question.

**Question types:**
- `multiple-choice` — single or multi-select
- `true-false`
- `order` — drag-to-reorder items
- `fill-in-the-blank`
- `matching` — match pairs
- `freeform` — short-answer, scored by LLM

Freeform answers are POSTed to `/api/comprehension/freeform` where OpenRouter evaluates them against expected criteria and returns a 0–1 score.

Pass threshold: **0.6**

### Voice Mode (ElevenLabs)

Activated when `ELEVENLABS_AGENT_ID` is configured and the lesson has a `voicePromptTemplate`.

- ElevenLabs Conversational AI runs a Socratic dialogue with the learner.
- A system prompt is constructed from the user's profile (role, team size, comfort level) and lesson objectives.
- On session end, the transcript is sent to `/api/comprehension/evaluate` for LLM scoring.

### Roleplay / Test Mode (text-based LLM)

Used for test lessons (`test-1`, `test-2`, `final-test`).

- A scenario briefing is shown first.
- The learner types responses; the LLM (via OpenRouter) plays the role of "Jamie", the manager's direct report.
- When the conversation concludes, `/api/comprehension/evaluate` scores the full transcript against lesson objectives.
- Development fallback: if no `OPENROUTER_API_KEY` is set, pre-canned responses are returned.

### Structured Feedback

All three modes return the same `StructuredFeedback` shape displayed by `FeedbackPanel.svelte`:

```typescript
{
  score: number;           // 0–1
  summary: string;
  objectiveAssessments: {
    objective: string;
    met: boolean;
    feedback: string;
  }[];
  strengths: string[];
  nextSteps: string[];
}
```

---

## Gamification

| Feature | Details |
|---|---|
| **XP** | Awarded per correct quiz answer. Tracked on the user row. |
| **Streaks** | `lastActiveDate` on user. Current and longest streaks displayed in header. |
| **Puzzle Pieces** | 9 pieces (one per lesson 2–10), keyed to `puzzlePosition` on the lesson row. |
| **Hearts** | 3 lives per quiz session. Displayed by `HeartIndicator.svelte`. |
| **Sam Quotes** | Motivational Sam Walton quotes shown between quiz questions (`sam-quotes.ts`). |
| **Sound & Haptics** | Toggle in header. Sound effects on correct/incorrect answers. |

---

## Database Schema

All IDs are ULIDs (via `ulidx`). Timestamps use `integer({ mode: 'timestamp' })`.

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | text | ULID, primary key |
| `name`, `lastName` | text | |
| `role` | text | e.g. "Engineering Manager" |
| `feedbackFrequency` | text | How often they give feedback |
| `teamSize` | integer | |
| `comfortLevel` | integer | 1–5 self-rating |
| `challenges` | text | JSON array of selected challenges |
| `scenario` | text | Optional custom scenario |
| `xp` | integer | Total XP earned |
| `currentStreak`, `longestStreak` | integer | |
| `lastActiveDate` | text | ISO date string |
| `createdAt`, `updatedAt` | integer | Timestamps |

### `lessons`

| Column | Type | Notes |
|---|---|---|
| `id` | text | Primary key |
| `partNumber` | integer | |
| `title`, `slug` | text | |
| `podcastUrl` | text | Path to MP3 in `/static/audio/` |
| `transcript` | text | Default empty |
| `puzzlePosition` | text | One of 9 grid positions, or null |

### `lessonProgress`

| Column | Type | Notes |
|---|---|---|
| `id` | text | ULID, primary key |
| `userId`, `lessonId` | text | Foreign keys |
| `status` | text | `locked` → `available` → `podcast_complete` → `comprehension_complete` → `complete` |
| `comprehensionMode` | text | `'voice'` or `'quiz'` |
| `comprehensionData` | text | JSON transcript or quiz answers |
| `comprehensionScore` | real | 0–1 |
| `puzzleEarned` | integer | Boolean (0/1) |
| `startedAt`, `completedAt` | integer | Timestamps |

### `conversations`

| Column | Type | Notes |
|---|---|---|
| `id` | text | ULID, primary key |
| `userId`, `lessonId` | text | Foreign keys |
| `transcript` | text | JSON array of conversation turns |
| `aiAssessment` | text | JSON StructuredFeedback |
| `createdAt` | integer | Timestamp |

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/user` | GET | Fetch current user profile |
| `/api/user` | POST | Create user (onboarding submission) |
| `/api/progress` | GET | Fetch all lesson progress |
| `/api/progress` | PATCH | Update lesson status, score, puzzle flag |
| `/api/xp` | POST | Add XP to current user |
| `/api/settings/reset` | POST | Reset all progress, XP, and streaks |
| `/api/settings/jump` | POST | Jump to a specific lesson part (dev/admin) |
| `/api/comprehension/evaluate` | POST | Score a voice transcript or roleplay session |
| `/api/comprehension/freeform` | POST | Score a single freeform quiz answer |
| `/api/comprehension/agent-config` | GET | Return ElevenLabs agent ID for voice mode |
| `/api/comprehension/roleplay` | POST | LLM roleplay (actions: `message` or `evaluate`) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
git clone https://github.com/thejoelrobinson/squares-lost-min.git
cd squares-lost-min
npm install
```

### Database Setup

```bash
npm run db:push    # Push schema to SQLite (creates local.db)
npm run db:seed    # Seed the lessons table
```

### Run

```bash
npm run dev
```

Open `http://localhost:5173`. The onboarding form will appear on first run.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Database
DATABASE_URL=local.db

# OpenRouter — required for freeform quiz scoring and roleplay evaluation
OPENROUTER_API_KEY=

# ElevenLabs — required for voice comprehension mode
ELEVENLABS_API_KEY=
ELEVENLABS_AGENT_ID=
```

The app runs without `ELEVENLABS_*` (falls back to quiz mode) and without `OPENROUTER_API_KEY` (dev canned responses for roleplay; freeform scoring disabled).

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run check` | `svelte-check` full type check |
| `npm run lint` | ESLint + Prettier check |
| `npm run format` | Auto-format with Prettier |
| `npm run test:unit` | Vitest unit tests |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run db:push` | Push Drizzle schema to SQLite |
| `npm run db:seed` | Seed lessons table |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Open Drizzle Studio UI |

---

## Quality Checks

Run before finishing any task:

```bash
npm run check          # Zero TypeScript errors required
npx eslint src/        # no-explicit-any, unused vars, Svelte rules
```

For Svelte components, run the **Svelte MCP `svelte-autofixer`** tool until zero issues. Then run `/simplify` to review for reuse and efficiency.

---

## Conventions

- **IDs**: `ulid()` from `ulidx`. Never `crypto.randomUUID()`.
- **DB timestamps**: `integer('...', { mode: 'timestamp' })`.
- **Single-user**: `hooks.server.ts` sets `locals.userId` from the first DB user. No auth system.
- **API responses**: SvelteKit `json()` helper. Errors via `error()`.
- **Colors**: Only use theme utilities (`bg-primary`, `text-text-muted`, etc.) — never hardcode hex values.
- **Svelte 5**: Runes only. No `$:`, `export let`, or `<slot>`.
- **Unused params**: Prefix with `_` (e.g., `_event`).
- **Theming**: All design tokens live in the `@theme` block in `src/routes/layout.css`.

---

## Adding a Lesson

1. Add the `.svx` transcript to `src/lib/content/lessons/{part}-{slug}/`.
2. Add quiz questions and metadata to `src/lib/content/lesson-data.ts`.
3. Add a row to the seed script in `src/lib/server/db/seed.ts`.
4. Run `npm run db:push && npm run db:seed`.
5. Place the audio file at `static/audio/{part:02d}-{slug}/podcast.mp3`.

The lesson slug must match between `lesson-data.ts` and the `lessons` DB table.
