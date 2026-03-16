<script lang="ts">
	import type { QuizQuestion } from '$lib/types';
	import Button from '$lib/components/Button.svelte';
	import QuizContainer from '$lib/components/quiz/QuizContainer.svelte';
	import VoiceChat from '$lib/components/VoiceChat.svelte';

	let {
		lessonSlug,
		lessonId,
		quiz = [],
		onComplete
	}: {
		lessonSlug: string;
		lessonId: string;
		quiz: QuizQuestion[];
		onComplete: (score: number, hearts: number) => void;
	} = $props();

	function handleVoiceComplete(score: number) {
		onComplete(score, 3);
	}

	let mode = $state<'quiz' | 'voice'>('quiz');
</script>

<div class="comp-check">
	<div class="comp-header">
		<div class="comp-header-text">
			<h2 class="comp-title">Practice Time</h2>
			<p class="comp-subtitle">Show what you learned</p>
		</div>
		<div class="comp-mode-toggle">
			<button
				type="button"
				class="mode-btn"
				class:mode-btn-active={mode === 'quiz'}
				onclick={() => (mode = 'quiz')}
			>
				<svg class="mode-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
				</svg>
				Quiz
			</button>
			<button
				type="button"
				class="mode-btn"
				class:mode-btn-active={mode === 'voice'}
				onclick={() => (mode = 'voice')}
			>
				<svg class="mode-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
				</svg>
				Voice
			</button>
		</div>
	</div>

	{#if mode === 'quiz'}
		{#if quiz.length > 0}
			<QuizContainer questions={quiz} {lessonSlug} {onComplete} />
		{:else}
			<div class="comp-empty">
				<p>No quiz questions available for this lesson.</p>
				<div class="comp-empty-action">
					<Button onclick={() => onComplete(1, 3)}>Continue</Button>
				</div>
			</div>
		{/if}
	{:else if mode === 'voice'}
		<VoiceChat {lessonId} {lessonSlug} onComplete={handleVoiceComplete} />
	{/if}
</div>

<style>
	.comp-check {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.comp-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.comp-title {
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--color-text);
	}

	.comp-subtitle {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-text-muted);
		margin-top: 0.125rem;
	}

	.comp-mode-toggle {
		display: flex;
		gap: 0.375rem;
		padding: 0.25rem;
		background: var(--color-surface-raised);
		border-radius: var(--radius-full);
	}

	.mode-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.875rem;
		border-radius: var(--radius-full);
		border: none;
		background: transparent;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.mode-btn-active {
		background: var(--color-surface);
		color: var(--color-primary);
		box-shadow: var(--shadow-sm);
	}

	.mode-icon {
		width: 0.875rem;
		height: 0.875rem;
	}

	.comp-empty {
		padding: 3rem 2rem;
		border-radius: var(--radius-xl);
		background: var(--color-surface-raised);
		text-align: center;
		color: var(--color-text-muted);
	}

	.comp-empty-action {
		margin-top: 1rem;
	}
</style>
