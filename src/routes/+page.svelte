<script lang="ts">
	import LessonMap from '$lib/components/LessonMap.svelte';

	let { data } = $props();

	let progressFlat = $derived(
		data.progress.map((row) => ({
			lessonId: row.lesson_progress.lessonId,
			status: row.lesson_progress.status,
			puzzleEarned: row.lesson_progress.puzzleEarned ? 1 : 0
		}))
	);
</script>

<svelte:head><title>FeedbackLoop</title></svelte:head>

<LessonMap lessons={data.lessons} progress={progressFlat} />
