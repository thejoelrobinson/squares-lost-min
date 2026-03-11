<script lang="ts">
	import Button from '$lib/components/Button.svelte';

	let {
		question,
		items,
		correctOrder,
		onAnswer
	}: {
		question: string;
		items: string[];
		correctOrder: number[];
		onAnswer: (score: number) => void;
	} = $props();

	let defaultOrder = $derived(items.map((_, i) => i));
	let currentOrder = $state<number[]>([]);
	let submitted = $state(false);
	let hasInitialized = false;

	$effect(() => {
		if (!hasInitialized) {
			currentOrder = [...defaultOrder];
			hasInitialized = true;
		}
	});

	function moveUp(index: number) {
		if (index === 0 || submitted) return;
		const newOrder = [...currentOrder];
		[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
		currentOrder = newOrder;
	}

	function moveDown(index: number) {
		if (index === currentOrder.length - 1 || submitted) return;
		const newOrder = [...currentOrder];
		[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
		currentOrder = newOrder;
	}

	function submit() {
		submitted = true;
		const isCorrect = currentOrder.every((val, i) => val === correctOrder[i]);
		onAnswer(isCorrect ? 1 : 0);
	}

	function isCorrectPosition(index: number): boolean | null {
		if (!submitted) return null;
		return currentOrder[index] === correctOrder[index];
	}

	function positionBorderClass(index: number): string {
		const correct = isCorrectPosition(index);
		if (correct === null) return 'border-2 border-transparent';
		return correct ? 'border-2 border-success' : 'border-2 border-error';
	}
</script>

<div class="flex flex-col gap-4">
	<h3 class="text-lg font-semibold text-text">{question}</h3>

	<div class="flex flex-col gap-2">
		{#each currentOrder as itemIndex, i (itemIndex)}
			<div class="flex items-center gap-2 rounded-xl bg-surface-raised p-3 shadow-sm {positionBorderClass(i)}">
				<div class="flex flex-col gap-1">
					<button
						type="button"
						class="rounded px-2 py-0.5 text-sm text-text-muted transition hover:bg-primary-light/20 disabled:opacity-30"
						disabled={i === 0 || submitted}
						onclick={() => moveUp(i)}
						aria-label="Move up"
					>
						&#9650;
					</button>
					<button
						type="button"
						class="rounded px-2 py-0.5 text-sm text-text-muted transition hover:bg-primary-light/20 disabled:opacity-30"
						disabled={i === currentOrder.length - 1 || submitted}
						onclick={() => moveDown(i)}
						aria-label="Move down"
					>
						&#9660;
					</button>
				</div>
				<span class="text-text">{items[itemIndex]}</span>
			</div>
		{/each}
	</div>

	{#if !submitted}
		<Button onclick={submit}>Check Order</Button>
	{:else}
		{@const isCorrect = currentOrder.every((val, i) => val === correctOrder[i])}
		<p class={isCorrect ? 'text-success font-medium' : 'text-error font-medium'}>
			{isCorrect ? 'Correct order!' : 'Not quite. Some items are in the wrong position.'}
		</p>
	{/if}
</div>
