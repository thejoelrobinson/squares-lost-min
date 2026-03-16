<script lang="ts">
	import PuzzleBoard from '$lib/components/PuzzleBoard.svelte';
	import SparkCoin from '$lib/components/SparkCoin.svelte';
	import Button from '$lib/components/Button.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Spark Points — FeedbackLoop</title></svelte:head>

<div class="puzzle-page">
	<div class="puzzle-header">
		<SparkCoin size={48} />
		<h1 class="puzzle-title">Your Spark Points</h1>
		<p class="puzzle-subtitle">{data.earnedCount} of 7 collected</p>
	</div>

	<PuzzleBoard pieces={data.pieces} />

	<div class="puzzle-footer">
		<Button href="/" variant="secondary">Back to Lessons</Button>
	</div>
</div>

<style>
	.puzzle-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.puzzle-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		text-align: center;
	}

	.puzzle-title {
		font-size: 1.75rem;
		font-weight: 800;
		color: var(--color-text);
	}

	.puzzle-subtitle {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-muted);
	}

	.puzzle-footer {
		margin-top: 0.5rem;
	}
</style>
