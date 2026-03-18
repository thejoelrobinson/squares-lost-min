<script lang="ts">
	import type { QuizQuestion } from '$lib/types';
	import Button from '$lib/components/Button.svelte';
	import QuizContainer from '$lib/components/quiz/QuizContainer.svelte';
	import VoiceChat from '$lib/components/VoiceChat.svelte';
	import ScenarioChat from '$lib/components/ScenarioChat.svelte';

	let {
		lessonSlug,
		lessonId,
		quiz = [],
		scenarioBriefing,
		hasRoleplay = false,
		onComplete
	}: {
		lessonSlug: string;
		lessonId: string;
		quiz: QuizQuestion[];
		scenarioBriefing?: string;
		hasRoleplay?: boolean;
		onComplete: (score: number, hearts: number) => void;
	} = $props();

	function handleVoiceComplete(score: number) {
		onComplete(score, 3);
	}

	// svelte-ignore state_referenced_locally
	const _hasBriefing = !!scenarioBriefing;

	// For test lessons with roleplay: quiz phase → roleplay phase
	let testPhase = $state<'quiz' | 'briefing' | 'roleplay'>('quiz');
	let quizScore = $state(0);
	let quizHearts = $state(3);
	let scenarioCollapsed = $state(false);
	let mode = $state<'quiz' | 'voice' | 'text'>(_hasBriefing ? 'text' : 'quiz');

	function handleQuizCompleteForTest(score: number, hearts: number) {
		quizScore = score;
		quizHearts = hearts;
		testPhase = 'briefing';
	}

	function handleRoleplayComplete(score: number) {
		// Weighted average: 40% quiz, 60% roleplay
		const combinedScore = quizScore * 0.4 + score * 0.6;
		onComplete(combinedScore, quizHearts);
	}

	type Segment = { text: string; bold: boolean };
	function parseInline(text: string): Segment[] {
		const parts = text.split(/\*\*(.*?)\*\*/g);
		return parts.map((part, i) => ({ text: part, bold: i % 2 === 1 })).filter((s) => s.text);
	}
</script>

<div class="comp-check">
	<div class="comp-header">
		<div class="comp-header-text">
			{#if hasRoleplay}
				<h2 class="comp-title">{testPhase === 'quiz' ? 'Knowledge Check' : 'Feedback in Action'}</h2>
				<p class="comp-subtitle">
					{testPhase === 'quiz' ? 'Test what you\'ve learned so far' : 'Role-play giving feedback to Jamie'}
				</p>
			{:else}
				<h2 class="comp-title">Practice Time</h2>
				<p class="comp-subtitle">Show what you learned</p>
			{/if}
		</div>
		{#if !_hasBriefing}<div class="comp-mode-toggle">
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
		</div>{/if}
	</div>

	{#if hasRoleplay}
		<!-- Two-phase test: quiz → briefing → roleplay -->
		{#if testPhase === 'quiz'}
			{#if quiz.length > 0}
				<QuizContainer questions={quiz} {lessonSlug} onComplete={handleQuizCompleteForTest} />
			{:else}
				<div class="comp-empty">
					<p>No quiz questions available.</p>
					<div class="comp-empty-action">
						<Button onclick={() => handleQuizCompleteForTest(1, 3)}>Continue</Button>
					</div>
				</div>
			{/if}
		{:else if testPhase === 'briefing' && scenarioBriefing}
			<div class="scenario-transition">
				<div class="transition-badge">Part 2 of 2</div>
				<p class="transition-text">Nice work on the knowledge check! Now it's time to put it into practice.</p>
			</div>
			<div class="scenario-briefing">
				<div class="scenario-badge">Scenario</div>
				<div class="scenario-text">
					{#each scenarioBriefing.split('\n\n') as paragraph, i (i)}
						<p>
							{#each parseInline(paragraph) as seg, j (j)}
								{#if seg.bold}<strong>{seg.text}</strong>{:else}{seg.text}{/if}
							{/each}
						</p>
					{/each}
				</div>
				<Button onclick={() => (testPhase = 'roleplay')} size="lg" variant="cta" fullWidth>
					I'm Ready — Start the Roleplay
				</Button>
			</div>
		{:else if testPhase === 'roleplay'}
			<!-- Collapsible scenario reference -->
			{#if scenarioBriefing}
				<button
					type="button"
					class="scenario-reference"
					onclick={() => (scenarioCollapsed = !scenarioCollapsed)}
				>
					<div class="scenario-reference-header">
						<div class="scenario-badge scenario-badge--sm">Scenario</div>
						<svg
							class="scenario-chevron"
							class:scenario-chevron--open={!scenarioCollapsed}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2.5"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
						</svg>
					</div>
					{#if !scenarioCollapsed}
						<div class="scenario-text scenario-text--sm">
							{#each scenarioBriefing.split('\n\n') as paragraph, i (i)}
								<p>
									{#each parseInline(paragraph) as seg, j (j)}
										{#if seg.bold}<strong>{seg.text}</strong>{:else}{seg.text}{/if}
									{/each}
								</p>
							{/each}
						</div>
					{/if}
				</button>
			{/if}

			<!-- Text / Voice toggle -->
			<div class="roleplay-mode-area">
				<div class="comp-mode-toggle">
					<button
						type="button"
						class="mode-btn"
						class:mode-btn-active={mode === 'text'}
						onclick={() => (mode = 'text')}
					>
						<svg class="mode-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.2 48.2 0 005.382-.315c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
						</svg>
						Text
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

			{#if mode === 'text'}
				<ScenarioChat {lessonSlug} onComplete={handleRoleplayComplete} />
			{:else if mode === 'voice'}
				<VoiceChat {lessonId} {lessonSlug} onComplete={handleRoleplayComplete} />
			{/if}
		{/if}
	{:else if mode === 'quiz'}
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

	.scenario-transition {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 0;
	}

	.transition-badge {
		padding: 0.25rem 0.75rem;
		border-radius: var(--radius-full);
		background: var(--color-success-subtle, oklch(62% 0.19 160 / 0.12));
		color: var(--color-success);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.transition-text {
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--color-text);
		text-align: center;
	}

	.scenario-briefing {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding: 1.5rem;
		border-radius: var(--radius-xl);
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-bottom-width: 4px;
		border-bottom-color: var(--color-border-strong);
	}

	.scenario-badge {
		align-self: flex-start;
		padding: 0.25rem 0.75rem;
		border-radius: var(--radius-full);
		background: var(--color-primary-subtle);
		color: var(--color-primary);
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.scenario-badge--sm {
		padding: 0.125rem 0.5rem;
		font-size: 0.625rem;
	}

	.scenario-text {
		font-size: 0.9375rem;
		line-height: 1.7;
		color: var(--color-text);
	}

	.scenario-text--sm {
		font-size: 0.8125rem;
		line-height: 1.6;
		margin-top: 0.75rem;
	}

	.scenario-text p {
		margin-bottom: 0.75rem;
	}

	.scenario-text p:last-child {
		margin-bottom: 0;
	}

	.scenario-reference {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: 0.875rem 1rem;
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		border: 1.5px solid var(--color-border);
		cursor: pointer;
		text-align: left;
		transition: border-color 0.15s ease;
	}

	.scenario-reference:hover {
		border-color: var(--color-border-strong);
	}

	.scenario-reference-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.scenario-chevron {
		width: 1rem;
		height: 1rem;
		color: var(--color-text-muted);
		transition: transform 0.2s ease;
		transform: rotate(-90deg);
	}

	.scenario-chevron--open {
		transform: rotate(0deg);
	}

	.roleplay-mode-area {
		display: flex;
		justify-content: center;
	}
</style>
