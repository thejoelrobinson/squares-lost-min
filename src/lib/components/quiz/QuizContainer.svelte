<script lang="ts">
	import type { QuizQuestion } from '$lib/types';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import MultipleChoice from './MultipleChoice.svelte';
	import DragToOrder from './DragToOrder.svelte';
	import FreeformResponse from './FreeformResponse.svelte';

	let {
		questions,
		onComplete
	}: {
		questions: QuizQuestion[];
		onComplete: (score: number) => void;
	} = $props();

	let questionCount = $derived(questions.length);

	let currentIndex = $state(0);
	let scores = $state<(number | null)[]>([]);
	let showResult = $state<boolean[]>([]);
	let quizFinished = $state(false);

	$effect(() => {
		scores = Array(questionCount).fill(null);
		showResult = Array(questionCount).fill(false);
		currentIndex = 0;
		quizFinished = false;
	});

	let currentQuestion = $derived(questions[currentIndex]);
	let isLastQuestion = $derived(currentIndex === questionCount - 1);
	let hasAnsweredCurrent = $derived(showResult[currentIndex]);

	let totalScore = $derived.by(() => {
		const answered = scores.filter((s): s is number => s !== null);
		if (answered.length === 0) return 0;
		return answered.reduce((sum, s) => sum + s, 0) / answered.length;
	});

	let passed = $derived(totalScore >= 0.6);

	function handleAnswer(score: number) {
		scores[currentIndex] = score;
		showResult[currentIndex] = true;
	}

	function next() {
		if (isLastQuestion) {
			quizFinished = true;
		} else {
			currentIndex += 1;
		}
	}

	function handleContinue() {
		onComplete(totalScore);
	}
</script>

<Card>
	{#if !quizFinished}
		<div class="mb-4 flex items-center justify-between">
			<span class="text-sm text-text-muted">
				Question {currentIndex + 1} of {questions.length}
			</span>
			<div class="flex gap-1.5">
				{#each questions as _q, i (i)}
					<div
						class="h-2 w-8 rounded-full {i === currentIndex
							? 'bg-primary'
							: scores[i] !== null
								? scores[i]! >= 0.6
									? 'bg-success'
									: 'bg-error'
								: 'bg-surface'}"
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
			<div class="text-4xl">{passed ? '🎯' : '📝'}</div>
			<h3 class="text-xl font-semibold text-text">
				{passed ? 'Great job!' : 'Keep learning!'}
			</h3>
			<p class="text-lg text-text-muted">
				You scored <span class="font-bold {passed ? 'text-success' : 'text-error'}">{Math.round(totalScore * 100)}%</span>
			</p>
			<p class="text-sm text-text-muted">
				{passed
					? 'You demonstrated solid comprehension of this lesson.'
					: 'Review the material and try again, or continue to the next section.'}
			</p>
			<div class="mt-2">
				<Button onclick={handleContinue}>Continue</Button>
			</div>
		</div>
	{/if}
</Card>
