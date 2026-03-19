<script lang="ts">
	import Button from './Button.svelte';

	const STORAGE_KEY = 'feedbackloop-welcome-dismissed';

	let visible = $state(false);
	let currentSlide = $state(0);
	let dontShowAgain = $state(true);

	const slides = [
		{
			icon: 'mic' as const,
			title: 'Talk with Jamie',
			description:
				'Practice feedback out loud after each episode. Just talk — Jamie listens and coaches you.',
			bg: 'var(--color-primary)',
			bgLight: 'oklch(52% 0.26 280)'
		},
		{
			icon: 'ask' as const,
			title: 'Ask Anything',
			description:
				'Tap "Ask Jamie" anytime during a podcast or article. No question is too small.',
			bg: 'var(--color-secondary)',
			bgLight: 'oklch(28% 0.08 280)'
		},
		{
			icon: 'quiz' as const,
			title: 'Earn Sparks',
			description:
				'Complete quizzes and puzzles to collect sparks. Prefer typing? That works too.',
			bg: 'oklch(68% 0.155 70)',
			bgLight: 'oklch(75% 0.155 70)'
		},
		{
			icon: 'roleplay' as const,
			title: 'Real Practice',
			description:
				'Roleplay giving feedback in test lessons. Jamie plays the person — you practice the hard conversation.',
			bg: 'var(--color-success)',
			bgLight: 'oklch(65% 0.21 155)'
		}
	];

	let slide = $derived(slides[currentSlide]);
	let isLast = $derived(currentSlide === slides.length - 1);

	$effect(() => {
		try {
			if (localStorage.getItem(STORAGE_KEY) !== 'true') {
				visible = true;
			}
		} catch {
			visible = true;
		}
	});

	function next() {
		if (isLast) {
			dismiss();
		} else {
			currentSlide += 1;
		}
	}

	function dismiss() {
		visible = false;
		try {
			if (dontShowAgain) {
				localStorage.setItem(STORAGE_KEY, 'true');
			}
		} catch {
			// localStorage unavailable
		}
	}

	function reset() {
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			// localStorage unavailable
		}
		currentSlide = 0;
		dontShowAgain = true;
		visible = true;
	}

	export { reset };
</script>

{#if visible}
	<div
		class="tour-backdrop"
		role="dialog"
		tabindex="-1"
		aria-modal="true"
		aria-label="Welcome tour"
		onkeydown={(e) => {
			if (e.key === 'Escape') dismiss();
		}}
	>
		<button
			type="button"
			class="tour-backdrop-dismiss"
			onclick={dismiss}
			aria-label="Close tour"
			tabindex="-1"
		></button>

		<div class="tour-card">
			<!-- Colored slide area -->
			<div class="tour-scene-area" style:background="linear-gradient(135deg, {slide.bg}, {slide.bgLight})">
				<!-- Step counter -->
				<div class="tour-step-pill">{currentSlide + 1} of {slides.length}</div>

				<!-- Illustrative scene -->
				{#key currentSlide}
					<div class="tour-scene">
						{#if slide.icon === 'mic'}
							<!-- Mic with sound waves -->
							<svg class="tour-illustration" viewBox="0 0 160 120" fill="none">
								<!-- Mic body -->
								<rect x="66" y="20" width="28" height="52" rx="14" fill="white" opacity="0.95" />
								<!-- Mic stand -->
								<path d="M80 72v16" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.8" />
								<path d="M68 88h24" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.8" />
								<!-- Mic arc -->
								<path d="M56 52a24 24 0 0048 0" stroke="white" stroke-width="2.5" fill="none" opacity="0.6" stroke-linecap="round" />
								<!-- Sound waves — each has transform-box so scaleX works from its own edge -->
								<path class="wave wave-1" d="M110 36a18 18 0 010 28" stroke="white" stroke-width="2.5" stroke-linecap="round" />
								<path class="wave wave-2" d="M120 28a28 28 0 010 44" stroke="white" stroke-width="2" stroke-linecap="round" />
								<path class="wave wave-3" d="M130 20a38 38 0 010 60" stroke="white" stroke-width="1.5" stroke-linecap="round" />
							</svg>
						{:else if slide.icon === 'ask'}
							<!-- Chat bubbles -->
							<svg class="tour-illustration" viewBox="0 0 160 120" fill="none">
								<!-- Left bubble (user) — enters from left -->
								<g class="bubble bubble-left">
									<rect x="20" y="28" width="72" height="40" rx="16" fill="white" opacity="0.9" />
									<polygon points="40,68 48,80 56,68" fill="white" opacity="0.9" />
									<!-- Dots -->
									<circle cx="42" cy="48" r="3.5" fill="currentColor" opacity="0.25" />
									<circle cx="56" cy="48" r="3.5" fill="currentColor" opacity="0.25" />
									<circle cx="70" cy="48" r="3.5" fill="currentColor" opacity="0.25" />
								</g>
								<!-- Right bubble (Jamie) — enters from right, delayed -->
								<g class="bubble bubble-right">
									<rect x="68" y="48" width="72" height="40" rx="16" fill="white" opacity="0.7" />
									<polygon points="120,88 112,100 104,88" fill="white" opacity="0.7" />
									<!-- Question mark -->
									<text x="104" y="75" text-anchor="middle" fill="currentColor" opacity="0.3" font-size="24" font-weight="800">?</text>
								</g>
							</svg>
						{:else if slide.icon === 'quiz'}
							<!-- Lightbulb with orbiting spark -->
							<svg class="tour-illustration" viewBox="0 0 160 120" fill="none">
								<!-- Bulb glass -->
								<path d="M80 18a26 26 0 0116.5 46.1c1.5 2 2.5 4.2 2.5 6.4V76a4 4 0 01-4 4H65a4 4 0 01-4-4v-5.5c0-2.2 1-4.4 2.5-6.4A26 26 0 0180 18z" fill="white" opacity="0.9" />
								<!-- Filament lines -->
								<path d="M74 60l6-12 6 12" stroke="currentColor" stroke-width="1.5" opacity="0.2" stroke-linecap="round" stroke-linejoin="round" />
								<!-- Base rings -->
								<rect x="69" y="80" width="22" height="4" rx="2" fill="white" opacity="0.7" />
								<rect x="72" y="86" width="16" height="4" rx="2" fill="white" opacity="0.5" />
								<!-- Orbiting spark — group centered at bulb, polygon offset to orbit radius -->
								<g class="orbit-group">
									<polygon class="orbit-spark-shape" points="118,44 119.8,48.2 124,50 119.8,51.8 118,56 116.2,51.8 112,50 116.2,48.2" fill="white" opacity="0.9" />
								</g>
								<!-- Glow rays -->
								<line class="ray ray-1" x1="80" y1="4" x2="80" y2="10" stroke="white" stroke-width="2" stroke-linecap="round" />
								<line class="ray ray-2" x1="52" y1="30" x2="46" y2="26" stroke="white" stroke-width="2" stroke-linecap="round" />
								<line class="ray ray-3" x1="108" y1="30" x2="114" y2="26" stroke="white" stroke-width="2" stroke-linecap="round" />
							</svg>
						{:else if slide.icon === 'roleplay'}
							<!-- Two silhouettes facing each other -->
							<svg class="tour-illustration" viewBox="0 0 160 120" fill="none">
								<!-- Left person -->
								<g class="person person-left">
									<circle cx="48" cy="38" r="14" fill="white" opacity="0.9" />
									<path d="M24 90a24 24 0 0148 0" fill="white" opacity="0.7" />
								</g>
								<!-- Right person -->
								<g class="person person-right">
									<circle cx="112" cy="38" r="14" fill="white" opacity="0.9" />
									<path d="M88 90a24 24 0 0148 0" fill="white" opacity="0.7" />
								</g>
								<!-- Speech connector — fades in last -->
								<g class="connector">
									<line x1="68" y1="50" x2="92" y2="50" stroke="white" stroke-width="2" stroke-dasharray="4 3" opacity="0.6" />
									<polygon points="90,46 96,50 90,54" fill="white" opacity="0.6" />
									<polygon points="70,46 64,50 70,54" fill="white" opacity="0.6" />
								</g>
							</svg>
						{/if}
					</div>
				{/key}
			</div>

			<!-- White content area -->
			<div class="tour-content">
				{#key currentSlide}
					<div class="tour-text-enter">
						<h2 class="tour-title">{slide.title}</h2>
						<p class="tour-desc">{slide.description}</p>

						<!-- Voice preview on mic slide -->
						{#if slide.icon === 'mic'}
							<div class="tour-preview">
								<div class="preview-bubble preview-bubble--ai">
									<span class="preview-label">Jamie</span>
									How would you deliver that feedback?
								</div>
								<div class="preview-bubble preview-bubble--user">
									<span class="preview-label">You</span>
									I'd start by describing what I observed...
								</div>
							</div>
						{/if}
					</div>
				{/key}

				<!-- Progress dots -->
				<div class="tour-dots">
					{#each slides as s, i (i)}
						<button
							type="button"
							class="tour-dot"
							class:tour-dot--active={i === currentSlide}
							style:--dot-bg={s.bg}
							onclick={() => (currentSlide = i)}
							aria-label="Go to slide {i + 1}"
						></button>
					{/each}
				</div>

				<!-- CTA Button -->
				<div class="tour-cta">
					<Button variant="cta" size="lg" fullWidth onclick={next}>
						{#if isLast}
							Let's Go!
						{:else}
							Next
							<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" style="width:0.875rem;height:0.875rem">
								<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
							</svg>
						{/if}
					</Button>
				</div>

				<!-- Footer -->
				<div class="tour-footer">
					<button type="button" class="tour-skip" onclick={dismiss}>Skip</button>
					<label class="tour-toggle">
						<input type="checkbox" bind:checked={dontShowAgain} />
						<span>Don't show again</span>
					</label>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* ═══════════════════════════════════════════
	   OPENING SEQUENCE (staggered cascade)
	   ───────────────────────────────────────────
	   0.00s  backdrop fades in           (0.25s)
	   0.05s  card slides up, no bounce   (0.35s)
	   0.00s  scene bounces via easing    (0.45s)
	   0.15s  text fades up               (0.3s)
	   0.50s  looping anims begin (waves, orbit)
	   ═══════════════════════════════════════════ */

	.tour-backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		background: oklch(16% 0.02 280 / 0.6);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		animation: tour-fade-in 0.25s ease-out both;
	}

	.tour-backdrop-dismiss {
		position: absolute;
		inset: 0;
		border: none;
		background: none;
		cursor: pointer;
	}

	@keyframes tour-fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* ─── Card: smooth slide-up, NO bounce (scene provides bounce) ─── */
	.tour-card {
		position: relative;
		width: 100%;
		max-width: 22rem;
		border-radius: var(--radius-2xl);
		background: var(--color-surface);
		overflow: hidden;
		box-shadow:
			0 8px 40px oklch(16% 0.02 280 / 0.25),
			0 2px 8px oklch(16% 0.02 280 / 0.1);
		animation: tour-card-in 0.35s var(--ease-out-expo) 0.05s both;
	}

	@keyframes tour-card-in {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ─── Colored scene area ─── */
	.tour-scene-area {
		position: relative;
		padding: 1.25rem 1.5rem 1rem;
		min-height: 11rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}

	.tour-step-pill {
		position: absolute;
		top: 0.875rem;
		left: 0.875rem;
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		color: white;
		background: oklch(100% 0 0 / 0.2);
		padding: 0.25rem 0.625rem;
		border-radius: var(--radius-full);
	}

	/* ─── Scene entrance: ease-bounce does the overshoot naturally ─── */
	.tour-scene {
		animation: slide-bounce-in 0.45s var(--ease-bounce) both;
	}

	@keyframes slide-bounce-in {
		from {
			opacity: 0;
			transform: scale(0.7) translateY(12px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.tour-illustration {
		width: 10rem;
		height: 7.5rem;
		display: block;
		color: white;
	}

	/* ═══════════════════════════════════════════
	   LOOPING ANIMATIONS — delayed until entrance settles
	   ═══════════════════════════════════════════ */

	/* ─── Sound waves (mic slide) ───
	   transform-box: fill-box makes scaleX expand from the arc's own left edge,
	   so waves push outward from the mic rather than stretching from SVG origin.
	   Stagger: each wave starts 0.3s after the previous.
	   Hold at opacity 0 for half the cycle so waves "breathe." */
	.wave {
		transform-box: fill-box;
		transform-origin: left center;
		animation: wave-pulse 1.8s ease-in-out infinite;
	}

	.wave-1 { animation-delay: 0.5s; }
	.wave-2 { animation-delay: 0.8s; }
	.wave-3 { animation-delay: 1.1s; }

	@keyframes wave-pulse {
		0% {
			opacity: 0.7;
			transform: scaleX(1);
		}
		40% {
			opacity: 0;
			transform: scaleX(1.3);
		}
		100% {
			opacity: 0;
			transform: scaleX(1.3);
		}
	}

	/* ─── Chat bubbles (ask slide) ───
	   Left bubble slides in from left, right follows 0.15s later from right */
	.bubble {
		animation: bubble-in 0.4s var(--ease-out-expo) both;
	}

	.bubble-left { animation-delay: 0.25s; }
	.bubble-right { animation-delay: 0.45s; }

	@keyframes bubble-in {
		from {
			opacity: 0;
			transform: translateY(8px) scale(0.9);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* ─── Orbit spark (quiz slide) ───
	   Group rotates around bulb center (80, 50) in viewBox coords.
	   Polygon is positioned at (118, 50) — 38 units from center.
	   Delayed 0.5s so bulb settles first. Slow 5s orbit feels ambient. */
	.orbit-group {
		transform-box: view-box;
		transform-origin: 80px 50px;
		animation: orbit 5s linear 0.5s infinite;
	}

	@keyframes orbit {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	/* Glow rays pulse gently after entrance */
	.ray {
		animation: ray-pulse 2.5s ease-in-out 0.6s infinite;
	}

	.ray-2 { animation-delay: 1.0s; }
	.ray-3 { animation-delay: 1.4s; }

	@keyframes ray-pulse {
		0%, 100% { opacity: 0.5; }
		50% { opacity: 0.15; }
	}

	/* ─── Roleplay silhouettes ───
	   People slide in from sides, connector fades in last */
	.person {
		animation: person-in 0.4s var(--ease-out-expo) both;
	}

	.person-left { animation-delay: 0.2s; }
	.person-right { animation-delay: 0.35s; }

	@keyframes person-in {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.connector {
		animation: connector-in 0.35s ease-out 0.55s both;
	}

	@keyframes connector-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* ═══════════════════════════════════════════
	   WHITE CONTENT AREA
	   ═══════════════════════════════════════════ */

	.tour-content {
		padding: 1.25rem 1.5rem 1rem;
		background: var(--color-surface);
	}

	/* Text cascades 0.15s after scene starts — arrives as scene settles */
	.tour-text-enter {
		text-align: center;
		animation: text-fade-up 0.3s var(--ease-out-expo) 0.15s both;
	}

	@keyframes text-fade-up {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.tour-title {
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--color-text);
		letter-spacing: -0.03em;
		margin-bottom: 0.375rem;
	}

	.tour-desc {
		font-size: 0.875rem;
		line-height: 1.55;
		color: var(--color-text-muted);
		max-width: 18rem;
		margin: 0 auto;
	}

	/* ─── Progress dots ─── */
	.tour-dots {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem 0 0.75rem;
	}

	.tour-dot {
		width: 0.625rem;
		height: 0.625rem;
		border-radius: var(--radius-full);
		border: none;
		background: var(--color-border-strong);
		cursor: pointer;
		padding: 0;
		transition:
			width 0.3s var(--ease-bounce),
			background 0.3s ease;
	}

	.tour-dot--active {
		background: var(--dot-bg, var(--color-primary));
		width: 1.75rem;
	}

	/* ─── CTA ─── */
	.tour-cta {
		padding: 0.25rem 0;
	}

	/* ─── Footer ─── */
	.tour-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0 0.25rem;
	}

	.tour-skip {
		border: none;
		background: none;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-muted);
		cursor: pointer;
		padding: 0.375rem 0;
		transition: color 0.15s ease;
	}

	.tour-skip:hover {
		color: var(--color-text);
	}

	.tour-toggle {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.6875rem;
		color: var(--color-text-subtle);
		cursor: pointer;
		user-select: none;
	}

	.tour-toggle input {
		accent-color: var(--color-primary);
		width: 0.8125rem;
		height: 0.8125rem;
		cursor: pointer;
	}

	/* ─── Voice preview bubbles (mic slide) ─── */
	.tour-preview {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		width: 100%;
		margin-top: 0.75rem;
	}

	.preview-bubble {
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius-lg);
		font-size: 0.75rem;
		line-height: 1.45;
		max-width: 80%;
		text-align: left;
	}

	.preview-label {
		display: block;
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin-bottom: 0.125rem;
		opacity: 0.6;
	}

	.preview-bubble--ai {
		background: var(--color-surface-raised);
		color: var(--color-text);
		align-self: flex-start;
	}

	.preview-bubble--user {
		background: var(--color-primary);
		color: white;
		align-self: flex-end;
	}

	/* ─── Reduced motion ─── */
	@media (prefers-reduced-motion: reduce) {
		.tour-backdrop,
		.tour-card,
		.tour-scene,
		.tour-text-enter,
		.wave,
		.bubble,
		.orbit-group,
		.ray,
		.person,
		.connector {
			animation: none !important;
		}

		.tour-dot {
			transition: none !important;
		}
	}
</style>
