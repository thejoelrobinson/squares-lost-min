<script lang="ts">
	import Button from '$lib/components/Button.svelte';

	let {
		question,
		evaluationHint,
		onAnswer
	}: {
		question: string;
		evaluationHint: string;
		onAnswer: (score: number) => void;
	} = $props();

	let response = $state('');
	let submitted = $state(false);
	let loading = $state(false);
	let feedback = $state('');
	let score = $state<number | null>(null);

	async function submit() {
		if (response.trim().length === 0 || loading) return;
		loading = true;

		try {
			const res = await fetch('/api/comprehension/evaluate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					question,
					response: response.trim(),
					evaluationHint
				})
			});

			if (!res.ok) {
				throw new Error('Evaluation failed');
			}

			const data = await res.json();
			const evaluatedScore: number = data.score ?? 0.5;
			score = evaluatedScore;
			feedback = data.feedback ?? 'Response evaluated.';
			submitted = true;
			onAnswer(evaluatedScore);
		} catch {
			feedback = 'Unable to evaluate response. Your answer has been recorded.';
			score = 0.5;
			submitted = true;
			onAnswer(0.5);
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex flex-col gap-4">
	<h3 class="text-lg font-semibold text-text">{question}</h3>

	<div class="flex flex-col gap-2">
		<textarea
			class="w-full rounded-xl border-2 border-transparent bg-surface-raised p-4 text-text shadow-sm transition focus:border-primary focus:outline-none"
			rows="4"
			placeholder="Write at least 2 sentences..."
			bind:value={response}
			disabled={submitted || loading}
		></textarea>

		{#if !submitted && !loading}
			<Button onclick={submit} disabled={response.trim().length === 0}>Submit Response</Button>
		{/if}

		{#if loading}
			<div class="flex items-center gap-2 text-text-muted">
				<div class="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
				<span>Evaluating your response...</span>
			</div>
		{/if}

		{#if submitted && score !== null}
			<div class="rounded-xl bg-surface-raised p-4 shadow-sm">
				<p class={score >= 0.6 ? 'text-success font-medium' : 'text-error font-medium'}>
					Score: {Math.round(score * 100)}%
				</p>
				{#if feedback}
					<p class="mt-2 text-text-muted">{feedback}</p>
				{/if}
			</div>
		{/if}
	</div>
</div>
