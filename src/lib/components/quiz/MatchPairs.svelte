<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import Button from '$lib/components/Button.svelte';

	let {
		question,
		leftItems,
		rightItems,
		correctPairs,
		onAnswer
	}: {
		question: string;
		leftItems: string[];
		rightItems: string[];
		correctPairs: number[];
		onAnswer: (score: number) => void;
	} = $props();

	let pairs = new SvelteMap<number, number>();
	let submitted = $state(false);
	let draggedLeftIndex = $state<number | null>(null);
	let dragOverRightIndex = $state<number | null>(null);

	let allPaired = $derived(leftItems.every((_, i) => pairs.has(i)));

	function handleDragStart(e: DragEvent, leftIndex: number) {
		if (submitted) return;
		draggedLeftIndex = leftIndex;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'link';
			e.dataTransfer.setData('text/plain', String(leftIndex));
		}
	}

	function handleDragEnd() {
		draggedLeftIndex = null;
		dragOverRightIndex = null;
	}

	function handleDragOverDropZone(e: DragEvent) {
		if (submitted) return;
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'link';
		}
	}

	function handleDragEnterDropZone(rightIndex: number) {
		if (submitted) return;
		dragOverRightIndex = rightIndex;
	}

	function handleDragLeaveDropZone(rightIndex: number) {
		if (dragOverRightIndex === rightIndex) {
			dragOverRightIndex = null;
		}
	}

	function handleDropOnZone(e: DragEvent, rightIndex: number) {
		e.preventDefault();
		if (submitted || draggedLeftIndex === null) return;

		// Remove if this right item was already paired
		for (const [left, right] of pairs) {
			if (right === rightIndex) {
				pairs.delete(left);
			}
		}
		// Remove if this left item was already paired
		pairs.delete(draggedLeftIndex);
		// Add new pair
		pairs.set(draggedLeftIndex, rightIndex);
		dragOverRightIndex = null;
	}

	function removePairForRight(rightIndex: number) {
		if (submitted) return;
		for (const [left, right] of pairs) {
			if (right === rightIndex) {
				pairs.delete(left);
			}
		}
	}

	function submit() {
		if (!allPaired) return;
		submitted = true;
		const correctCount = Array.from(pairs.entries()).filter(
			([left, right]) => correctPairs[left] === right
		).length;
		onAnswer(correctCount / leftItems.length);
	}

	const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

	function leftItemStyle(index: number): string {
		if (submitted) {
			const rightIndex = pairs.get(index);
			return rightIndex === correctPairs[index]
				? 'border-2 border-success bg-success/5'
				: 'border-2 border-error bg-error/5';
		}
		if (draggedLeftIndex === index) {
			return 'border-2 border-primary bg-primary/10 opacity-75';
		}
		if (pairs.has(index)) {
			return 'border-2 border-primary/50 bg-primary/5';
		}
		return 'border-2 border-text-muted/40';
	}

	function getDropZoneStyle(rightIndex: number): string {
		const pairedLeftIndex = Array.from(pairs.entries()).find(([_, r]) => r === rightIndex)?.[0];

		if (submitted) {
			return correctPairs.includes(rightIndex) && pairedLeftIndex !== undefined && correctPairs[pairedLeftIndex] === rightIndex
				? 'border-2 border-dashed border-success bg-success/5'
				: 'border-2 border-dashed border-error bg-error/5';
		}

		if (dragOverRightIndex === rightIndex && draggedLeftIndex !== null) {
			return 'border-2 border-dashed border-primary bg-primary/10';
		}

		if (pairedLeftIndex !== undefined) {
			return 'border-2 border-dashed border-primary bg-primary/5';
		}

		return 'border-2 border-dashed border-text-muted/40 bg-surface';
	}

	function getPairedLeftIndex(rightIndex: number): number | null {
		for (const [leftIdx, rightIdx] of pairs) {
			if (rightIdx === rightIndex) {
				return leftIdx;
			}
		}
		return null;
	}

	function rightItemStyle(index: number): string {
		if (submitted) {
			const pairedLeftIndex = Array.from(pairs.entries()).find(([_, r]) => r === index)?.[0];
			return correctPairs.includes(index) && pairedLeftIndex !== undefined && correctPairs[pairedLeftIndex] === index
				? 'border-2 border-success bg-success/5'
				: 'border-2 border-error bg-error/5';
		}
		return 'border-2 border-text-muted/40';
	}
</script>

<div class="flex flex-col gap-4">
	<h3 class="text-lg font-semibold text-text">{question}</h3>

	<div class="space-y-2">
		<!-- Left items (draggable) -->
		<div class="bg-surface-raised/50 rounded-lg p-4">
			<p class="text-xs font-medium text-text-muted uppercase mb-3">Drag from here</p>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-2">
				{#each leftItems as item, i (i)}
					{#if !pairs.has(i)}
						<button
							type="button"
							draggable={!submitted}
							class="w-full rounded-lg bg-surface-raised p-3 text-left shadow-sm transition cursor-grab active:cursor-grabbing {leftItemStyle(i)}"
							ondragstart={(e) => handleDragStart(e, i)}
							ondragend={handleDragEnd}
							disabled={submitted}
						>
							<div class="flex items-center gap-2">
								<span class="shrink-0 text-sm font-bold text-primary">{i + 1}</span>
								<span class="text-sm text-text">{item}</span>
							</div>
						</button>
					{/if}
				{/each}
			</div>
		</div>

		<!-- Right items with drop zones -->
		<div class="space-y-2">
			{#each rightItems as item, i (i)}
				<div class="flex gap-3 items-stretch relative">
					<!-- Drop zone -->
					{#if getPairedLeftIndex(i) !== null}
						{@const pairedLeftIdx = getPairedLeftIndex(i)}
						{#if pairedLeftIdx !== null}
							<div
								role="region"
								aria-label="Drop zone for {item}"
								class="flex-1 rounded-lg transition flex flex-col items-center justify-center min-h-16 cursor-default {getDropZoneStyle(i)}"
								ondragover={handleDragOverDropZone}
								ondragenter={() => handleDragEnterDropZone(i)}
								ondragleave={() => handleDragLeaveDropZone(i)}
								ondrop={(e) => handleDropOnZone(e, i)}
							>
								<div class="flex items-center gap-2">
									<span class="text-sm font-bold text-primary">{pairedLeftIdx + 1}</span>
									<span class="text-sm text-text">{leftItems[pairedLeftIdx]}</span>
								</div>
							</div>
						{/if}
						{#if !submitted}
							<button
								type="button"
								class="absolute -right-2 -top-2 text-xs px-1 py-0.5 rounded bg-error/20 text-error hover:bg-error/30 transition"
								onclick={() => removePairForRight(i)}
								aria-label="Remove pairing"
							>
								✕
							</button>
						{/if}
					{:else}
						<div
							role="region"
							aria-label="Drop zone for {item}"
							class="flex-1 rounded-lg transition flex flex-col items-center justify-center min-h-16 cursor-default {getDropZoneStyle(i)}"
							ondragover={handleDragOverDropZone}
							ondragenter={() => handleDragEnterDropZone(i)}
							ondragleave={() => handleDragLeaveDropZone(i)}
							ondrop={(e) => handleDropOnZone(e, i)}
						>
							<span class="text-text-muted/60">Drop here</span>
						</div>
					{/if}

					<!-- Right item text -->
					<button
						type="button"
						class="flex-1 rounded-lg p-4 text-left transition {rightItemStyle(i)}"
						disabled={submitted}
					>
						<div class="flex items-start gap-2 h-full">
							<span class="shrink-0 text-sm font-bold text-primary">{labels[i]}</span>
							<span class="text-sm text-text leading-relaxed">{item}</span>
						</div>
					</button>
				</div>
			{/each}
		</div>
	</div>

	{#if !submitted}
		<p class="text-sm text-text-muted text-center">
			{#if draggedLeftIndex !== null}
				Drop into the box next to an answer
			{:else if Array.from(pairs.entries()).length === 0}
				Drag items from the left to match them with items on the right
			{:else}
				Continue pairing, or check your answers
			{/if}
		</p>
	{/if}

	{#if !submitted}
		<Button onclick={submit} disabled={!allPaired}>Check Pairs</Button>
	{:else}
		{@const allCorrect = Array.from(pairs.entries()).every(([left, right]) => correctPairs[left] === right)}
		<p class={allCorrect ? 'text-success font-medium' : 'text-error font-medium'}>
			{allCorrect
				? 'All pairs matched correctly!'
				: 'Some pairs are incorrect. Check the highlighted items.'}
		</p>
	{/if}
</div>
