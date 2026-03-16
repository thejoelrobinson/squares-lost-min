<script lang="ts">
	interface Props {
		hearts: number;
		maxHearts?: number;
	}

	let { hearts, maxHearts = 3 }: Props = $props();

	let shakeIndex = $state<number | null>(null);
	let lastSeen: number | undefined;

	$effect(() => {
		const lost = lastSeen !== undefined && hearts < lastSeen;
		lastSeen = hearts;

		if (lost) {
			shakeIndex = hearts;
			const id = setTimeout(() => {
				shakeIndex = null;
			}, 600);
			return () => clearTimeout(id);
		}
	});
</script>

<div class="heart-indicator" role="status" aria-label="{hearts} of {maxHearts} hearts remaining">
	{#each { length: maxHearts } as _, i (i)}
		<span
			class="heart-icon"
			class:heart-full={i < hearts}
			class:heart-empty={i >= hearts}
			class:heart-shake={shakeIndex === i}
			class:heart-break={shakeIndex !== null && i === shakeIndex}
		>
			<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
				{#if i < hearts}
					<path
						d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
						fill="var(--color-error)"
					/>
				{:else}
					<path
						d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
						fill="none"
						stroke="var(--color-text-muted)"
						stroke-width="1.5"
						opacity="0.35"
					/>
				{/if}
			</svg>
		</span>
	{/each}
</div>

<style>
	.heart-indicator {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.heart-icon {
		display: inline-flex;
		transition: transform 0.2s ease, opacity 0.3s ease;
	}

	.heart-full {
		transform: scale(1);
	}

	.heart-empty {
		transform: scale(0.85);
		opacity: 0.5;
	}

	/* Shake + break animation when a heart is lost */
	.heart-shake {
		animation: heart-shake 0.5s ease-out;
	}

	.heart-break {
		animation: heart-break 0.6s ease-out forwards;
	}

	@keyframes heart-shake {
		0%, 100% { transform: translateX(0) scale(1); }
		15% { transform: translateX(-4px) scale(1.1); }
		30% { transform: translateX(4px) scale(1.1); }
		45% { transform: translateX(-3px) scale(1.05); }
		60% { transform: translateX(3px) scale(1); }
		75% { transform: translateX(-1px); }
	}

	@keyframes heart-break {
		0% {
			transform: scale(1.2);
			opacity: 1;
			filter: saturate(1.5);
		}
		30% {
			transform: scale(0.9);
			opacity: 0.8;
		}
		100% {
			transform: scale(0.85);
			opacity: 0.5;
			filter: saturate(0);
		}
	}
</style>
