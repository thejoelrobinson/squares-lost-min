<script lang="ts">
	import type { StructuredFeedback } from '$lib/types';
	import Button from '$lib/components/Button.svelte';
	import FeedbackPanel from '$lib/components/FeedbackPanel.svelte';
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
		nextLessonTitle?: string;
		feedback?: StructuredFeedback;
	}

	let {
		lessonTitle,
		accuracy,
		questionsCorrect,
		questionsTotal,
		heartsRemaining,
		heartsTotal,
		onContinue,
		nextLessonTitle,
		feedback
	}: Props = $props();

	let mounted = $state(false);
	let barFilled = $state(false);
	let statsVisible = $state(false);
	let feedbackVisible = $state(false);
	let ctaVisible = $state(false);

	$effect(() => {
		const t1 = requestAnimationFrame(() => {
			mounted = true;
			SoundEffects.play('level-up');
		});
		const t2 = setTimeout(() => { barFilled = true; }, 500);
		const t3 = setTimeout(() => { statsVisible = true; }, 1100);
		const t4 = setTimeout(() => { feedbackVisible = true; }, 1400);
		const t5 = setTimeout(() => { ctaVisible = true; }, feedback ? 1600 : 1300);
		return () => {
			cancelAnimationFrame(t1);
			clearTimeout(t2);
			clearTimeout(t3);
			clearTimeout(t4);
			clearTimeout(t5);
		};
	});
</script>

<div class="cel" class:cel-in={mounted}>
	<!-- Trophy -->
	<div class="cel-trophy">
		<div class="trophy-glow"></div>
		<div class="trophy-circle">
			<svg viewBox="0 0 24 24" fill="currentColor" class="trophy-icon">
				<path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
			</svg>
		</div>
	</div>

	<h2 class="cel-title">Lesson Complete!</h2>
	<p class="cel-sub">{lessonTitle}</p>

	<!-- Spark point reveal -->
	<div class="cel-spark" class:cel-spark-in={barFilled}>
		<SparkCoin size={60} />
		<div class="spark-info">
			<span class="spark-name">Spark Point</span>
			<span class="spark-hint">ready to claim</span>
		</div>
	</div>

	<!-- XP bar -->
	<div class="xp-track">
		<div class="xp-fill" class:xp-filled={barFilled}></div>
	</div>

	<!-- Stats -->
	<div class="cel-stats" class:cel-stats-in={statsVisible}>
		<div class="stat-box">
			<span class="stat-num" class:stat-green={accuracy >= 0.8} class:stat-gold={accuracy >= 0.6 && accuracy < 0.8} class:stat-red={accuracy < 0.6}>
				{Math.round(accuracy * 100)}%
			</span>
			<span class="stat-tag">Accuracy</span>
		</div>
		<div class="stat-box">
			<span class="stat-num stat-purple">{questionsCorrect}/{questionsTotal}</span>
			<span class="stat-tag">Correct</span>
		</div>
		<div class="stat-box">
			<span class="stat-num">
				{#each { length: heartsTotal } as _, i (i)}
					<svg class="stat-heart" class:stat-heart-gone={i >= heartsRemaining} viewBox="0 0 24 24" width="18" height="18">
						<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
							fill={i < heartsRemaining ? 'var(--color-error)' : 'var(--color-border-strong)'} />
					</svg>
				{/each}
			</span>
			<span class="stat-tag">Hearts</span>
		</div>
	</div>

	{#if feedback && feedbackVisible}
		<div class="cel-feedback" class:cel-feedback-in={feedbackVisible}>
			<FeedbackPanel {feedback} />
		</div>
	{/if}

	<div class="cel-cta" class:cel-cta-in={ctaVisible}>
		<Button onclick={onContinue} size="lg" variant="cta" fullWidth>Claim Spark Point</Button>
		{#if nextLessonTitle}
			<p class="cel-next">
				<span class="cel-next-label">Up next</span>
				<span class="cel-next-title">{nextLessonTitle}</span>
			</p>
		{/if}
	</div>
</div>

<style>
	.cel {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2.5rem 1.5rem 2rem;
		background: var(--color-surface);
		border: 1px solid oklch(0% 0 0 / 0.05);
		border-bottom-width: 4px;
		border-bottom-color: var(--color-border-strong);
		border-radius: var(--radius-2xl);
		box-shadow:
			0 4px 16px oklch(16% 0.02 280 / 0.06),
			0 12px 40px oklch(16% 0.02 280 / 0.04);
		opacity: 0;
		transform: translateY(20px) scale(0.97);
		transition: opacity 0.5s var(--ease-out-expo), transform 0.6s var(--ease-bounce);
	}
	.cel-in { opacity: 1; transform: translateY(0) scale(1); }

	/* ── Trophy ── */
	.cel-trophy { position: relative; margin-bottom: 0.25rem; }

	.trophy-glow {
		position: absolute;
		inset: -16px;
		border-radius: 50%;
		background: radial-gradient(circle, var(--color-accent) 0%, transparent 70%);
		opacity: 0;
		animation: trophy-pulse 2s ease-in-out 0.3s infinite;
	}

	.trophy-circle {
		width: 4.5rem;
		height: 4.5rem;
		border-radius: 50%;
		background: linear-gradient(145deg, var(--color-accent), var(--color-accent-dark));
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 4px solid var(--color-accent-dark);
		position: relative;
		box-shadow: 0 4px 16px oklch(78% 0.155 70 / 0.3), 0 1px 4px oklch(16% 0.02 280 / 0.1);
	}

	.trophy-icon { width: 2rem; height: 2rem; color: white; }

	@keyframes trophy-pulse {
		0%, 100% { opacity: 0; transform: scale(0.8); }
		50% { opacity: 0.2; transform: scale(1.2); }
	}

	/* ── Text ── */
	.cel-title {
		font-size: 1.75rem;
		font-weight: 800;
		color: var(--color-text);
	}

	.cel-sub {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin-top: -0.5rem;
	}

	/* ── Spark ── */
	.cel-spark {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.5rem;
		border-radius: var(--radius-xl);
		background: linear-gradient(135deg, oklch(78% 0.155 70 / 0.06) 0%, oklch(78% 0.155 70 / 0.02) 100%);
		border: 1px solid oklch(78% 0.155 70 / 0.12);
		border-bottom-width: 3px;
		border-bottom-color: oklch(78% 0.155 70 / 0.15);
		opacity: 0;
		transform: scale(0.85);
		transition: opacity 0.4s ease, transform 0.5s var(--ease-bounce);
	}
	.cel-spark-in { opacity: 1; transform: scale(1); }

	.spark-info { display: flex; flex-direction: column; }
	.spark-name {
		font-family: 'Bricolage Grotesque', system-ui, sans-serif;
		font-size: 1.125rem;
		font-weight: 800;
		color: var(--color-accent-dark);
		letter-spacing: -0.02em;
	}
	.spark-hint { font-size: 0.75rem; font-weight: 500; color: var(--color-text-muted); }

	/* ── XP ── */
	.xp-track {
		width: 100%;
		max-width: 16rem;
		height: 0.5rem;
		border-radius: var(--radius-full);
		background: var(--color-surface-raised);
		overflow: hidden;
	}

	.xp-fill {
		width: 0%;
		height: 100%;
		border-radius: var(--radius-full);
		background: linear-gradient(90deg, var(--color-accent), var(--color-accent-dark));
		transition: width 1s var(--ease-out-expo);
	}
	.xp-filled { width: 100%; }

	/* ── Stats ── */
	.cel-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
		width: 100%;
		max-width: 20rem;
		opacity: 0;
		transform: translateY(10px);
		transition: opacity 0.4s ease, transform 0.5s var(--ease-bounce);
	}
	.cel-stats-in { opacity: 1; transform: translateY(0); }

	.stat-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem;
		padding: 0.875rem 0.5rem;
		border-radius: var(--radius-lg);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		box-shadow: 0 1px 3px oklch(16% 0.02 280 / 0.04);
	}

	.stat-num {
		font-family: 'Bricolage Grotesque', system-ui, sans-serif;
		font-size: 1.375rem;
		font-weight: 800;
		line-height: 1.1;
		display: flex;
		align-items: center;
		gap: 0.125rem;
	}

	.stat-green { color: var(--color-success); }
	.stat-gold { color: var(--color-accent-dark); }
	.stat-red { color: var(--color-error); }
	.stat-purple { color: var(--color-primary); }

	.stat-tag {
		font-family: 'Outfit', system-ui, sans-serif;
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	.stat-heart { display: inline-block; }
	.stat-heart-gone { opacity: 0.25; }

	/* ── Feedback ── */
	.cel-feedback {
		width: 100%;
		max-width: 24rem;
		opacity: 0;
		transform: translateY(10px);
		transition: opacity 0.4s ease, transform 0.5s var(--ease-bounce);
	}
	.cel-feedback-in { opacity: 1; transform: translateY(0); }

	/* ── CTA ── */
	.cel-cta {
		margin-top: 0.5rem;
		width: 100%;
		max-width: 20rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		opacity: 0;
		transform: translateY(10px);
		transition: opacity 0.4s ease, transform 0.5s var(--ease-bounce);
	}
	.cel-cta-in { opacity: 1; transform: translateY(0); }

	.cel-next {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.125rem;
	}

	.cel-next-label {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	.cel-next-title {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-primary);
	}
</style>
