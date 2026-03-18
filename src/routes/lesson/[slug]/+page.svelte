<script lang="ts">
	import { goto } from '$app/navigation';
	import type { StructuredFeedback } from '$lib/types';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import PodcastPlayer from '$lib/components/PodcastPlayer.svelte';
	import ArticleReader from '$lib/components/ArticleReader.svelte';
	import ComprehensionCheck from '$lib/components/ComprehensionCheck.svelte';
	import LessonComplete from '$lib/components/LessonComplete.svelte';
	import PuzzleReward from '$lib/components/PuzzleReward.svelte';
	import { getLessonContent } from '$lib/content/lesson-data';

	let { data } = $props();

	let content = $derived(getLessonContent(data.lesson.slug));

	function statusToPhase(status: string): 'podcast' | 'comprehension' | 'celebration' | 'reward' {
		if (status === 'comprehension_complete') return 'reward';
		if (status === 'podcast_complete') return 'comprehension';
		return 'podcast';
	}

	let isTest = $derived(data.lesson.slug.includes('test'));
	let contentMode = $state<'podcast' | 'article'>('podcast');
	let phaseOverride = $state<'podcast' | 'comprehension' | 'celebration' | 'reward' | null>(null);
	let serverPhase = $derived(statusToPhase(data.progress?.status ?? 'available'));
	let phase = $derived(phaseOverride ?? serverPhase);

	let quizAccuracy = $state(0);
	let quizCorrect = $state(0);
	let quizTotal = $state(0);
	let quizHearts = $state(3);
	let comprehensionFeedback = $state<StructuredFeedback | undefined>();

	let earnedCount = $derived(
		data.allProgress.filter((p) => p.lesson_progress.puzzleEarned).length + 1
	);

	let nextLessonTitle = $derived(() => {
		const currentPart = data.lesson.partNumber;
		const next = data.allProgress.find((p) => p.lessons.partNumber === currentPart + 1);
		return next?.lessons.title;
	});

	let currentLessonSlug = $derived(data.lesson.slug);
	let lastSlug = $state('');
	$effect(() => {
		if (currentLessonSlug !== lastSlug) {
			lastSlug = currentLessonSlug;
			phaseOverride = null;
		}
	});

	// Tests skip the podcast phase — go straight to comprehension
	$effect(() => {
		if (isTest && phase === 'podcast') {
			onPodcastComplete();
		}
	});

	async function updateProgress(status: string) {
		if (!data.progress) return;
		await fetch('/api/progress', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: data.progress.id, status })
		});
	}

	async function onPodcastComplete() {
		await updateProgress('podcast_complete');
		phaseOverride = 'comprehension';
	}

	async function onComprehensionComplete(score: number, hearts: number, feedback?: StructuredFeedback) {
		const questions = content?.quiz ?? [];
		quizAccuracy = score;
		quizTotal = questions.length;
		quizCorrect = Math.round(score * questions.length);
		quizHearts = hearts;
		comprehensionFeedback = feedback;
		await updateProgress('comprehension_complete');
		phaseOverride = 'celebration';
	}

	async function onCelebrationContinue() {
		phaseOverride = 'reward';
	}

	async function onRewardComplete() {
		await updateProgress('complete');
		await fetch('/api/progress', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: data.progress.id, puzzleEarned: true })
		});
		const currentPartNumber = data.lesson.partNumber;
		const nextProgress = data.allProgress.find(
			(p) => p.lessons.partNumber === currentPartNumber + 1
		);
		if (nextProgress && nextProgress.lesson_progress.status === 'locked') {
			await fetch('/api/progress', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: nextProgress.lesson_progress.id, status: 'available' })
			});
		}
	}
</script>

<svelte:head><title>{data.lesson.title} — FeedbackLoop</title></svelte:head>

<div class="lesson-page">
	<ProgressBar currentPhase={phase === 'celebration' ? 'reward' : phase} lessonTitle={data.lesson.title} />

	{#if phase === 'podcast'}
		{#if isTest}
			<!-- Tests have no podcast phase -->
		{:else}
			<!-- Content mode toggle -->
			<div class="mode-toggle-area">
				<p class="mode-label">How would you like to learn?</p>
				<div class="mode-toggle">
					<button
						type="button"
						class="mode-option"
						class:mode-option-active={contentMode === 'podcast'}
						onclick={() => (contentMode = 'podcast')}
					>
						<svg class="mode-option-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round"
								d="M9 19V13a5 5 0 1 1 6 0v6M9 19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1m8 5a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-1" />
						</svg>
						Podcast
					</button>
					<button
						type="button"
						class="mode-option"
						class:mode-option-active={contentMode === 'article'}
						onclick={() => (contentMode = 'article')}
					>
						<svg class="mode-option-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round"
								d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
						</svg>
						Article
					</button>
				</div>
			</div>

			{#if contentMode === 'podcast'}
				<PodcastPlayer
					src={content?.podcastFile ?? data.lesson.podcastUrl}
					title={data.lesson.title}
					episodeNumber={data.lesson.partNumber}
					subtitles={content?.subtitles}
					lessonSlug={data.lesson.slug}
					onComplete={onPodcastComplete}
				/>
			{:else}
				<ArticleReader
					slug={data.lesson.slug}
					title={data.lesson.title}
					partNumber={data.lesson.partNumber}
					onComplete={onPodcastComplete}
				/>
			{/if}
		{/if}
	{:else if phase === 'comprehension'}
		<ComprehensionCheck
			lessonSlug={data.lesson.slug}
			lessonId={data.lesson.id}
			quiz={content?.quiz ?? []}
			scenarioBriefing={content?.scenarioBriefing}
			hasRoleplay={!!content?.jamieSystemPrompt}
			onComplete={onComprehensionComplete}
		/>
	{:else if phase === 'celebration'}
		<LessonComplete
			lessonTitle={data.lesson.title}
			accuracy={quizAccuracy}
			questionsCorrect={quizCorrect}
			questionsTotal={quizTotal}
			heartsRemaining={quizHearts}
			heartsTotal={3}
			onContinue={onCelebrationContinue}
			nextLessonTitle={nextLessonTitle()}
			feedback={comprehensionFeedback}
		/>
	{:else if phase === 'reward'}
		<PuzzleReward
			{earnedCount}
			coinImage={content?.coinImage}
			nextLessonTitle={nextLessonTitle()}
			onContinue={async () => {
				await onRewardComplete();
				goto('/', { invalidateAll: true });
			}}
		/>
	{/if}
</div>

<style>
	.lesson-page {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.mode-toggle-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.mode-label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.mode-toggle {
		display: flex;
		gap: 0.375rem;
		padding: 0.25rem;
		background: var(--color-surface-raised);
		border-radius: var(--radius-full);
		border: 2px solid var(--color-border);
		border-bottom-width: 3px;
		border-bottom-color: var(--color-border-strong);
	}

	.mode-option {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 1.25rem;
		border-radius: var(--radius-full);
		border: none;
		background: transparent;
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.mode-option-active {
		background: var(--color-surface);
		color: var(--color-primary);
		box-shadow: var(--shadow-sm);
	}

	.mode-option-icon {
		width: 1rem;
		height: 1rem;
	}
</style>
