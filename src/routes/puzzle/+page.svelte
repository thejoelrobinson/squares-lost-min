<script lang="ts">
	import PuzzleBoard from '$lib/components/PuzzleBoard.svelte';
	import SparkCoin from '$lib/components/SparkCoin.svelte';
	import Button from '$lib/components/Button.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Spark Points — FeedbackLoop</title></svelte:head>

<div class="flex flex-col items-center gap-6">
	<div class="flex flex-col items-center gap-2 text-center">
		<SparkCoin size={48} />
		<h1 class="text-2xl font-bold text-text">Your Spark Points</h1>
		<p class="text-text-muted mt-1">{data.earnedCount} of 7 Spark Points collected</p>
	</div>

	<PuzzleBoard pieces={data.pieces} />

	<Button href="/" variant="secondary">Back to Lessons</Button>
</div>
