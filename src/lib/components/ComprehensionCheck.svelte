<script lang="ts">
	import type { QuizQuestion, StructuredFeedback } from '$lib/types';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
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
		onComplete: (score: number, hearts: number, feedback?: StructuredFeedback) => void;
	} = $props();

	// ── Shared state ──
	let voiceAvailable = $state<boolean | null>(null);
	let quizScore = $state(0);
	let quizHearts = $state(3);
	let quizFeedback = $state<StructuredFeedback | undefined>(undefined);

	// ── Normal lesson phases: quiz → transition → conversation ──
	let phase = $state<'quiz' | 'transition' | 'conversation'>('quiz');
	let conversationMode = $state<'voice' | 'text' | null>(null);

	// ── Test lesson phases (roleplay): quiz → briefing → roleplay ──
	let testPhase = $state<'quiz' | 'briefing' | 'roleplay'>('quiz');
	let roleplayMode = $state<'voice' | 'text' | null>(null);
	let scenarioCollapsed = $state(false);

	// Check voice availability on mount
	$effect(() => {
		checkVoiceAvailability();
	});

	async function checkVoiceAvailability() {
		try {
			const res = await fetch(
				`/api/comprehension/agent-config?lessonId=${encodeURIComponent(lessonSlug)}`
			);
			if (!res.ok) throw new Error('Failed');
			const data = await res.json();
			if (!data.agentId) throw new Error('No agent');
			voiceAvailable = true;
		} catch {
			voiceAvailable = false;
		}
	}

	// ── Normal lesson handlers ──
	function handleQuizComplete(score: number, hearts: number, feedback?: StructuredFeedback) {
		quizScore = score;
		quizHearts = hearts;
		quizFeedback = feedback;
		phase = 'transition';
	}

	function handleConversationComplete(score: number, feedback?: StructuredFeedback) {
		// Weighted: 40% quiz, 60% conversation
		const combinedScore = quizScore * 0.4 + score * 0.6;
		// Merge feedback — prefer conversation feedback but keep quiz data
		const mergedFeedback = feedback ?? quizFeedback;
		onComplete(combinedScore, quizHearts, mergedFeedback);
	}

	// ── Test lesson handlers ──
	function handleQuizCompleteForTest(score: number, hearts: number, _feedback?: StructuredFeedback) {
		quizScore = score;
		quizHearts = hearts;
		testPhase = 'briefing';
	}

	function handleRoleplayComplete(score: number, feedback?: StructuredFeedback) {
		const combinedScore = quizScore * 0.4 + score * 0.6;
		onComplete(combinedScore, quizHearts, feedback);
	}

	// Pre-parse scenario briefing markdown
	type Segment = { text: string; bold: boolean };
	function parseInline(text: string): Segment[] {
		const parts = text.split(/\*\*(.*?)\*\*/g);
		return parts.map((part, i) => ({ text: part, bold: i % 2 === 1 })).filter((s) => s.text);
	}
	let briefingParagraphs = $derived(
		scenarioBriefing
			? scenarioBriefing.split('\n\n').map((p) => parseInline(p))
			: []
	);

	// Dynamic header text
	let headerTitle = $derived.by(() => {
		if (hasRoleplay) {
			return testPhase === 'quiz' ? 'Knowledge Check' : 'Feedback in Action';
		}
		return phase === 'conversation' ? 'Talk It Through' : 'Practice Time';
	});

	let headerSubtitle = $derived.by(() => {
		if (hasRoleplay) {
			return testPhase === 'quiz' ? "Test what you've learned so far" : 'Role-play giving feedback to Jamie';
		}
		if (phase === 'transition') return 'Great job on the quiz!';
		if (phase === 'conversation') return 'Discuss what you learned with Jamie';
		return 'Show what you learned';
	});

	let phaseIndicator = $derived.by(() => {
		if (hasRoleplay) {
			if (testPhase === 'quiz') return 'Part 1 of 2';
			return 'Part 2 of 2';
		}
		if (phase === 'quiz') return 'Part 1 of 2';
		return 'Part 2 of 2';
	});
</script>

<div class="comp-check">
	<div class="comp-header">
		<div class="comp-header-text">
			<h2 class="comp-title">{headerTitle}</h2>
			<p class="comp-subtitle">{headerSubtitle}</p>
			<span class="comp-phase-badge">{phaseIndicator}</span>
		</div>
	</div>

	{#if hasRoleplay}
		<!-- ═══ Test lessons: quiz → briefing → roleplay ═══ -->
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
					{#each briefingParagraphs as segs, i (i)}
						<p>
							{#each segs as seg, j (j)}
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
							{#each briefingParagraphs as segs, i (i)}
								<p>
									{#each segs as seg, j (j)}
										{#if seg.bold}<strong>{seg.text}</strong>{:else}{seg.text}{/if}
									{/each}
								</p>
							{/each}
						</div>
					{/if}
				</button>
			{/if}

			{#if roleplayMode === null}
				{#if voiceAvailable === null}
					<div class="mode-chooser-loading">
						<div class="spinner"></div>
					</div>
				{:else if voiceAvailable}
					<div class="mode-chooser">
						<Card variant="featured" padding="lg">
							<div class="voice-hero">
								<div class="voice-hero-icon">
									<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
										<path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
									</svg>
								</div>
								<h3 class="voice-hero-heading">Speak with Jamie</h3>
								<p class="voice-hero-desc">Practice giving feedback out loud, just like a real 1:1. Jamie will respond naturally to what you say.</p>
								<div class="voice-hero-badge">Recommended</div>
								<Button variant="cta" size="lg" fullWidth onclick={() => (roleplayMode = 'voice')}>
									Start Voice Conversation
								</Button>
								<p class="voice-hero-note">Requires microphone access</p>
							</div>
						</Card>
						<Card variant="outlined" padding="sm">
							<div class="quiz-fallback">
								<svg class="quiz-fallback-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.2 48.2 0 005.382-.315c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
								</svg>
								<span class="quiz-fallback-text">Prefer typing? Use the text chat instead.</span>
								<Button variant="ghost" size="sm" onclick={() => (roleplayMode = 'text')}>
									Switch to Text
								</Button>
							</div>
						</Card>
					</div>
				{:else}
					<ScenarioChat {lessonSlug} onComplete={handleRoleplayComplete} />
				{/if}
			{:else if roleplayMode === 'text'}
				<ScenarioChat {lessonSlug} onComplete={handleRoleplayComplete} />
			{:else if roleplayMode === 'voice'}
				<VoiceChat
					{lessonId}
					{lessonSlug}
					onComplete={handleRoleplayComplete}
					heading="Speak with Jamie"
					description="Practice giving feedback out loud — Jamie will respond naturally, just like a real 1:1."
				/>
			{/if}
		{/if}
	{:else}
		<!-- ═══ Normal lessons: quiz → transition → conversation ═══ -->
		{#if phase === 'quiz'}
			{#if quiz.length > 0}
				<QuizContainer questions={quiz} {lessonSlug} onComplete={handleQuizComplete} />
			{:else}
				<div class="comp-empty">
					<p>No quiz questions available for this lesson.</p>
					<div class="comp-empty-action">
						<Button onclick={() => handleQuizComplete(1, 3)}>Continue</Button>
					</div>
				</div>
			{/if}

		{:else if phase === 'transition'}
			<div class="phase-transition">
				<div class="transition-check">
					<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<div class="transition-badge">Quiz Complete</div>
				<p class="transition-text">
					Nice work! Now let's talk it through with <strong>Jamie</strong> to make sure it sticks.
				</p>
				<Button variant="cta" size="lg" onclick={() => (phase = 'conversation')}>
					Continue to Conversation
				</Button>
			</div>

		{:else if phase === 'conversation'}
			{#if conversationMode === null}
				{#if voiceAvailable === null}
					<div class="mode-chooser-loading">
						<div class="spinner"></div>
					</div>
				{:else if voiceAvailable}
					<div class="mode-chooser">
						<Card variant="featured" padding="lg">
							<div class="voice-hero">
								<div class="voice-hero-icon">
									<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
										<path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
									</svg>
								</div>
								<h3 class="voice-hero-heading">Talk with Jamie</h3>
								<p class="voice-hero-desc">Have a voice conversation about what you just learned. Jamie will check your understanding — just like chatting with a colleague.</p>
								<div class="voice-hero-badge">Recommended</div>
								<Button variant="cta" size="lg" fullWidth onclick={() => (conversationMode = 'voice')}>
									Start Voice Conversation
								</Button>
								<p class="voice-hero-note">Requires microphone access</p>
							</div>
						</Card>
						<Card variant="outlined" padding="sm">
							<div class="quiz-fallback">
								<svg class="quiz-fallback-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
								</svg>
								<span class="quiz-fallback-text">Prefer to type? Use the text chat instead.</span>
								<Button variant="ghost" size="sm" onclick={() => (conversationMode = 'text')}>
									Switch to Text
								</Button>
							</div>
						</Card>
					</div>
				{:else}
					<!-- Voice not available — fall back to text chat -->
					<ScenarioChat {lessonSlug} onComplete={handleConversationComplete} />
				{/if}
			{:else if conversationMode === 'voice'}
				<VoiceChat {lessonId} {lessonSlug} onComplete={handleConversationComplete} />
			{:else if conversationMode === 'text'}
				<ScenarioChat {lessonSlug} onComplete={handleConversationComplete} />
			{/if}
		{/if}
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

	.comp-phase-badge {
		display: inline-block;
		margin-top: 0.375rem;
		padding: 0.125rem 0.625rem;
		border-radius: var(--radius-full);
		background: var(--color-primary-subtle);
		color: var(--color-primary);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
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

	/* ── Phase transition (quiz → conversation) ── */
	.phase-transition {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 2rem 1.5rem;
		border-radius: var(--radius-xl);
		background: var(--color-surface);
		border: 2px solid var(--color-success-light);
		text-align: center;
	}

	.transition-check {
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 50%;
		background: var(--color-success-light);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.transition-check svg {
		width: 2rem;
		height: 2rem;
		color: var(--color-success);
	}

	/* ── Mode chooser ── */
	.mode-chooser {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.mode-chooser-loading {
		display: flex;
		justify-content: center;
		padding: 2rem;
	}

	.spinner {
		width: 1.5rem;
		height: 1.5rem;
		border: 2.5px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.voice-hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 0;
	}

	.voice-hero-icon {
		width: 4.5rem;
		height: 4.5rem;
		border-radius: 50%;
		background: var(--color-primary-subtle);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 0 24px oklch(44% 0.26 280 / 0.15);
		animation: icon-pulse 3s ease-in-out infinite;
	}

	.voice-hero-icon svg {
		width: 3rem;
		height: 3rem;
		color: var(--color-primary);
	}

	@keyframes icon-pulse {
		0%, 100% { box-shadow: 0 0 24px oklch(44% 0.26 280 / 0.15); }
		50% { box-shadow: 0 0 32px oklch(44% 0.26 280 / 0.25); }
	}

	.voice-hero-heading {
		font-size: 1.25rem;
		font-weight: 800;
		color: var(--color-text);
	}

	.voice-hero-desc {
		font-size: 0.875rem;
		line-height: 1.6;
		color: var(--color-text-muted);
		text-align: center;
		max-width: 28rem;
	}

	.voice-hero-badge {
		display: inline-flex;
		padding: 0.25rem 0.75rem;
		border-radius: var(--radius-full);
		background: var(--color-accent-subtle, oklch(75% 0.15 85 / 0.15));
		color: var(--color-accent);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.voice-hero-note {
		font-size: 0.75rem;
		color: var(--color-text-subtle);
		margin-top: 0.25rem;
	}

	.quiz-fallback {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		flex-wrap: wrap;
	}

	.quiz-fallback-icon {
		width: 1.25rem;
		height: 1.25rem;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.quiz-fallback-text {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		flex: 1;
	}

	/* ── Scenario / test lesson styles ── */
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
		background: var(--color-success-light);
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
</style>
