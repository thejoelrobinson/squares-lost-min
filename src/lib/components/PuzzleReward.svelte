<script lang="ts">
	import Button from '$lib/components/Button.svelte';

	interface Props {
		position: string;
		earnedCount: number;
		totalCount?: number;
		onContinue: () => void;
	}

	let { position, earnedCount, totalCount = 9, onContinue }: Props = $props();

	let mounted = $state(false);

	$effect(() => {
		// Trigger mount animation on next frame
		const id = requestAnimationFrame(() => {
			mounted = true;
		});
		return () => cancelAnimationFrame(id);
	});
</script>

<div class="reward-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50">
	<div class="reward-container bg-surface-raised mx-4 flex max-w-sm flex-col items-center gap-6 rounded-2xl p-8 text-center">
		<h2 class="text-text text-xl font-bold">Piece earned!</h2>

		<div class="piece-wrapper" class:piece-visible={mounted}>
			<img
				src="/puzzle/{position}.svg"
				alt="Puzzle piece: {position}"
				class="h-40 w-40"
			/>
		</div>

		<p class="text-text-muted text-sm">
			{earnedCount} of {totalCount} pieces collected
		</p>

		<!-- Confetti dots -->
		<div class="confetti-container" aria-hidden="true">
			{#each { length: 12 } as _dot, i (i)}
				<div class="confetti-dot" style="--dot-index: {i};"></div>
			{/each}
		</div>

		<Button onclick={onContinue}>Continue</Button>
	</div>
</div>

<style>
	.reward-overlay {
		animation: fade-in 0.3s ease-out;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.piece-wrapper {
		transform: scale(0);
		opacity: 0;
		transition:
			transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
			opacity 0.4s ease-out;
		filter: drop-shadow(0 0 0 transparent);
	}

	.piece-wrapper.piece-visible {
		transform: scale(1);
		opacity: 1;
		filter: drop-shadow(0 0 20px var(--color-reward-glow));
	}

	.confetti-container {
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
		animation-delay: calc(var(--dot-index) * 0.08s);
		opacity: 0;
	}

	.confetti-dot:nth-child(3n) {
		background: var(--color-primary);
	}

	.confetti-dot:nth-child(3n + 1) {
		background: var(--color-accent);
	}

	.confetti-dot:nth-child(3n + 2) {
		background: var(--color-secondary);
	}

	@keyframes confetti-float {
		0% {
			opacity: 1;
			transform: translate(0, 0) scale(1);
		}
		100% {
			opacity: 0;
			transform: translate(
					calc(cos(calc(var(--dot-index) * 30deg)) * 120px),
					calc(sin(calc(var(--dot-index) * 30deg)) * 120px - 40px)
				)
				scale(0.5);
		}
	}
</style>
