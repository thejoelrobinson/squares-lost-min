<script lang="ts">
	interface Props {
		currentPhase: 'podcast' | 'comprehension' | 'reward';
		lessonTitle: string;
	}

	let { currentPhase, lessonTitle }: Props = $props();

	const phases = ['podcast', 'comprehension', 'reward'] as const;
	const labels = { podcast: 'Learn', comprehension: 'Check-In', reward: 'Reward' };

	function getPhaseStatus(phase: (typeof phases)[number]) {
		const currentIndex = phases.indexOf(currentPhase);
		const phaseIndex = phases.indexOf(phase);
		if (phaseIndex < currentIndex) return 'completed';
		if (phaseIndex === currentIndex) return 'active';
		return 'upcoming';
	}
</script>

<nav aria-label="Lesson progress: {lessonTitle}" class="w-full">
	<div class="mb-2 text-sm font-medium text-text-muted">{lessonTitle}</div>
	<div class="flex gap-1">
		{#each phases as phase (phase)}
			{@const status = getPhaseStatus(phase)}
			<div class="flex-1">
				<div
					class="h-2 rounded-full transition-colors duration-300"
					class:bg-primary={status === 'active'}
					class:bg-success={status === 'completed'}
					class:bg-surface-raised={status === 'upcoming'}
				></div>
				<div
					class="mt-1 text-center text-xs transition-colors duration-300"
					class:text-text={status === 'active'}
					class:text-success={status === 'completed'}
					class:text-text-muted={status === 'upcoming'}
				>
					{labels[phase]}
				</div>
			</div>
		{/each}
	</div>
</nav>
