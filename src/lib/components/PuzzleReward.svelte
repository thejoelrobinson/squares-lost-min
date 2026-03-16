<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import SparkCoin from '$lib/components/SparkCoin.svelte';
	import SoundEffects from '$lib/utils/soundEffects';

	interface Props {
		earnedCount: number;
		totalCount?: number;
		coinImage?: string;
		onContinue: () => void;
	}

	let { earnedCount, totalCount = 9, coinImage, onContinue }: Props = $props();

	let mounted = $state(false);

	$effect(() => {
		const id = requestAnimationFrame(() => {
			mounted = true;
			SoundEffects.play('reward');
		});
		return () => cancelAnimationFrame(id);
	});
</script>

<div class="reward-overlay">
	<div class="reward-card">
		<!-- Glow background -->
		<div class="reward-glow" class:reward-glow-visible={mounted}></div>

		<h2 class="reward-title">Spark Point Earned!</h2>

		<div class="coin-wrapper" class:coin-visible={mounted}>
			<SparkCoin size={140} backImage={coinImage} />
		</div>

		<p class="reward-count">
			<span class="reward-count-num">{earnedCount}</span>
			<span class="reward-count-sep">of</span>
			<span class="reward-count-num">{totalCount}</span>
			<span class="reward-count-text">Spark Points collected</span>
		</p>

		<!-- Confetti -->
		<div class="confetti" aria-hidden="true">
			{#each { length: 16 } as _dot, i (i)}
				<div class="confetti-dot" style="--dot-index: {i};"></div>
			{/each}
		</div>

		<Button onclick={onContinue} size="lg" variant="success">Continue</Button>
	</div>
</div>

<style>
	.reward-overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
		background: oklch(16% 0.02 280 / 0.65);
		backdrop-filter: blur(12px);
		animation: overlay-in 0.4s var(--ease-out-expo);
		padding: 1rem;
	}

	@keyframes overlay-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.reward-card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		max-width: 22rem;
		width: 100%;
		padding: 2.5rem 2rem 2rem;
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-bottom-width: 4px;
		border-bottom-color: var(--color-border-strong);
		border-radius: var(--radius-2xl);
		box-shadow: var(--shadow-xl);
		text-align: center;
		overflow: hidden;
	}

	.reward-glow {
		position: absolute;
		top: -2rem;
		left: 50%;
		transform: translateX(-50%);
		width: 12rem;
		height: 12rem;
		border-radius: 50%;
		background: var(--color-accent);
		opacity: 0;
		filter: blur(60px);
		transition: opacity 0.8s ease;
		pointer-events: none;
	}

	.reward-glow-visible {
		opacity: 0.2;
	}

	.reward-title {
		font-family: 'Bricolage Grotesque', system-ui, sans-serif;
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--color-text);
		letter-spacing: -0.03em;
		position: relative;
	}

	.coin-wrapper {
		position: relative;
		transform: scale(0);
		opacity: 0;
		transition:
			transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
			opacity 0.4s ease;
		filter: drop-shadow(0 0 0 transparent);
	}

	.coin-visible {
		transform: scale(1);
		opacity: 1;
		filter: drop-shadow(0 0 24px var(--color-reward-glow));
	}

	.reward-count {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: center;
		gap: 0.375rem;
		font-size: 0.875rem;
		color: var(--color-text-muted);
		position: relative;
	}

	.reward-count-num {
		font-weight: 800;
		font-size: 1.125rem;
		color: var(--color-text);
	}

	.reward-count-sep {
		font-weight: 500;
	}

	.reward-count-text {
		width: 100%;
		font-weight: 500;
	}

	/* ── Confetti ── */
	.confetti {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.confetti-dot {
		position: absolute;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		top: 50%;
		left: 50%;
		animation: confetti-float 2s ease-out forwards;
		animation-delay: calc(var(--dot-index) * 0.06s);
		opacity: 0;
	}

	.confetti-dot:nth-child(4n)     { background: var(--color-primary); }
	.confetti-dot:nth-child(4n + 1) { background: var(--color-accent); }
	.confetti-dot:nth-child(4n + 2) { background: var(--color-success); }
	.confetti-dot:nth-child(4n + 3) { background: var(--color-error); }

	@keyframes confetti-float {
		0% { opacity: 1; transform: translate(0, 0) scale(1); }
		100% {
			opacity: 0;
			transform: translate(
				calc(cos(calc(var(--dot-index) * 22.5deg)) * 140px),
				calc(sin(calc(var(--dot-index) * 22.5deg)) * 140px - 50px)
			) scale(0.4);
		}
	}
</style>
