<script lang="ts">
	import Button from '$lib/components/Button.svelte';

	let {
		question,
		wordBank,
		blanks,
		onAnswer
	}: {
		question: string;
		wordBank: string[];
		blanks: string[];
		onAnswer: (score: number) => void;
	} = $props();

	// Component is keyed by currentIndex, so props don't change after mount
	let answers = $state<(string | null)[]>(Array(blanks.length).fill(null));
	let submitted = $state(false);
	let draggedWord = $state<string | null>(null);
	let dragOverBlankIndex = $state<number | null>(null);

	function selectWord(blankIndex: number, word: string) {
		if (submitted) return;
		const newAnswers = [...answers];
		newAnswers[blankIndex] = word;
		answers = newAnswers;
	}

	function clearBlank(blankIndex: number) {
		if (submitted) return;
		const newAnswers = [...answers];
		newAnswers[blankIndex] = null;
		answers = newAnswers;
	}

	function handleDragStart(e: DragEvent, word: string) {
		if (submitted) return;
		draggedWord = word;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'link';
			e.dataTransfer.setData('text/plain', word);
		}
	}

	function handleDragEnd() {
		draggedWord = null;
		dragOverBlankIndex = null;
	}

	function handleDragOver(e: DragEvent) {
		if (submitted) return;
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'link';
		}
	}

	function handleDragEnter(blankIndex: number) {
		if (submitted) return;
		dragOverBlankIndex = blankIndex;
	}

	function handleDragLeave(blankIndex: number) {
		if (dragOverBlankIndex === blankIndex) {
			dragOverBlankIndex = null;
		}
	}

	function handleDrop(e: DragEvent, blankIndex: number) {
		e.preventDefault();
		if (submitted || draggedWord === null) return;
		selectWord(blankIndex, draggedWord);
		dragOverBlankIndex = null;
	}

	let allFilled = $derived(answers.every((a) => a !== null));

	function submit() {
		if (!allFilled) return;
		submitted = true;
		const correctCount = answers.filter((a, i) => a === blanks[i]).length;
		onAnswer(correctCount / blanks.length);
	}

	let activeBlank = $state<number | null>(0);

	// Parse the question into segments with blanks
	let segments = $derived.by(() => {
		const parts: { text: string; blankIndex?: number }[] = [];
		const regex = /(\d+)\.\s*_____/g;
		let lastIndex = 0;
		let match: RegExpExecArray | null;

		while ((match = regex.exec(question)) !== null) {
			if (match.index > lastIndex) {
				parts.push({ text: question.slice(lastIndex, match.index) });
			}
			const blankNum = parseInt(match[1]) - 1;
			parts.push({ text: '', blankIndex: blankNum });
			lastIndex = match.index + match[0].length;
		}
		if (lastIndex < question.length) {
			parts.push({ text: question.slice(lastIndex) });
		}
		return parts;
	});

	function blankBorderClass(index: number): string {
		if (submitted) {
			return answers[index] === blanks[index]
				? 'border-success bg-success/10 text-success'
				: 'border-error bg-error/10 text-error';
		}
		if (dragOverBlankIndex === index) return 'border-primary bg-primary/10';
		if (activeBlank === index) return 'border-primary bg-primary/10';
		if (answers[index]) return 'border-primary/50 bg-surface-raised';
		return 'border-text-muted/40 bg-surface';
	}
</script>

<div class="flex flex-col gap-4">
	<div class="text-lg font-semibold leading-relaxed text-text">
		{#each segments as seg (seg.blankIndex ?? seg.text)}
			{#if seg.blankIndex !== undefined}
				{@const idx = seg.blankIndex}
				<button
					type="button"
					draggable="false"
					class="mx-1 inline-flex min-w-24 items-center justify-center rounded-lg border-2 border-dashed px-3 py-1 text-base transition
						{blankBorderClass(idx)}"
					disabled={submitted}
					ondragover={handleDragOver}
					ondragenter={() => handleDragEnter(idx)}
					ondragleave={() => handleDragLeave(idx)}
					ondrop={(e) => handleDrop(e, idx)}
					onclick={() => {
						if (answers[idx]) {
							clearBlank(idx);
						} else {
							activeBlank = idx;
						}
					}}
				>
					{answers[idx] ?? '___'}
				</button>
			{:else}
				{seg.text}
			{/if}
		{/each}
	</div>

	{#if !submitted}
		<p class="text-xs font-medium text-text-muted">
			{#if draggedWord}
				Drag "{draggedWord}" to a blank
			{:else if activeBlank !== null}
				Tap a word to fill blank {(activeBlank ?? 0) + 1}, or drag a word to a blank
			{:else}
				Drag a word to a blank, or tap a blank to select it
			{/if}
		</p>
		<div class="flex flex-wrap gap-2">
			{#each wordBank as word (word)}
				{@const isUsed = answers.includes(word)}
				<button
					type="button"
					draggable={!isUsed && !submitted}
					class="rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition
						{isUsed
						? 'cursor-default bg-surface opacity-40'
						: draggedWord === word
							? 'cursor-grabbing bg-primary/20 text-primary'
							: 'cursor-grab bg-surface-raised text-text hover:bg-primary/10 hover:shadow-md'}"
					disabled={isUsed || (activeBlank === null && !draggedWord)}
					ondragstart={(e) => handleDragStart(e, word)}
					ondragend={handleDragEnd}
					onclick={() => {
						if (activeBlank !== null && !isUsed) {
							selectWord(activeBlank, word);
							// Auto-advance to next empty blank
							const nextEmpty = answers.findIndex((a, i) => a === null && i !== activeBlank);
							activeBlank = nextEmpty >= 0 ? nextEmpty : null;
						}
					}}
				>
					{word}
				</button>
			{/each}
		</div>
	{/if}

	{#if !submitted}
		<Button onclick={submit} disabled={!allFilled}>Check Answer</Button>
	{:else}
		{@const allCorrect = answers.every((a, i) => a === blanks[i])}
		<p class={allCorrect ? 'text-success font-medium' : 'text-error font-medium'}>
			{allCorrect ? 'All blanks correct!' : `The correct answers are: ${blanks.join(', ')}`}
		</p>
	{/if}
</div>
