<script lang="ts">
	import LessonMap from '$lib/components/LessonMap.svelte';
	import SparkCoin from '$lib/components/SparkCoin.svelte';
	import Button from '$lib/components/Button.svelte';
	import { lessonContent } from '$lib/content/lesson-data';

	let { data } = $props();

	let lessonObjectives = $derived.by(() => {
		const map: Record<string, string[]> = {};
		for (const [slug, content] of Object.entries(lessonContent)) {
			map[slug] = content.objectives;
		}
		return map;
	});

	let progressFlat = $derived(
		data.progress.map((row) => ({
			lessonId: row.lesson_progress.lessonId,
			status: row.lesson_progress.status,
			puzzleEarned: row.lesson_progress.puzzleEarned ? 1 : 0
		}))
	);

	// Stats
	let completedCount = $derived(
		progressFlat.filter((p) => p.status === 'complete').length
	);

	let sparkPoints = $derived(
		progressFlat.filter((p) => p.puzzleEarned === 1).length
	);

	// Find the current in-progress lesson for Continue CTA
	let currentLesson = $derived.by(() => {
		const inProgressStates = ['available', 'podcast_complete', 'comprehension_complete'];
		const progressEntry = data.progress.find((p) =>
			inProgressStates.includes(p.lesson_progress.status)
		);
		if (!progressEntry) return null;
		const lesson = data.lessons.find((l) => l.id === progressEntry.lesson_progress.lessonId);
		return lesson ?? null;
	});

	let currentLessonHref = $derived.by(() => {
		if (!currentLesson) return null;
		if (currentLesson.partNumber === 1) return '/onboarding';
		return `/lesson/${currentLesson.slug}`;
	});

	// Time-aware greeting
	let greeting = $derived.by(() => {
		const hour = new Date().getHours();
		const name = data.user?.name ?? 'there';
		if (hour < 12) return `Good morning, ${name}`;
		if (hour < 17) return `Good afternoon, ${name}`;
		return `Good evening, ${name}`;
	});

	let streak = $derived(('streak' in data ? data.streak : 0) as number);
</script>

<svelte:head><title>FeedbackLoop</title></svelte:head>

<div class="page-root">
	<!-- Hero -->
	<div class="hero-content">
		<h1 class="hero-greeting">{greeting}</h1>
		<p class="hero-sub">
			{#if completedCount === 0}
				Ready to start your feedback journey?
			{:else if completedCount >= data.lessons.length}
				You've completed all lessons!
			{:else}
				{completedCount} of {data.lessons.length} lessons complete
			{/if}
		</p>

		<!-- Stats row -->
		<div class="stats-row">
			<div class="stat-pill">
				<span class="stat-icon stat-icon-lessons">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
					</svg>
				</span>
				<span class="stat-num">{completedCount}</span>
				<span class="stat-unit">lessons</span>
			</div>

			<div class="stat-pill stat-pill-sparks">
				<SparkCoin size={18} />
				<span class="stat-num">{sparkPoints}</span>
				<span class="stat-unit">sparks</span>
			</div>

			{#if streak > 0}
				<div class="stat-pill stat-pill-streak">
					<span class="stat-flame">🔥</span>
					<span class="stat-num">{streak}</span>
					<span class="stat-unit">day{streak === 1 ? '' : 's'}</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Lesson Map -->
	<div class="map-section">
		<LessonMap lessons={data.lessons} progress={progressFlat} {lessonObjectives} />

		<!-- Floating Continue CTA -->
		{#if currentLesson && currentLessonHref}
			<div class="cta-dock">
				<Button href={currentLessonHref} size="lg" variant="cta">
					<span class="cta-inner">
						Continue: {currentLesson.title}
						<svg class="cta-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</span>
				</Button>
			</div>
		{/if}
	</div>
</div>

<style>
	.page-root {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* ── Hero ── */
	.hero-content {
		position: sticky;
		top: 3.5rem; /* below the top nav */
		z-index: 10;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem 1.25rem 1.25rem;
		margin: -1.75rem -1.25rem 0; /* bleed to edges of .app-main */
		background: oklch(97.8% 0.003 280 / 0.85);
		backdrop-filter: blur(16px) saturate(1.4);
		-webkit-backdrop-filter: blur(16px) saturate(1.4);
		border-bottom: 1px solid oklch(0% 0 0 / 0.05);
	}

	.hero-greeting {
		font-size: var(--font-size-2xl);
		font-weight: 800;
		color: var(--color-text);
		letter-spacing: -0.03em;
	}

	.hero-sub {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		font-weight: 500;
	}

	/* ── Stats row ── */
	.stats-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	.stat-pill {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.4375rem 0.875rem;
		border-radius: var(--radius-full);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		font-size: 0.8125rem;
		box-shadow: 0 1px 3px oklch(16% 0.02 280 / 0.04);
	}

	.stat-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.125rem;
		height: 1.125rem;
	}

	.stat-icon-lessons {
		color: var(--color-primary);
	}

	.stat-num {
		font-family: 'Bricolage Grotesque', system-ui, sans-serif;
		font-weight: 800;
		color: var(--color-text);
		letter-spacing: -0.02em;
	}

	.stat-unit {
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.stat-pill-sparks .stat-num {
		color: var(--color-accent-dark);
	}

	.stat-pill-streak .stat-num {
		color: var(--color-accent-dark);
	}

	.stat-flame {
		font-size: 0.875rem;
		line-height: 1;
		animation: flame-pulse 2s ease-in-out infinite;
	}

	@keyframes flame-pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.15); }
	}

	/* ── Map Section ── */
	.map-section {
		position: relative;
	}

	.cta-dock {
		position: sticky;
		bottom: 1rem;
		z-index: 20;
		display: flex;
		justify-content: center;
		padding-top: 1rem;
	}

	.cta-inner {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.cta-arrow {
		width: 1.125rem;
		height: 1.125rem;
		transition: transform 0.2s var(--ease-smooth);
	}

	.cta-dock:hover .cta-arrow {
		transform: translateX(2px);
	}
</style>
