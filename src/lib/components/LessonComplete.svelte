<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import SparkCoin from '$lib/components/SparkCoin.svelte';
	import SoundEffects from '$lib/utils/soundEffects';

	interface Props {
		lessonTitle: string;
		accuracy: number;
		questionsCorrect: number;
		questionsTotal: number;
		heartsRemaining: number;
		heartsTotal: number;
		onContinue: () => void;
	}

	let {
		lessonTitle,
		accuracy,
		questionsCorrect,
		questionsTotal,
		heartsRemaining,
		heartsTotal,
		onContinue
	}: Props = $props();

	let mounted = $state(false);
	let barFilled = $state(false);
	let statsVisible = $state(false);

	$effect(() => {
		const t1 = requestAnimationFrame(() => {
			mounted = true;
			// Play level up sound immediately
			SoundEffects.play('level-up');
		});
		const t2 = setTimeout(() => {
			barFilled = true;
		}, 400);
		const t3 = setTimeout(() => {
			statsVisible = true;
		}, 900);
		return () => {
			cancelAnimationFrame(t1);
			clearTimeout(t2);
			clearTimeout(t3);
		};
	});
</script>

<div class="lesson-complete" class:lesson-complete-visible={mounted}>
	<!-- Header -->
	<div class="mb-2 text-center">
		<h2 class="text-2xl font-bold text-text">Lesson Complete!</h2>
		<p class="mt-1 text-sm text-text-muted">{lessonTitle}</p>
	</div>

	<!-- Reward section -->
	<div class="reward-section">
		<div class="coin-reveal" class:coin-visible={barFilled}>
			<SparkCoin size={72} />
		</div>
		<div class="reward-label" class:reward-label-visible={barFilled}>
			<span class="text-lg font-semibold text-accent">Spark Point</span>
			<span class="text-sm text-text-muted">ready to claim</span>
		</div>
	</div>

	<!-- Animated progress bar -->
	<div class="mx-auto w-full max-w-xs">
		<div class="h-3 overflow-hidden rounded-full bg-surface-raised">
			<div
				class="xp-bar h-full rounded-full bg-accent"
				class:xp-bar-filled={barFilled}
				style="--target-width: 100%;"
			></div>
		</div>
	</div>

	<!-- Stats grid -->
	<div class="stats-grid" class:stats-visible={statsVisible}>
		<div class="stat-card">
			<span class="stat-value {accuracy >= 0.8 ? 'text-success' : accuracy >= 0.6 ? 'text-accent' : 'text-error'}">
				{Math.round(accuracy * 100)}%
			</span>
			<span class="stat-label">Accuracy</span>
		</div>

		<div class="stat-card">
			<span class="stat-value text-primary">
				{questionsCorrect}/{questionsTotal}
			</span>
			<span class="stat-label">Correct</span>
		</div>

		<div class="stat-card">
			<span class="stat-value text-error">
				{#each { length: heartsTotal } as _, i (i)}
					<span class="heart" class:heart-lost={i >= heartsRemaining}>
						{i < heartsRemaining ? '❤️' : '🤍'}
					</span>
				{/each}
			</span>
			<span class="stat-label">Hearts</span>
		</div>
	</div>

	<!-- Continue button -->
	<div class="mt-2" class:stats-visible={statsVisible}>
		<Button onclick={onContinue} size="lg">Claim Spark Point</Button>
	</div>
</div>

<style>
	.lesson-complete {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		padding: 2rem 1.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-surface-raised);
		border-radius: 1.5rem;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
		opacity: 0;
		transform: translateY(20px);
		transition:
			opacity 0.5s ease-out,
			transform 0.5s ease-out;
	}

	.lesson-complete-visible {
		opacity: 1;
		transform: translateY(0);
	}

	/* Reward section */
	.reward-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.coin-reveal {
		opacity: 0;
		transform: scale(0.5);
		transition:
			opacity 0.4s ease-out,
			transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.coin-reveal.coin-visible {
		opacity: 1;
		transform: scale(1);
	}

	.reward-label {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		opacity: 0;
		transform: scale(0.5);
		transition:
			opacity 0.4s ease-out,
			transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.reward-label.reward-label-visible {
		opacity: 1;
		transform: scale(1);
	}

	/* Animated XP bar */
	.xp-bar {
		width: 0%;
		transition: width 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
	}

	.xp-bar.xp-bar-filled {
		width: var(--target-width);
	}

	/* Stats grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
		width: 100%;
		max-width: 20rem;
		opacity: 0;
		transform: translateY(12px);
		transition:
			opacity 0.4s ease-out 0.1s,
			transform 0.4s ease-out 0.1s;
	}

	.stats-grid.stats-visible {
		opacity: 1;
		transform: translateY(0);
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem 0.5rem;
		border-radius: 0.75rem;
		background: var(--color-surface-raised);
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1.2;
	}

	.stat-label {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}

	.heart {
		font-size: 0.9rem;
	}

	.heart-lost {
		opacity: 0.4;
	}

	/* Continue button inherits stats-visible transition via class binding in template */
</style>
