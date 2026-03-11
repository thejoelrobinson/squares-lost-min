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
		onComplete: (score: number) => void;
	} = $props();

	let mode = $state<'quiz' | 'voice'>('quiz');
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-bold text-text">Comprehension Check</h2>
		<div class="flex gap-2">
			<Button
				variant={mode === 'quiz' ? 'primary' : 'secondary'}
				size="sm"
				onclick={() => (mode = 'quiz')}
			>
				Quiz
			</Button>
			<Button
				variant={mode === 'voice' ? 'primary' : 'secondary'}
				size="sm"
				onclick={() => (mode = 'voice')}
			>
				Voice
			</Button>
		</div>
	</div>

	{#if mode === 'quiz'}
		{#if quiz.length > 0}
			<QuizContainer questions={quiz} {onComplete} />
		{:else}
			<div class="rounded-xl bg-surface-raised p-8 text-center">
				<p class="text-text-muted">No quiz questions available for this lesson.</p>
				<div class="mt-4">
					<Button onclick={() => onComplete(1)}>Continue</Button>
				</div>
			</div>
		{/if}
	{:else if mode === 'voice'}
		<VoiceChat {lessonId} {lessonSlug} {onComplete} />
	{/if}
</div>
