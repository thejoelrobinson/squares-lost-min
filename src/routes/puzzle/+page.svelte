<script lang="ts">
	import PuzzleBoard from '$lib/components/PuzzleBoard.svelte';
	import Button from '$lib/components/Button.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Your Puzzle — FeedbackLoop</title></svelte:head>

<div class="flex flex-col items-center gap-6">
	<div class="text-center">
		<h1 class="text-2xl font-bold text-text">Your Feedback Puzzle</h1>
		<p class="text-text-muted mt-1">{data.earnedCount} of 9 pieces collected</p>
	</div>

	<PuzzleBoard pieces={data.pieces} />

	<Button href="/" variant="secondary">← Back to Lessons</Button>
</div>
