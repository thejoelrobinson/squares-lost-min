<script lang="ts">
	import LessonMap from '$lib/components/LessonMap.svelte';
	import Card from '$lib/components/Card.svelte';
	import SparkCoin from '$lib/components/SparkCoin.svelte';
	import Button from '$lib/components/Button.svelte';

	let { data } = $props();

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
</script>

<svelte:head><title>FeedbackLoop</title></svelte:head>

<div class="flex flex-col gap-6">
	<!-- Greeting header -->
	<div>
		<h1 class="text-2xl font-bold text-text">{greeting} 👋</h1>
		<p class="mt-1 text-sm text-text-muted">
			{#if completedCount === 0}
				Ready to start your feedback journey?
			{:else if completedCount >= data.lessons.length}
				You've completed all lessons!
			{:else}
				You've completed {completedCount} of {data.lessons.length} lessons
			{/if}
		</p>
	</div>

	<!-- Stats strip -->
	<div class="grid grid-cols-3 gap-3">
		<Card padding="sm">
			<div class="flex flex-col items-center gap-1">
				<span class="text-xl font-bold text-primary">{completedCount}</span>
				<span class="text-xs text-text-muted">Lessons</span>
			</div>
		</Card>
		<Card padding="sm">
			<div class="flex flex-col items-center gap-1">
				<div class="flex items-center gap-1">
					<SparkCoin size={18} />
					<span class="text-xl font-bold text-accent">{sparkPoints}</span>
				</div>
				<span class="text-xs text-text-muted">Sparks</span>
			</div>
		</Card>
		<Card padding="sm">
			<div class="flex flex-col items-center gap-1">
				<span class="text-xl font-bold text-warning">🔥 {'streak' in data ? data.streak : 0}</span>
				<span class="text-xs text-text-muted">Streak</span>
			</div>
		</Card>
	</div>

	<!-- Lesson Map -->
	<div class="relative">
		<LessonMap lessons={data.lessons} progress={progressFlat} />

		<!-- Floating Continue CTA -->
		{#if currentLesson && currentLessonHref}
			<div class="sticky bottom-4 z-20 flex justify-center pt-4">
				<Button href={currentLessonHref} size="lg">
					<span class="flex items-center gap-2">
						Continue: {currentLesson.title}
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</span>
				</Button>
			</div>
		{/if}
	</div>
</div>
