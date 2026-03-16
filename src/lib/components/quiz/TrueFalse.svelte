<script lang="ts">
	import Button from '$lib/components/Button.svelte';

	let {
		question,
		correctBool,
		explanation,
		onAnswer
	}: {
		question: string;
		correctBool: boolean;
		explanation?: string;
		onAnswer: (score: number) => void;
	} = $props();

	let selected = $state<boolean | null>(null);
	let submitted = $state(false);

	function submit() {
		if (selected === null) return;
		submitted = true;
		onAnswer(selected === correctBool ? 1 : 0);
	}

	function borderClass(value: boolean): string {
		if (!submitted) {
			return selected === value ? 'border-2 border-primary' : 'border-2 border-transparent';
		}
		if (value === correctBool) return 'border-2 border-success';
		if (value === selected) return 'border-2 border-error';
		return 'border-2 border-transparent';
	}
</script>

<div class="flex flex-col gap-4">
	<h3 class="text-lg font-semibold text-text">{question}</h3>

	<div class="flex gap-3">
		{#each [true, false] as value (value)}
			<button
				type="button"
				class="flex-1 cursor-pointer rounded-xl bg-surface-raised p-4 text-center text-lg font-medium shadow-sm transition {borderClass(value)}"
				disabled={submitted}
				onclick={() => {
					if (!submitted) selected = value;
				}}
			>
				{value ? 'True' : 'False'}
			</button>
		{/each}
	</div>

	{#if !submitted}
		<Button onclick={submit} disabled={selected === null}>Check Answer</Button>
	{:else}
		<p class={selected === correctBool ? 'text-success font-medium' : 'text-error font-medium'}>
			{selected === correctBool ? 'Correct!' : 'Incorrect.'}
			{#if explanation}
				{explanation}
			{/if}
		</p>
	{/if}
</div>
