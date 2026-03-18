<script lang="ts">
	import type { StructuredFeedback } from '$lib/types';
	import Button from '$lib/components/Button.svelte';

	let {
		question,
		evaluationHint,
		onAnswer
	}: {
		question: string;
		evaluationHint: string;
		onAnswer: (score: number, feedback?: StructuredFeedback) => void;
	} = $props();

	let response = $state('');
	let submitted = $state(false);
	let loading = $state(false);
	let feedbackData = $state<StructuredFeedback | undefined>();
	let score = $state<number | null>(null);

	async function submit() {
		if (response.trim().length === 0 || loading) return;
		loading = true;

		try {
			const res = await fetch('/api/comprehension/freeform', {
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

			const data: StructuredFeedback = await res.json();
			const evaluatedScore: number = data.score ?? 0.5;
			score = evaluatedScore;
			feedbackData = data;
			submitted = true;
			onAnswer(evaluatedScore, data);
		} catch {
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
				{#if feedbackData}
					{#if feedbackData.objectiveAssessments.length > 0}
						{@const assessment = feedbackData.objectiveAssessments[0]}
						<p class="mt-2 text-text-muted">{assessment.feedback}</p>
					{:else if feedbackData.summary}
						<p class="mt-2 text-text-muted">{feedbackData.summary}</p>
					{/if}
					{#if feedbackData.nextSteps.length > 0 && score < 0.6}
						<div class="mt-2 rounded-lg border border-accent/20 bg-accent/5 p-2">
							<p class="text-xs font-semibold text-accent-dark">Try next:</p>
							<p class="text-sm text-text">{feedbackData.nextSteps[0]}</p>
						</div>
					{/if}
				{/if}
			</div>
		{/if}
	</div>
</div>
