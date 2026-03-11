<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import PodcastPlayer from '$lib/components/PodcastPlayer.svelte';
	import ComprehensionCheck from '$lib/components/ComprehensionCheck.svelte';
	import PuzzleReward from '$lib/components/PuzzleReward.svelte';
	import { getLessonContent } from '$lib/content/lesson-data';

	let { data } = $props();

	let content = $derived(getLessonContent(data.lesson.slug));

	function statusToPhase(status: string): 'podcast' | 'comprehension' | 'reward' {
		if (status === 'comprehension_complete') return 'reward';
		if (status === 'podcast_complete') return 'comprehension';
		return 'podcast';
	}

	let phaseOverride = $state<'podcast' | 'comprehension' | 'reward' | null>(null);
	let serverPhase = $derived(statusToPhase(data.progress?.status ?? 'available'));
	let phase = $derived(phaseOverride ?? serverPhase);

	// Count puzzle pieces already earned, plus the one being earned now
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

	async function onComprehensionComplete(_score?: number) {
		await updateProgress('comprehension_complete');
		phaseOverride = 'reward';
	}

	async function onRewardComplete() {
		// Mark current lesson as complete
		await updateProgress('complete');

		// Mark puzzle piece as earned
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
	<ProgressBar currentPhase={phase} lessonTitle={data.lesson.title} />

	{#if phase === 'podcast'}
		<PodcastPlayer
			src={content?.podcastFile ?? data.lesson.podcastUrl}
			title={data.lesson.title}
			onComplete={onPodcastComplete}
		/>
	{:else if phase === 'comprehension'}
		<ComprehensionCheck
			lessonSlug={data.lesson.slug}
			lessonId={data.lesson.id}
			quiz={content?.quiz ?? []}
			onComplete={onComprehensionComplete}
		/>
	{:else if phase === 'reward'}
		<PuzzleReward
			position={data.lesson.puzzlePosition ?? 'center'}
			{earnedCount}
			onContinue={async () => {
				await onRewardComplete();
				window.location.href = '/';
			}}
		/>
	{/if}
</div>
