<script lang="ts">
	import type { QuizQuestion } from '$lib/types';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import HeartIndicator from '$lib/components/HeartIndicator.svelte';
	import SamQuote from '$lib/components/SamQuote.svelte';
	import { samQuotes } from '$lib/content/sam-quotes';
	import SoundEffects from '$lib/utils/soundEffects';
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
		onComplete: (score: number, hearts: number) => void;
	} = $props();

	let quote = $derived(lessonSlug ? samQuotes[lessonSlug] ?? null : null);

	let questionCount = $derived(questions.length);

	let currentIndex = $state(0);
	let scores = $state<(number | null)[]>([]);
	let showResult = $state<boolean[]>([]);
	let quizFinished = $state(false);
	let hearts = $state(MAX_HEARTS);

	function resetQuiz() {
		scores = Array(questionCount).fill(null);
		showResult = Array(questionCount).fill(false);
		currentIndex = 0;
		quizFinished = false;
		hearts = MAX_HEARTS;
	}

	$effect(() => {
		resetQuiz();
	});

	let currentQuestion = $derived(questions[currentIndex]);
	let isLastQuestion = $derived(currentIndex === questionCount - 1);
	let hasAnsweredCurrent = $derived(showResult[currentIndex]);
	let outOfHearts = $derived(hearts <= 0);

	// Compute both score stats in a single pass
	let { questionsCorrect, totalScore } = $derived.by(() => {
		const answered = scores.filter((s): s is number => s !== null);
		const correct = answered.filter((s) => s >= PASS_THRESHOLD).length;
		const avg = answered.length === 0 ? 0 : answered.reduce((sum, s) => sum + s, 0) / answered.length;
		return { questionsCorrect: correct, totalScore: avg };
	});

	let passed = $derived(totalScore >= PASS_THRESHOLD && !outOfHearts);

	function handleAnswer(score: number) {
		scores[currentIndex] = score;
		showResult[currentIndex] = true;

		// Play sound effect based on answer correctness
		if (score >= PASS_THRESHOLD) {
			SoundEffects.play('correct');
		} else {
			SoundEffects.play('incorrect');
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
			currentIndex += 1;
		}
	}

	function handleContinue() {
		// Play celebratory sound if passed
		if (passed) {
			SoundEffects.play('level-up');
		}
		onComplete(totalScore, hearts);
	}
</script>

<Card>
	{#if !quizFinished}
		<div class="mb-4 flex flex-col gap-3">
			<div class="flex items-center justify-between">
				<span class="text-sm text-text-muted">
					Question {currentIndex + 1} of {questions.length}
				</span>
				<HeartIndicator {hearts} maxHearts={MAX_HEARTS} />
			</div>
			<div class="flex gap-1.5">
				{#each questions as _q, i (i)}
					<div
						class="h-2 flex-1 rounded-full {i === currentIndex
							? 'bg-primary'
							: scores[i] !== null
								? scores[i]! >= PASS_THRESHOLD
									? 'bg-success'
									: 'bg-error'
								: 'bg-surface-raised'}"
					></div>
				{/each}
			</div>
		</div>

		{#if currentQuestion.type === 'multiple-choice'}
			{#key currentIndex}
				<MultipleChoice
					question={currentQuestion.question}
					options={currentQuestion.options ?? []}
					correctIndex={typeof currentQuestion.correct === 'number' ? currentQuestion.correct : 0}
					onAnswer={handleAnswer}
				/>
			{/key}
		{:else if currentQuestion.type === 'order'}
			{#key currentIndex}
				<DragToOrder
					question={currentQuestion.question}
					items={currentQuestion.items ?? []}
					correctOrder={Array.isArray(currentQuestion.correct) ? currentQuestion.correct : []}
					onAnswer={handleAnswer}
				/>
			{/key}
		{:else if currentQuestion.type === 'freeform'}
			{#key currentIndex}
				<FreeformResponse
					question={currentQuestion.question}
					evaluationHint={currentQuestion.evaluationHint ?? ''}
					onAnswer={handleAnswer}
				/>
			{/key}
		{:else if currentQuestion.type === 'fill-in-the-blank'}
			{#key currentIndex}
				<FillInTheBlank
					question={currentQuestion.question}
					wordBank={currentQuestion.wordBank ?? []}
					blanks={currentQuestion.blanks ?? []}
					onAnswer={handleAnswer}
				/>
			{/key}
		{:else if currentQuestion.type === 'true-false'}
			{#key currentIndex}
				<TrueFalse
					question={currentQuestion.question}
					correctBool={currentQuestion.correctBool ?? false}
					explanation={currentQuestion.explanation}
					onAnswer={handleAnswer}
				/>
			{/key}
		{:else if currentQuestion.type === 'matching'}
			{#key currentIndex}
				<MatchPairs
					question={currentQuestion.question}
					leftItems={currentQuestion.leftItems ?? []}
					rightItems={currentQuestion.rightItems ?? []}
					correctPairs={currentQuestion.correctPairs ?? []}
					onAnswer={handleAnswer}
				/>
			{/key}
		{/if}

		{#if hasAnsweredCurrent}
			<div class="mt-6 flex justify-end">
				<Button onclick={next}>
					{isLastQuestion ? 'See Results' : 'Next'}
				</Button>
			</div>
		{/if}
	{:else}
		<div class="flex flex-col items-center gap-4 py-4 text-center">
			{#if outOfHearts}
				<!-- Out of hearts — failed -->
				<div class="text-4xl">💔</div>
				<h3 class="text-xl font-semibold text-text">Out of Hearts!</h3>
				<p class="text-sm text-text-muted">
					You ran out of hearts. Review the material and try again.
				</p>
				<div class="mt-2 flex gap-3">
					<Button variant="secondary" onclick={resetQuiz}>Try Again</Button>
					<Button onclick={handleContinue}>Continue Anyway</Button>
				</div>
			{:else}
				<div class="text-4xl">{passed ? '🎯' : '📝'}</div>
				<h3 class="text-xl font-semibold text-text">
					{passed ? 'Great job!' : 'Keep learning!'}
				</h3>

				<!-- Score + hearts summary -->
				<div class="flex items-center justify-center gap-6">
					<div class="flex flex-col items-center">
						<span class="text-2xl font-bold {passed ? 'text-success' : 'text-error'}">{Math.round(totalScore * 100)}%</span>
						<span class="text-xs text-text-muted">Accuracy</span>
					</div>
					<div class="h-8 w-px bg-surface-raised"></div>
					<div class="flex flex-col items-center">
						<span class="text-2xl font-bold text-primary">{questionsCorrect}/{questionCount}</span>
						<span class="text-xs text-text-muted">Correct</span>
					</div>
					<div class="h-8 w-px bg-surface-raised"></div>
					<div class="flex flex-col items-center">
						<HeartIndicator {hearts} maxHearts={MAX_HEARTS} />
						<span class="mt-0.5 text-xs text-text-muted">Hearts</span>
					</div>
				</div>

				<p class="text-sm text-text-muted">
					{passed
						? 'You demonstrated solid comprehension of this lesson.'
						: 'Review the material and try again, or continue to the next section.'}
				</p>

				{#if quote}
					<div class="mt-2 w-full text-left">
						<SamQuote {quote} />
					</div>
				{/if}

				<div class="mt-2 flex gap-3">
					{#if !passed}
						<Button variant="secondary" onclick={resetQuiz}>Try Again</Button>
					{/if}
					<Button onclick={handleContinue}>Continue</Button>
				</div>
			{/if}
		</div>
	{/if}
</Card>
