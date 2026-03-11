# FeedbackLoop — MVP Spec
### An interactive learning app for giving effective feedback in 1:1s

---

## Concept

A Duolingo-inspired learning experience that teaches managers and team leads how to give effective feedback in one-on-one meetings. A single course composed of 10 parts: an onboarding step followed by 9 lessons. Each lesson features a short conversational podcast, a Socratic comprehension check (voice or quiz), and a puzzle-piece reward. By the end, the learner assembles a complete image that reinforces the core concept.

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **SvelteKit** | SSR + file-based routing, MDsveX for lesson authoring |
| Adapter | **adapter-node** | Desktop self-hosted MVP via `node build` |
| Database | **SQLite** via better-sqlite3 | Single-file, zero-config, perfect for local-first |
| ORM | **Drizzle** | Type-safe, lightweight, great SQLite support |
| Content | **MDsveX** (.svx files) | Write lessons in Markdown with embedded Svelte components |
| Styling | **Tailwind CSS 4** | Utility-first, CSS custom property theme system |
| Components | **Bits UI** | Unstyled accessible primitives, full Tailwind control |
| Voice - Podcasts | **ElevenLabs TTS / Projects** | Pre-generated two-host conversations, stored as static audio |
| Voice - Comprehension | **ElevenLabs Conversational AI** | Real-time Socratic dialogue with the learner |
| LLM | **OpenRouter** | Model-agnostic LLM gateway — swap models freely for comprehension evaluation and follow-ups |
| Animations | **Lottie** (lottie-web) | Micro-animations for rewards, transitions, celebrations |
| Map Path | **SVG** (hand-authored or generated) | Meandering dotted-line lesson map |

---

## Theme System

All color decisions live in CSS custom properties at `:root`, extended into Tailwind via `theme.extend`. This gives us swappable themes and a single source of truth.

```css
/* /src/app.css */
:root {
  /* Core palette */
  --color-primary: oklch(65% 0.24 275);
  --color-primary-light: oklch(80% 0.16 275);
  --color-secondary: oklch(72% 0.18 155);
  --color-accent: oklch(78% 0.22 65);

  /* Surfaces */
  --color-bg: oklch(98% 0.005 275);
  --color-surface: oklch(100% 0 0);
  --color-surface-raised: oklch(96% 0.01 275);

  /* Text */
  --color-text: oklch(25% 0.02 275);
  --color-text-muted: oklch(55% 0.02 275);

  /* Feedback states */
  --color-success: oklch(68% 0.19 155);
  --color-error: oklch(62% 0.22 25);
  --color-warning: oklch(78% 0.18 80);

  /* Rewards / puzzle */
  --color-reward-glow: oklch(80% 0.22 65);
}
```

```js
// tailwind.config.js (extend section)
colors: {
  primary: {
    DEFAULT: 'var(--color-primary)',
    light: 'var(--color-primary-light)',
  },
  // ... etc
}
```

---

## Course Structure — "The Art of Feedback"

### Part 1: Onboarding — "Getting to Know You"

**Purpose:** Gather learner context to personalize comprehension checks.

**Data collected:**
- Name and role (manager, team lead, IC, etc.)
- Team size
- How often they currently give feedback (daily / weekly / rarely / never)
- Comfort level with giving constructive feedback (1–5 scale)
- Biggest challenge with feedback (freeform or multi-select: "I avoid it," "People get defensive," "I don't know how to be specific," "I worry about the relationship")
- Optional: a real scenario they'd like to work through later

**Interface:** Either voice conversation (ElevenLabs Conversational AI with a friendly host persona) or a step-by-step form with illustrated cards. Both paths produce the same user profile record in SQLite.

**Output:** `user_profile` row with structured data used to tailor Socratic questions in later lessons.

---

### Parts 2–10: Lessons

Each lesson follows the same three-phase structure:

#### Phase 1 — Podcast (~3–4 min)
Two hosts discuss the topic conversationally. Pre-generated via ElevenLabs. Stored as static `.mp3` files. Player UI shows waveform or progress, with optional transcript toggle (transcript stored in the MDsveX file).

#### Phase 2 — Comprehension Check
**Voice mode (primary):** One of the podcast hosts "turns to the learner" and begins a Socratic dialogue. Powered by ElevenLabs Conversational AI + Claude API. The system prompt includes the lesson content, the user's profile from onboarding, and evaluation criteria. The AI probes for genuine understanding, not parroting. When the AI determines comprehension is sufficient, it wraps up naturally ("That's a great way to put it — I think you've really got this"), and a subtle animated "Continue →" prompt appears.

**Quiz mode (fallback):** 3–4 questions per lesson. Mix of multiple choice, drag-to-order, and short freeform response. The voice mode is conceptually filling these in — the same data model backs both paths. Quiz results map to the same `lesson_progress` schema.

#### Phase 3 — Reward
A puzzle piece animates into position (Lottie). Running count: "4 of 9 pieces collected." Brief celebratory moment before the map scrolls to reveal the next node.

---

### Lesson Topics

| Part | Title | Core Concept | Puzzle Piece Position |
|------|-------|-------------|----------------------|
| 2 | "Why Feedback Matters" | Impact of feedback on growth and trust | Top-left corner |
| 3 | "The SBI Framework" | Situation → Behavior → Impact structure | Top-center |
| 4 | "Timing Is Everything" | When to give feedback (immediacy vs. readiness) | Top-right |
| 5 | "Reading the Room" | Emotional awareness and psychological safety | Middle-left |
| 6 | "Being Specific" | Concrete observations vs. vague judgments | Center |
| 7 | "The Hard Conversations" | Delivering constructive feedback with care | Middle-right |
| 8 | "Listening After You Speak" | Active listening and handling reactions | Bottom-left |
| 9 | "Making It Actionable" | Turning feedback into next steps | Bottom-center |
| 10 | "Putting It All Together" | Practice scenario using the full framework | Bottom-right |

**Final puzzle image:** A stylized illustration of two people in a 1:1 meeting — one speaking, one actively listening — with visual elements representing each lesson concept (speech bubbles with structure, a clock for timing, a heart for psychological safety, etc.). The assembled image becomes a reference card the learner can revisit.

---

## Data Model (Drizzle + SQLite)

```
users
├── id (text, primary key, ulid)
├── name (text)
├── role (text)
├── team_size (integer)
├── feedback_frequency (text)
├── comfort_level (integer)
├── challenges (text, JSON array)
├── scenario (text, nullable)
├── created_at (integer, unix timestamp)
└── updated_at (integer, unix timestamp)

lessons
├── id (text, primary key)
├── part_number (integer)
├── title (text)
├── slug (text)
├── podcast_url (text)
├── transcript (text)
└── puzzle_position (text)

lesson_progress
├── id (text, primary key, ulid)
├── user_id (text, foreign key → users)
├── lesson_id (text, foreign key → lessons)
├── status (text: 'locked' | 'available' | 'podcast_complete' | 'comprehension_complete' | 'complete')
├── comprehension_mode (text: 'voice' | 'quiz')
├── comprehension_data (text, JSON — quiz answers or conversation summary)
├── comprehension_score (real, 0–1, nullable)
├── puzzle_earned (integer, boolean)
├── started_at (integer, nullable)
└── completed_at (integer, nullable)

conversations
├── id (text, primary key, ulid)
├── user_id (text, foreign key → users)
├── lesson_id (text, foreign key → lessons)
├── transcript (text, JSON array of turns)
├── ai_assessment (text, JSON — comprehension evaluation)
└── created_at (integer, unix timestamp)
```

---

## Key Routes

```
/                           → Home map (lesson progression)
/onboarding                 → Part 1: Getting to know you
/lesson/[slug]              → Lesson shell (phases auto-progress)
/lesson/[slug]/podcast      → Phase 1: Audio player
/lesson/[slug]/check        → Phase 2: Comprehension (voice or quiz)
/lesson/[slug]/reward       → Phase 3: Puzzle piece animation
/puzzle                     → Full puzzle view (assembled so far)
/api/comprehension/evaluate → POST: Send conversation to Claude for scoring
/api/comprehension/stream   → POST: Stream Claude responses for quiz evaluation
/api/user                   → GET/POST: User profile CRUD
/api/progress               → GET/PATCH: Lesson progress
```

---

## MDsveX Lesson File Structure

Each lesson is authored as a `.svx` file with frontmatter and embedded components:

```
src/content/lessons/
├── 01-onboarding.svx
├── 02-why-feedback-matters.svx
├── 03-sbi-framework.svx
├── ...
└── 10-putting-it-together.svx
```

```mdx
---
part: 3
title: "The SBI Framework"
slug: "sbi-framework"
podcastFile: "/audio/03-sbi-framework.mp3"
puzzlePosition: "top-center"
hosts:
  main: "Jordan"
  guest: "Alex"
comprehension:
  mode: "both"
  voicePrompt: |
    You are Jordan, the podcast host. You just finished explaining the SBI
    framework with your co-host. Now turn to the learner and have a brief
    Socratic conversation to check their understanding. Reference their
    role as a {{user.role}} managing {{user.team_size}} people. Ask them
    to apply SBI to a real situation they've encountered.
  quiz:
    - type: "multiple-choice"
      question: "What does SBI stand for?"
      options: ["Situation, Behavior, Impact", "Summary, Background, Insight", "Specific, Brief, Immediate"]
      correct: 0
    - type: "order"
      question: "Put these in the correct SBI order:"
      items: ["Describe the impact", "State the situation", "Name the behavior"]
      correct: [1, 2, 0]
    - type: "freeform"
      question: "Describe a recent situation where you could have used SBI. Write it out using the framework."
      evaluationHint: "Look for clear separation of situation, behavior, and impact. Should reference a specific event, not a generalization."
---

<PodcastPlayer />

## The SBI Framework

The SBI model gives you a repeatable structure for delivering clear, non-judgmental feedback...

<ComprehensionCheck />

<PuzzleReward piece="top-center" />
```

---

## Home Screen — Lesson Map

Built as an SVG-based scrollable component:

- **Path:** A single `<path>` element with `stroke-dasharray` for the dotted line, meandering vertically up the screen
- **Nodes:** Circles or custom shapes placed along the path at calculated points. States: locked (greyed, no interaction), available (glowing, pulsing Lottie), in-progress (partially filled), complete (filled, checkmark)
- **Scroll:** Native vertical scroll. Lessons flow bottom-to-top (earliest at bottom, like climbing a mountain). Current lesson auto-scrolls into view on load
- **Puzzle preview:** Small thumbnail of the puzzle in a floating card at the top, showing assembled pieces so far
- **Connections:** Each node sits on the SVG path. The path itself is the visual connector

---

## ElevenLabs Integration

### Podcasts (pre-generated)
- Use ElevenLabs **Projects** or **Text-to-Speech API** to generate two-voice conversations
- Pick two distinct voices (e.g., "Jordan" — warm, authoritative; "Sam" — curious, relatable)
- Generate once, export as `.mp3`, store in `static/audio/`
- Transcripts stored in MDsveX frontmatter or a sidecar `.json`

### Comprehension Check (real-time)
- Use ElevenLabs **Conversational AI** agent
- System prompt assembled at runtime: lesson content + user profile + evaluation criteria
- Agent persona matches one of the podcast hosts (Jordan)
- Configure for short exchanges — 3-5 turns max to confirm understanding
- On conversation end, send transcript to LLM via OpenRouter for structured scoring
- Fall back to quiz UI if voice isn't available or user prefers text

---

## LLM Integration (OpenRouter)

All LLM calls go through OpenRouter (`https://openrouter.ai/api/v1/chat/completions`), giving you a unified OpenAI-compatible API with model flexibility. Start with a fast/cheap model for structured evaluation (Gemini Flash, Haiku, etc.) and upgrade per-task if needed — the model is just a config string.

Two roles:

1. **Comprehension evaluation:** After a voice conversation ends, the transcript + lesson objectives are sent to the LLM. It returns a structured JSON assessment: `{ understood: boolean, confidence: 0-1, gaps: string[], summary: string }`. This determines if the learner passes.

2. **Freeform quiz evaluation:** For short-answer quiz questions, the LLM evaluates the response against the `evaluationHint` in the lesson frontmatter. Returns `{ score: 0-1, feedback: string }`.

System prompt template:
```
You are evaluating a learner's understanding of "{{lesson.title}}".
The learner is a {{user.role}} who manages {{user.team_size}} people.
They rated their feedback comfort level at {{user.comfort_level}}/5.

Lesson objectives:
{{lesson.objectives}}

Evaluate the following conversation/response for genuine understanding,
not rote repetition. Be generous but honest. Return JSON only.
```

---

## Puzzle System

- **9 pieces** (one per lesson, parts 2–10), arranged in a 3×3 grid
- **Image:** Pre-made illustration, sliced into 9 segments server-side or at build time
- **Earn:** Each piece awarded on lesson completion, animated into place with Lottie
- **Final step:** After part 10, learner sees all 9 pieces and can drag them into the correct arrangement (a mini-activity). Once assembled correctly, the full image is revealed with a celebration animation
- **Persistence:** Puzzle state tracked in `lesson_progress.puzzle_earned` per lesson

---

## MVP Scope — What's In, What's Out

### In
- Full 10-part lesson flow (onboarding + 9 lessons)
- Pre-generated podcast audio for at least 2 lessons (others can be placeholder)
- Quiz-based comprehension for all lessons
- Voice comprehension for at least 1 lesson (as proof of concept)
- Lesson map home screen with progression
- Puzzle piece collection and final assembly
- SQLite persistence of user profile and progress
- Theme system with CSS custom properties
- MDsveX lesson authoring

### Out (post-MVP)
- Multi-user / auth
- Multiple courses
- Lesson editing CMS
- Analytics dashboard
- Mobile-responsive (desktop-first for MVP)
- Spaced repetition / review system
- Leaderboards or social features

---

## File Structure

```
feedbackloop/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── LessonMap.svelte          # Home screen SVG map
│   │   │   ├── PodcastPlayer.svelte      # Audio player with waveform
│   │   │   ├── ComprehensionCheck.svelte  # Voice or quiz wrapper
│   │   │   ├── QuizQuestion.svelte        # Individual quiz question
│   │   │   ├── VoiceChat.svelte           # ElevenLabs conversational UI
│   │   │   ├── PuzzleReward.svelte        # Piece animation on earn
│   │   │   ├── PuzzleBoard.svelte         # Full puzzle assembly view
│   │   │   ├── OnboardingForm.svelte      # Part 1 step-by-step form
│   │   │   └── ProgressBar.svelte         # Lesson phase indicator
│   │   ├── server/
│   │   │   ├── db.ts                      # Drizzle + better-sqlite3 setup
│   │   │   ├── schema.ts                  # Drizzle schema definitions
│   │   │   ├── llm.ts                     # OpenRouter API client
│   │   │   └── elevenlabs.ts              # ElevenLabs API helpers
│   │   ├── stores/
│   │   │   ├── user.ts                    # User profile store
│   │   │   ├── progress.ts                # Lesson progress store
│   │   │   └── puzzle.ts                  # Puzzle state store
│   │   ├── content/
│   │   │   └── lessons/                   # MDsveX lesson files
│   │   │       ├── 01-onboarding.svx
│   │   │       ├── 02-why-feedback-matters.svx
│   │   │       └── ...
│   │   └── theme/
│   │       └── tokens.css                 # CSS custom properties
│   ├── routes/
│   │   ├── +page.svelte                   # Home / lesson map
│   │   ├── +layout.svelte                 # App shell
│   │   ├── onboarding/
│   │   │   └── +page.svelte
│   │   ├── lesson/
│   │   │   └── [slug]/
│   │   │       ├── +page.svelte           # Lesson shell
│   │   │       ├── +page.server.ts        # Load lesson data
│   │   │       └── +server.ts             # Lesson API endpoints
│   │   ├── puzzle/
│   │   │   └── +page.svelte               # Full puzzle view
│   │   └── api/
│   │       ├── comprehension/
│   │       │   └── evaluate/+server.ts
│   │       ├── user/+server.ts
│   │       └── progress/+server.ts
│   └── app.css                            # Tailwind + theme imports
├── static/
│   ├── audio/                             # Pre-generated podcast MP3s
│   ├── puzzle/                            # Puzzle piece images
│   └── lottie/                            # Animation JSON files
├── drizzle/                               # Migration files
├── svelte.config.js
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## Next Steps

1. **Scaffold the SvelteKit project** with MDsveX, Tailwind, Drizzle, Bits UI
2. **Build the theme system** and base layout
3. **Implement the lesson map** home screen (SVG path + nodes)
4. **Build the onboarding flow** (Part 1)
5. **Create one complete lesson** end-to-end (podcast → quiz → puzzle piece)
6. **Integrate ElevenLabs Conversational AI** for voice comprehension on that lesson
7. **Wire up Claude API** for comprehension evaluation
8. **Build the puzzle board** and reward animations
9. **Author remaining lesson content** in MDsveX
10. **Polish and playtest**
