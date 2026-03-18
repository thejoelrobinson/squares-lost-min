<script lang="ts">
	import type { StructuredFeedback } from '$lib/types';

	let {
		feedback,
		compact = false
	}: {
		feedback: StructuredFeedback;
		compact?: boolean;
	} = $props();
</script>

<div class="fp" class:fp-compact={compact}>
	{#if feedback.objectiveAssessments.length > 0}
		<div class="fp-section">
			<h4 class="fp-heading">Objective Review</h4>
			<ul class="fp-objectives">
				{#each feedback.objectiveAssessments as assessment, i (i)}
					<li class="fp-obj" class:fp-obj-met={assessment.met} class:fp-obj-missed={!assessment.met}>
						<div class="fp-obj-icon">
							{#if assessment.met}
								<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
									<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
								</svg>
							{:else}
								<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							{/if}
						</div>
						<div class="fp-obj-content">
							<span class="fp-obj-name">{assessment.objective}</span>
							{#if assessment.feedback}
								<span class="fp-obj-feedback">{assessment.feedback}</span>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if feedback.strengths.length > 0}
		<div class="fp-section fp-strengths">
			<h4 class="fp-heading fp-heading-success">Strengths</h4>
			<ul class="fp-list">
				{#each feedback.strengths as strength, i (i)}
					<li>{strength}</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if feedback.nextSteps.length > 0}
		<div class="fp-section fp-nextsteps">
			<h4 class="fp-heading fp-heading-accent">Next Steps</h4>
			<ul class="fp-list">
				{#each feedback.nextSteps as step, i (i)}
					<li>{step}</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	.fp {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}

	.fp-compact {
		gap: 0.75rem;
	}

	.fp-section {
		border-radius: var(--radius-lg);
		padding: 0.875rem 1rem;
		background: var(--color-surface-raised);
	}

	.fp-compact .fp-section {
		padding: 0.625rem 0.75rem;
	}

	.fp-heading {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
		margin-bottom: 0.625rem;
	}

	.fp-compact .fp-heading {
		margin-bottom: 0.375rem;
	}

	.fp-heading-success {
		color: var(--color-success);
	}

	.fp-heading-accent {
		color: var(--color-accent-dark);
	}

	/* Objectives */
	.fp-objectives {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.fp-compact .fp-objectives {
		gap: 0.375rem;
	}

	.fp-obj {
		display: flex;
		gap: 0.625rem;
		align-items: flex-start;
	}

	.fp-obj-icon {
		flex-shrink: 0;
		width: 1.25rem;
		height: 1.25rem;
		margin-top: 0.0625rem;
	}

	.fp-obj-icon svg {
		width: 100%;
		height: 100%;
	}

	.fp-obj-met .fp-obj-icon {
		color: var(--color-success);
	}

	.fp-obj-missed .fp-obj-icon {
		color: var(--color-error);
	}

	.fp-obj-content {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.fp-obj-name {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.fp-obj-feedback {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	.fp-compact .fp-obj-name {
		font-size: 0.75rem;
	}

	.fp-compact .fp-obj-feedback {
		font-size: 0.6875rem;
	}

	/* Strengths & Next Steps */
	.fp-strengths {
		background: oklch(62% 0.19 160 / 0.06);
		border: 1px solid oklch(62% 0.19 160 / 0.12);
	}

	.fp-nextsteps {
		background: oklch(78% 0.155 70 / 0.06);
		border: 1px solid oklch(78% 0.155 70 / 0.12);
	}

	.fp-list {
		list-style: disc;
		padding-left: 1.25rem;
		margin: 0;
		font-size: 0.8125rem;
		color: var(--color-text);
		line-height: 1.6;
	}

	.fp-compact .fp-list {
		font-size: 0.75rem;
		padding-left: 1rem;
	}
</style>
