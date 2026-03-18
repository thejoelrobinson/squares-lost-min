<script lang="ts">
	import type { QuizQuestion, StructuredFeedback } from '$lib/types';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import HeartIndicator from '$lib/components/HeartIndicator.svelte';
	import SamQuote from '$lib/components/SamQuote.svelte';
	import ConfettiBurst from '$lib/components/ConfettiBurst.svelte';
	import { samQuotes } from '$lib/content/sam-quotes';
	import SoundEffects from '$lib/utils/soundEffects';
	import Haptics from '$lib/utils/haptics';
	import { fly, scale } from 'svelte/transition';
	import { onDestroy } from 'svelte';
	import MultipleChoice from './MultipleChoice.svelte';
	import DragToOrder from './DragToOrder.svelte';
	import FreeformResponse from './FreeformResponse.svelte';
	import FillInTheBlank from './FillInTheBlank.svelte';
	import TrueFalse from './TrueFalse.svelte';
	import MatchPairs from './MatchPairs.svelte';

	const MAX_HEARTS = 3;
	const PASS_THRESHOLD = 0.6;

	let {
		questions,
		lessonSlug = '',
		onComplete
	}: {
		questions: QuizQuestion[];
		lessonSlug?: string;
		onComplete: (score: number, hearts: number, feedback?: StructuredFeedback) => void;
	} = $props();

	let quote = $derived(lessonSlug ? samQuotes[lessonSlug] ?? null : null);
	let questionCount = $derived(questions.length);

	// Queue-based state: indices into `questions`, grows when answers are wrong
	let queue = $state<number[]>([]);
	let currentQueuePos = $state(0);
	let currentIndex = $derived(queue[currentQueuePos] ?? 0);

	// Per-queue-slot result tracking (parallel arrays aligned with `queue`)
	let queueScores = $state<(number | null)[]>([]);
	let queueShowResult = $state<boolean[]>([]);

	let quizFinished = $state(false);
	let hearts = $state(MAX_HEARTS);
	let showCorrectBurst = $state(false);
	let showCheckmark = $state(false);
	let resultsRevealed = $state(false);

	const encouragements = ['Amazing!', 'You got it!', 'Nice one!', 'Correct!', 'Well done!', 'Nailed it!'];
	let encourageText = $state('');
	let xpPopup = $state<{ amount: number; key: number } | null>(null);
	let xpKey = $state(0);
	let answerTimeout: ReturnType<typeof setTimeout> | null = null;
	let freeformFeedbacks = $state<StructuredFeedback[]>([]);

	onDestroy(() => {
		if (answerTimeout) clearTimeout(answerTimeout);
	});

	function resetQuiz() {
		queue = questions.map((_q, i) => i);
		currentQueuePos = 0;
		queueScores = Array(questions.length).fill(null);
		queueShowResult = Array(questions.length).fill(false);
		quizFinished = false;
		hearts = MAX_HEARTS;
		showCorrectBurst = false;
		showCheckmark = false;
		resultsRevealed = false;
		freeformFeedbacks = [];
	}

	$effect(() => {
		resetQuiz();
	});

	let currentQuestion = $derived(questions[currentIndex]);
	let isLastQuestion = $derived(currentQueuePos === queue.length - 1);
	let hasAnsweredCurrent = $derived(queueShowResult[currentQueuePos] ?? false);
	let outOfHearts = $derived(hearts <= 0);
	let currentCorrect = $derived(queueScores[currentQueuePos] !== null && queueScores[currentQueuePos] !== undefined && queueScores[currentQueuePos]! >= PASS_THRESHOLD);

	// Compute stats from unique questions only (best score per question index)
	let { questionsCorrect, totalScore } = $derived.by(() => {
		const bestScores: Record<number, number> = {};
		for (let i = 0; i < queue.length; i++) {
			const s = queueScores[i];
			if (s === null) continue;
			const qIdx = queue[i];
			if (bestScores[qIdx] === undefined || s > bestScores[qIdx]) {
				bestScores[qIdx] = s;
			}
		}
		const values = Object.values(bestScores);
		const correct = values.filter((s) => s >= PASS_THRESHOLD).length;
		const avg = values.length === 0 ? 0 : values.reduce((sum, s) => sum + s, 0) / values.length;
		return { questionsCorrect: correct, totalScore: avg };
	});

	let passed = $derived(totalScore >= PASS_THRESHOLD && !outOfHearts);

	function handleFreeformAnswer(score: number, feedback?: StructuredFeedback) {
		if (feedback) {
			freeformFeedbacks = [...freeformFeedbacks, feedback];
		}
		handleAnswer(score);
	}

	function handleAnswer(score: number) {
		queueScores[currentQueuePos] = score;
		queueShowResult[currentQueuePos] = true;

		if (score >= PASS_THRESHOLD) {
			encourageText = encouragements[Math.floor(Math.random() * encouragements.length)];
			SoundEffects.play('correct');
			Haptics.success();
			showCorrectBurst = true;
			showCheckmark = true;
			xpKey += 1;
			xpPopup = { amount: 10, key: xpKey };
			fetch('/api/xp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ amount: 10 })
			}).catch(() => {});
			if (answerTimeout) clearTimeout(answerTimeout);
			answerTimeout = setTimeout(() => {
				showCorrectBurst = false;
				showCheckmark = false;
				xpPopup = null;
			}, 900);
		} else {
			SoundEffects.play('incorrect');
			Haptics.error();
			// Re-queue the failed question at the end
			queue = [...queue, currentIndex];
			queueScores = [...queueScores, null];
			queueShowResult = [...queueShowResult, false];
		}

		if (score < PASS_THRESHOLD) {
			hearts = Math.max(0, hearts - 1);
		}
	}

	function next() {
		if (outOfHearts) {
			quizFinished = true;
			return;
		}
		if (isLastQuestion) {
			quizFinished = true;
		} else {
			currentQueuePos += 1;
		}
	}

	function handleContinue() {
		if (passed) {
			SoundEffects.play('level-up');
			if (questionsCorrect === questionCount) {
				fetch('/api/xp', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ amount: 20 })
				}).catch(() => {});
			}
		}

		let mergedFeedback: StructuredFeedback | undefined;
		if (freeformFeedbacks.length > 0) {
			mergedFeedback = {
				score: totalScore,
				summary: freeformFeedbacks.map((f) => f.summary).filter(Boolean).join(' '),
				objectiveAssessments: freeformFeedbacks.flatMap((f) => f.objectiveAssessments),
				strengths: freeformFeedbacks.flatMap((f) => f.strengths),
				nextSteps: freeformFeedbacks.flatMap((f) => f.nextSteps)
			};
		}
		onComplete(totalScore, hearts, mergedFeedback);
	}

	$effect(() => {
		if (quizFinished) {
			const timeout = setTimeout(() => { resultsRevealed = true; }, 200);
			return () => clearTimeout(timeout);
		}
	});

	let accuracyPercent = $derived(Math.round(totalScore * 100));
</script>

<Card>
	{#if !quizFinished}
		<!-- Header with progress pips and hearts -->
		<div class="quiz-header">
			<div class="quiz-meta">
				<span class="quiz-counter">{currentQueuePos + 1}/{queue.length}</span>
				<HeartIndicator {hearts} maxHearts={MAX_HEARTS} />
			</div>
			<div class="quiz-pips">
				{#each queue as _qIdx, i (i)}
					<div
						class="pip"
						class:pip-current={i === currentQueuePos}
						class:pip-correct={queueScores[i] !== null && queueScores[i] !== undefined && queueScores[i]! >= PASS_THRESHOLD}
						class:pip-wrong={queueScores[i] !== null && queueScores[i] !== undefined && queueScores[i]! < PASS_THRESHOLD}
					></div>
				{/each}
			</div>
		</div>

		<!-- Question area -->
		<div class="quiz-body">
			{#if showCorrectBurst}
				<ConfettiBurst />
			{/if}
			{#if showCheckmark}
				<div class="checkmark-badge" transition:scale={{ duration: 300 }}>
					<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
					</svg>
				</div>
			{/if}
			{#if xpPopup}
				{#key xpPopup.key}
					<div class="xp-float">+{xpPopup.amount} XP</div>
				{/key}
			{/if}

			{#key currentQueuePos}
				<div in:fly={{ x: 40, duration: 300, delay: 200 }} out:fly={{ x: -40, duration: 200 }}>
					{#if currentQuestion.type === 'multiple-choice'}
						<MultipleChoice
							question={currentQuestion.question}
							options={currentQuestion.options ?? []}
							correctIndex={typeof currentQuestion.correct === 'number' ? currentQuestion.correct : 0}
							onAnswer={handleAnswer}
						/>
					{:else if currentQuestion.type === 'order'}
						<DragToOrder
							question={currentQuestion.question}
							items={currentQuestion.items ?? []}
							correctOrder={Array.isArray(currentQuestion.correct) ? currentQuestion.correct : []}
							onAnswer={handleAnswer}
						/>
					{:else if currentQuestion.type === 'freeform'}
						<FreeformResponse
							question={currentQuestion.question}
							evaluationHint={currentQuestion.evaluationHint ?? ''}
							onAnswer={handleFreeformAnswer}
						/>
					{:else if currentQuestion.type === 'fill-in-the-blank'}
						<FillInTheBlank
							question={currentQuestion.question}
							wordBank={currentQuestion.wordBank ?? []}
							blanks={currentQuestion.blanks ?? []}
							onAnswer={handleAnswer}
						/>
					{:else if currentQuestion.type === 'true-false'}
						<TrueFalse
							question={currentQuestion.question}
							correctBool={currentQuestion.correctBool ?? false}
							explanation={currentQuestion.explanation}
							onAnswer={handleAnswer}
						/>
					{:else if currentQuestion.type === 'matching'}
						<MatchPairs
							question={currentQuestion.question}
							leftItems={currentQuestion.leftItems ?? []}
							rightItems={currentQuestion.rightItems ?? []}
							correctPairs={currentQuestion.correctPairs ?? []}
							onAnswer={handleAnswer}
						/>
					{/if}
				</div>
			{/key}
		</div>

		{#if hasAnsweredCurrent}
			<div class="feedback-bar" class:feedback-correct={currentCorrect} class:feedback-incorrect={!currentCorrect}>
				<div class="feedback-inner">
					<div class="feedback-text-area">
						{#if currentCorrect}
							<svg class="feedback-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
							<span class="feedback-label">{encourageText}</span>
						{:else}
							<svg class="feedback-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
							<span class="feedback-label">Not quite!</span>
						{/if}
					</div>
					<button type="button" class="feedback-continue" onclick={next}>
						{isLastQuestion ? 'See Results' : 'Continue'}
					</button>
				</div>
			</div>
		{/if}
	{:else}
		<!-- Results -->
		<div class="results">
			{#if outOfHearts}
				<div class="results-icon results-icon-fail" in:scale={{ duration: 400 }}>
					<svg viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
					</svg>
				</div>
				<h3 class="results-title">Out of Hearts!</h3>
				<p class="results-text">Review the material and try again.</p>
				<div class="results-actions">
					<Button variant="secondary" onclick={resetQuiz}>Try Again</Button>
					<Button variant="cta" onclick={handleContinue}>Continue Anyway</Button>
				</div>
			{:else}
				<div class="results-icon" class:results-icon-pass={passed} class:results-icon-review={!passed} in:scale={{ duration: 400, delay: 100 }}>
					{#if passed}
						<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					{:else}
						<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
						</svg>
					{/if}
				</div>

				<h3 class="results-title" in:fly={{ y: 10, duration: 300, delay: 200 }}>
					{passed ? 'Great job!' : 'Keep learning!'}
				</h3>

				{#if resultsRevealed}
					<!-- Circular ring -->
					<div class="accuracy-ring-wrap" in:scale={{ duration: 400 }}>
						<svg viewBox="0 0 120 120" class="accuracy-ring-svg">
							<circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-surface-raised)" stroke-width="8" />
							<circle
								cx="60" cy="60" r="50" fill="none"
								stroke={passed ? 'var(--color-success)' : 'var(--color-error)'}
								stroke-width="8"
								stroke-linecap="round"
								stroke-dasharray="{accuracyPercent * 3.14} 314"
								transform="rotate(-90 60 60)"
								class="accuracy-ring-fill"
							/>
						</svg>
						<div class="accuracy-ring-label">
							<span class="accuracy-value" class:text-success={passed} class:text-error={!passed}>{accuracyPercent}%</span>
							<span class="accuracy-text">Accuracy</span>
						</div>
					</div>

					<!-- Stats -->
					<div class="results-stats" in:fly={{ y: 10, duration: 300 }}>
						<div class="results-stat">
							<span class="results-stat-value">{questionsCorrect}/{questionCount}</span>
							<span class="results-stat-label">Correct</span>
						</div>
						<div class="results-stat-divider"></div>
						<div class="results-stat">
							<HeartIndicator {hearts} maxHearts={MAX_HEARTS} />
							<span class="results-stat-label">Hearts</span>
						</div>
					</div>
				{/if}

				<p class="results-text" in:fly={{ y: 10, duration: 300, delay: 400 }}>
					{passed
						? 'You demonstrated solid comprehension.'
						: 'Review the material and try again.'}
				</p>

				{#if quote}
					<div class="results-quote" in:fly={{ y: 10, duration: 300, delay: 500 }}>
						<SamQuote {quote} />
					</div>
				{/if}

				<div class="results-actions" in:fly={{ y: 10, duration: 300, delay: 600 }}>
					{#if !passed}
						<Button variant="secondary" onclick={resetQuiz}>Try Again</Button>
					{/if}
					<Button variant="cta" onclick={handleContinue}>Continue</Button>
				</div>
			{/if}
		</div>
	{/if}
</Card>

<style>
	/* ── Header ── */
	.quiz-header {
		margin-bottom: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.quiz-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.quiz-counter {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--color-text-muted);
	}

	/* ── Progress pips ── */
	.quiz-pips {
		display: flex;
		gap: 0.375rem;
	}

	.pip {
		flex: 1;
		height: 0.3125rem;
		border-radius: var(--radius-full);
		background: var(--color-surface-container);
		transition: all 0.3s var(--ease-smooth);
	}

	.pip-current {
		background: var(--color-primary);
		box-shadow: 0 0 0 2px var(--color-primary-subtle), 0 1px 4px oklch(44% 0.26 280 / 0.2);
		transform: scaleY(1.4);
	}

	.pip-correct {
		background: var(--color-success);
		box-shadow: 0 0 4px oklch(58% 0.21 155 / 0.2);
	}

	.pip-wrong {
		background: var(--color-error);
	}

	/* ── Body ── */
	.quiz-body {
		position: relative;
	}

	.checkmark-badge {
		position: absolute;
		top: -0.5rem;
		right: 0.5rem;
		z-index: 10;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		background: var(--color-success);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 2px solid var(--color-success-dark);
	}

	.checkmark-badge svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	.xp-float {
		position: absolute;
		top: -0.25rem;
		left: 50%;
		z-index: 20;
		font-size: 0.875rem;
		font-weight: 800;
		color: var(--color-accent-dark);
		animation: float-up 0.8s ease-out forwards;
		transform: translateX(-50%);
	}

	@keyframes float-up {
		0% { opacity: 1; transform: translateX(-50%) translateY(0); }
		100% { opacity: 0; transform: translateX(-50%) translateY(-40px); }
	}

	/* ── Feedback bar ── */
	.feedback-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 50;
		padding: 1rem 1.5rem;
		padding-bottom: calc(1rem + env(safe-area-inset-bottom));
		animation: feedback-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}
	.feedback-correct { background: oklch(58% 0.21 155 / 0.95); }
	.feedback-incorrect { background: oklch(56% 0.24 18 / 0.95); }

	.feedback-inner {
		max-width: 42rem;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	.feedback-text-area {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}
	.feedback-icon {
		width: 1.5rem;
		height: 1.5rem;
		color: white;
		flex-shrink: 0;
	}
	.feedback-label {
		font-family: 'Outfit', system-ui, sans-serif;
		font-size: 1.0625rem;
		font-weight: 800;
		color: white;
		letter-spacing: 0.01em;
	}
	.feedback-continue {
		padding: 0.625rem 1.5rem;
		border-radius: 9999px;
		border: none;
		font-family: 'Outfit', system-ui, sans-serif;
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.15s var(--ease-smooth);
		box-shadow: 0 2px 6px oklch(16% 0.02 280 / 0.15);
	}
	.feedback-correct .feedback-continue {
		background: white;
		color: var(--color-success-dark);
	}
	.feedback-incorrect .feedback-continue {
		background: white;
		color: var(--color-error-dark);
	}
	.feedback-continue:hover { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 4px 10px oklch(16% 0.02 280 / 0.2); }
	.feedback-continue:active { transform: scale(0.97) translateY(0); box-shadow: none; }

	@keyframes feedback-slide-up {
		from { transform: translateY(100%); }
		to { transform: translateY(0); }
	}

	/* ── Results ── */
	.results {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 0;
		text-align: center;
	}

	.results-icon {
		width: 4.5rem;
		height: 4.5rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.results-icon svg {
		width: 2.5rem;
		height: 2.5rem;
	}

	.results-icon-pass {
		background: linear-gradient(145deg, oklch(62% 0.19 160 / 0.15), oklch(58% 0.21 155 / 0.08));
		color: var(--color-success);
		box-shadow: 0 4px 16px oklch(58% 0.21 155 / 0.15);
	}

	.results-icon-review {
		background: linear-gradient(145deg, oklch(44% 0.26 280 / 0.1), oklch(44% 0.26 280 / 0.05));
		color: var(--color-primary);
		box-shadow: 0 4px 16px oklch(44% 0.26 280 / 0.1);
	}

	.results-icon-fail {
		background: linear-gradient(145deg, oklch(60% 0.22 22 / 0.15), oklch(56% 0.24 18 / 0.08));
		color: var(--color-error);
		box-shadow: 0 4px 16px oklch(56% 0.24 18 / 0.12);
	}

	.results-icon-fail svg {
		width: 2.5rem;
		height: 2.5rem;
	}

	.results-title {
		font-family: 'Bricolage Grotesque', system-ui, sans-serif;
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--color-text);
		letter-spacing: -0.03em;
	}

	.results-text {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		max-width: 20rem;
	}

	/* ── Accuracy ring ── */
	.accuracy-ring-wrap {
		position: relative;
		margin: 0.5rem 0;
	}

	.accuracy-ring-svg {
		width: 10rem;
		height: 10rem;
	}

	.accuracy-ring-fill {
		animation: ring-fill 1s ease-out forwards;
	}

	@keyframes ring-fill {
		from { stroke-dasharray: 0 314; }
	}

	.accuracy-ring-label {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.accuracy-value {
		font-family: 'Bricolage Grotesque', system-ui, sans-serif;
		font-size: 2.25rem;
		font-weight: 800;
	}

	.text-success { color: var(--color-success); }
	.text-error { color: var(--color-error); }

	.accuracy-text {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	/* ── Stats row ── */
	.results-stats {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.results-stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.results-stat-value {
		font-family: 'Bricolage Grotesque', system-ui, sans-serif;
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--color-primary);
	}

	.results-stat-label {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
	}

	.results-stat-divider {
		width: 1px;
		height: 2rem;
		background: var(--color-border);
	}

	.results-quote {
		width: 100%;
		text-align: left;
	}

	.results-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}
</style>
