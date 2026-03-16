<script lang="ts">
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

	let contentMode = $state<'podcast' | 'article'>('podcast');
	let phaseOverride = $state<'podcast' | 'comprehension' | 'celebration' | 'reward' | null>(null);
	let serverPhase = $derived(statusToPhase(data.progress?.status ?? 'available'));
	let phase = $derived(phaseOverride ?? serverPhase);

	// Quiz stats tracked for the celebration screen
	let quizAccuracy = $state(0);
	let quizCorrect = $state(0);
	let quizTotal = $state(0);
	let quizHearts = $state(3);

	// Count Spark Points already earned, plus the one being earned now
	let earnedCount = $derived(
		data.allProgress.filter((p) => p.lesson_progress.puzzleEarned).length + 1
	);

	// Reset local override when navigating to a different lesson
	let currentLessonSlug = $derived(data.lesson.slug);
	let lastSlug = $state('');
	$effect(() => {
		if (currentLessonSlug !== lastSlug) {
			lastSlug = currentLessonSlug;
			phaseOverride = null;
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

	async function onComprehensionComplete(score: number, hearts: number) {
		// Store stats for the celebration screen
		const questions = content?.quiz ?? [];
		quizAccuracy = score;
		quizTotal = questions.length;
		quizCorrect = Math.round(score * questions.length);
		quizHearts = hearts;

		await updateProgress('comprehension_complete');
		phaseOverride = 'celebration';
	}

	async function onCelebrationContinue() {
		phaseOverride = 'reward';
	}

	async function onRewardComplete() {
		// Mark current lesson as complete
		await updateProgress('complete');

		// Mark Spark Point as earned
		await fetch('/api/progress', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: data.progress.id, puzzleEarned: true })
		});

		// Unlock the next lesson: find the next lesson's progress entry by part number
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

<div class="flex flex-col gap-6">
	<ProgressBar currentPhase={phase === 'celebration' ? 'reward' : phase} lessonTitle={data.lesson.title} />

	{#if phase === 'podcast'}
		<div class="flex flex-col items-center gap-3">
			<p class="text-sm font-medium text-text-muted">How would you like to learn?</p>
			<div class="flex gap-2">
				<button
					type="button"
					class="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition {contentMode === 'podcast'
						? 'bg-primary text-white shadow-sm'
						: 'bg-surface-raised text-text-muted hover:text-text'}"
					onclick={() => (contentMode = 'podcast')}
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round"
							d="M9 19V13a5 5 0 1 1 6 0v6M9 19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1m8 5a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-1" />
					</svg>
					Podcast
				</button>
				<button
					type="button"
					class="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition {contentMode === 'article'
						? 'bg-primary text-white shadow-sm'
						: 'bg-surface-raised text-text-muted hover:text-text'}"
					onclick={() => (contentMode = 'article')}
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
	{:else if phase === 'comprehension'}
		<ComprehensionCheck
			lessonSlug={data.lesson.slug}
			lessonId={data.lesson.id}
			quiz={content?.quiz ?? []}
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
		/>
	{:else if phase === 'reward'}
		<PuzzleReward
			{earnedCount}
			coinImage={content?.coinImage}
			onContinue={async () => {
				await onRewardComplete();
				window.location.href = '/';
			}}
		/>
	{/if}
</div>
