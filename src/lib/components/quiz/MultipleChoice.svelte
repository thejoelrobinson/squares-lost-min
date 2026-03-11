<script lang="ts">
	import Button from '$lib/components/Button.svelte';

	let {
		question,
		options,
		correctIndex,
		onAnswer
	}: {
		question: string;
		options: string[];
		correctIndex: number;
		onAnswer: (score: number) => void;
	} = $props();

	let selected = $state<number | null>(null);
	let submitted = $state(false);

	function submit() {
		if (selected === null) return;
		submitted = true;
		onAnswer(selected === correctIndex ? 1 : 0);
	}

	function borderClass(index: number): string {
		if (!submitted) {
			return index === selected ? 'border-2 border-primary' : 'border-2 border-transparent';
		}
		if (index === correctIndex) return 'border-2 border-success';
		if (index === selected) return 'border-2 border-error';
		return 'border-2 border-transparent';
	}
</script>

<div class="flex flex-col gap-4">
	<h3 class="text-lg font-semibold text-text">{question}</h3>

	<div class="flex flex-col gap-3">
		{#each options as option, i (i)}
			<button
				type="button"
				class="w-full cursor-pointer rounded-xl bg-surface-raised p-4 text-left shadow-sm transition {borderClass(i)}"
				disabled={submitted}
				onclick={() => {
					if (!submitted) selected = i;
				}}
			>
				<div class="flex items-center gap-3">
					<div
						class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 {selected === i ? 'border-primary bg-primary' : 'border-text-muted'}"
					>
						{#if selected === i}
							<div class="h-2 w-2 rounded-full bg-white"></div>
						{/if}
					</div>
					<span class="text-text">{option}</span>
				</div>
			</button>
		{/each}
	</div>

	{#if !submitted}
		<Button onclick={submit} disabled={selected === null}>Check Answer</Button>
	{:else}
		<p class={selected === correctIndex ? 'text-success font-medium' : 'text-error font-medium'}>
			{selected === correctIndex ? 'Correct!' : `Incorrect. The correct answer is: ${options[correctIndex]}`}
		</p>
	{/if}
</div>
