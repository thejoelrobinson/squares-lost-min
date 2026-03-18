<script lang="ts">
	interface Props {
		currentPhase: 'podcast' | 'comprehension' | 'reward';
		lessonTitle: string;
	}

	let { currentPhase, lessonTitle }: Props = $props();

	const phases = ['podcast', 'comprehension', 'reward'] as const;
	const labels = { podcast: 'Learn', comprehension: 'Practice', reward: 'Earn' };

	function phaseStatus(phase: (typeof phases)[number]) {
		const ci = phases.indexOf(currentPhase);
		const pi = phases.indexOf(phase);
		if (pi < ci) return 'done';
		if (pi === ci) return 'active';
		return 'next';
	}

	let pct = $derived.by(() => {
		const idx = phases.indexOf(currentPhase);
		return ((idx + 0.5) / phases.length) * 100;
	});
</script>

<nav aria-label="Lesson progress: {lessonTitle}" class="pbar">
	<p class="pbar-title">{lessonTitle}</p>

	<div class="pbar-track">
		<div class="pbar-fill" style="width: {pct}%"></div>

		{#each phases as phase, i (phase)}
			{@const st = phaseStatus(phase)}
			<div class="pbar-step" style="left: {((i + 0.5) / phases.length) * 100}%">
				<div class="step-dot step-{st}">
					{#if st === 'done'}
						<svg class="step-ico" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					{:else if phase === 'podcast'}
						<svg class="step-ico" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 19V13a5 5 0 1 1 6 0v6" />
						</svg>
					{:else if phase === 'comprehension'}
						<svg class="step-ico" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
						</svg>
					{:else}
						<svg class="step-ico" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
						</svg>
					{/if}
				</div>
				<span class="step-lbl" class:step-lbl-on={st !== 'next'}>{labels[phase]}</span>
			</div>
		{/each}
	</div>
</nav>

<style>
	.pbar { width: 100%; padding: 0 0.5rem; }

	.pbar-title {
		font-family: 'Outfit', system-ui, sans-serif;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-text-muted);
		margin-bottom: 2rem;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.pbar-track {
		position: relative;
		height: 6px;
		background: var(--color-surface-sunken);
		border-radius: var(--radius-full);
		margin-bottom: 2.25rem;
		box-shadow: inset 0 1px 2px oklch(16% 0.02 280 / 0.06);
	}

	.pbar-fill {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: linear-gradient(90deg, var(--color-success), var(--color-primary));
		border-radius: var(--radius-full);
		transition: width 0.6s var(--ease-out-expo);
		box-shadow: 0 1px 4px oklch(44% 0.26 280 / 0.2);
	}

	.pbar-step {
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.625rem;
	}

	.step-dot {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 3px solid var(--color-surface);
		transition: all 0.4s var(--ease-smooth);
	}

	.step-done {
		background: var(--color-success);
		color: white;
		box-shadow: 0 3px 0 var(--color-success-dark), 0 2px 8px oklch(58% 0.21 155 / 0.2);
	}

	.step-active {
		background: linear-gradient(145deg, oklch(48% 0.26 280), var(--color-primary));
		color: white;
		box-shadow:
			0 3px 0 var(--color-primary-dark),
			0 0 0 5px var(--color-primary-subtle),
			0 4px 12px oklch(44% 0.26 280 / 0.2);
		animation: step-breathe 2.2s ease-in-out infinite;
	}

	.step-next {
		background: var(--color-surface-raised);
		color: var(--color-text-subtle);
		box-shadow: 0 2px 0 var(--color-border-strong), inset 0 1px 2px oklch(100% 0 0 / 0.5);
	}

	.step-ico { width: 1rem; height: 1rem; }

	.step-lbl {
		font-family: 'Outfit', system-ui, sans-serif;
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-subtle);
		white-space: nowrap;
		transition: color 0.3s ease;
	}
	.step-lbl-on { color: var(--color-text); }

	@keyframes step-breathe {
		0%, 100% {
			box-shadow: 0 3px 0 var(--color-primary-dark), 0 0 0 5px var(--color-primary-subtle);
		}
		50% {
			box-shadow: 0 3px 0 var(--color-primary-dark), 0 0 0 10px oklch(44% 0.26 280 / 0.06);
		}
	}
</style>
