<div class="confetti-burst" aria-hidden="true">
	{#each Array(8) as _, i (i)}
		<div
			class="confetti-dot"
			style="--angle: {i * 45}deg; --delay: {i * 30}ms"
		></div>
	{/each}
</div>

<style>
	.confetti-burst {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		pointer-events: none;
		z-index: 10;
	}

	.confetti-dot {
		position: absolute;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-success);
		animation: burst 0.8s ease-out forwards;
		animation-delay: var(--delay);
		opacity: 0;
	}

	.confetti-dot:nth-child(odd) {
		background: var(--color-accent);
	}

	.confetti-dot:nth-child(3n) {
		background: var(--color-primary);
	}

	@keyframes burst {
		0% {
			opacity: 1;
			transform: rotate(var(--angle)) translateX(0) scale(1);
		}
		70% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: rotate(var(--angle)) translateX(60px) scale(0.3);
		}
	}
</style>
