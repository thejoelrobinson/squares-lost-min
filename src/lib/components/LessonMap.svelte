<script lang="ts">
	import SparkCoin from '$lib/components/SparkCoin.svelte';
	import type { LessonStatus } from '$lib/types';

	interface LessonItem {
		id: string;
		partNumber: number;
		title: string;
		slug: string;
		puzzlePosition: string | null;
	}

	interface ProgressItem {
		lessonId: string;
		status: string;
		puzzleEarned: number;
	}

	interface Props {
		lessons: LessonItem[];
		progress: ProgressItem[];
		lessonObjectives?: Record<string, string[]>;
	}

	let { lessons, progress, lessonObjectives = {} }: Props = $props();

	const SVG_WIDTH = 400;
	const NODE_R = 30;
	const V_SPACE = 120;
	const PAD_TOP = 80;
	const PAD_BOT = 80;
	const MAX_TITLE = 20;

	let svgH = $derived(lessons.length * V_SPACE + PAD_TOP + PAD_BOT);
	const xPos = [115, 200, 285, 200];

	function nx(i: number) { return xPos[i % xPos.length]; }
	function ny(i: number) { return svgH - PAD_BOT - i * V_SPACE; }

	let progressMap = $derived(new Map(progress.map((p) => [p.lessonId, p])));

	function status(id: string): LessonStatus {
		return (progressMap.get(id)?.status as LessonStatus) ?? 'locked';
	}

	function href(l: LessonItem): string | null {
		const s = status(l.id);
		if (s === 'locked') return null;
		if (l.partNumber === 1) return '/onboarding';
		return `/lesson/${l.slug}`;
	}

	function splitTitle(t: string): string[] {
		if (t.length <= MAX_TITLE) return [t];
		const m = t.lastIndexOf(' ', MAX_TITLE);
		return m <= 0 ? [t] : [t.slice(0, m), t.slice(m + 1)];
	}

	function titleX(x: number) { return x > 200 ? x - NODE_R - 18 : x + NODE_R + 18; }
	function titleAnchor(x: number) { return x > 200 ? 'end' : 'start'; }

	let pathD = $derived.by(() => {
		if (!lessons.length) return '';
		const pts = lessons.map((_, i) => ({ x: nx(i), y: ny(i) }));
		let d = `M ${pts[0].x} ${pts[0].y}`;
		for (let i = 1; i < pts.length; i++) {
			const p = pts[i - 1], c = pts[i];
			const dy = (p.y - c.y) / 2;
			d += ` C ${p.x} ${p.y - dy}, ${c.x} ${c.y + dy}, ${c.x} ${c.y}`;
		}
		return d;
	});

	let currentIdx = $derived.by(() => {
		const active: LessonStatus[] = ['available', 'podcast_complete', 'comprehension_complete'];
		const idx = lessons.findIndex((l) => active.includes(status(l.id)));
		return idx >= 0 ? idx : 0;
	});

	let mapEl: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (!mapEl) return;
		const el = mapEl.querySelector(`#ln-${currentIdx}`);
		if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
	});

	let sparksEarned = $derived(progress.filter((p) => p.puzzleEarned === 1).length);

	// ── Lesson preview popup state ──
	let selectedLesson: LessonItem | null = $state(null);

	let selectedStatus = $derived.by((): LessonStatus => {
		const lesson = selectedLesson;
		if (!lesson) return 'locked';
		return status(lesson.id);
	});

	let selectedObjectives = $derived.by(() => {
		const lesson = selectedLesson;
		if (!lesson) return [] as string[];
		return lessonObjectives[lesson.slug] ?? [];
	});

	let selectedHref = $derived.by(() => {
		const lesson = selectedLesson;
		if (!lesson) return null;
		return href(lesson);
	});

	function openPreview(lesson: LessonItem) { selectedLesson = lesson; }
	function closePreview() { selectedLesson = null; }

	function handleNodeKeydown(e: KeyboardEvent, lesson: LessonItem) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openPreview(lesson);
		}
	}
</script>

<div class="map-wrap" bind:this={mapEl}>
	<a href="/puzzle" class="spark-pill">
		<SparkCoin size={22} />
		<span class="spark-pill-val">{sparksEarned}/7</span>
	</a>

	<div class="map-zones" style="height: {svgH}px">
		<div class="map-zone map-zone-advanced"></div>
		<div class="map-zone map-zone-intermediate"></div>
		<div class="map-zone map-zone-foundations"></div>
	</div>

	<svg
		viewBox="0 0 {SVG_WIDTH} {svgH}"
		width={SVG_WIDTH}
		height={svgH}
		class="map-svg"
		role="img"
		aria-label="Lesson progression map"
	>
		<defs>
			<filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="6" />
			</filter>
			<linearGradient id="path-grad" x1="0" y1="1" x2="0" y2="0">
				<stop offset="0%" stop-color="var(--color-success)" />
				<stop offset="100%" stop-color="var(--color-primary)" />
			</linearGradient>
		</defs>

		<!-- Background path — thick, dotted -->
		<path d={pathD} fill="none" stroke="var(--color-surface-sunken)" stroke-width="8" stroke-dasharray="1 16" stroke-linecap="round" />

		<!-- Completed path overlay -->
		<path d={pathD} fill="none" stroke="url(#path-grad)" stroke-width="8" stroke-dasharray="1 16" stroke-linecap="round" class="path-done" style="--done: {lessons.filter((l) => status(l.id) === 'complete').length}; --total: {lessons.length}" />

		{#each lessons as lesson, i (lesson.id)}
			{@const x = nx(i)}
			{@const y = ny(i)}
			{@const st = status(lesson.id)}
			{@const lhref = href(lesson)}
			{@const active = st !== 'locked'}
			{@const done = st === 'complete'}
			{@const current = st === 'available' || st === 'podcast_complete' || st === 'comprehension_complete'}

			<g id="ln-{i}" class="node-g" style="--delay: {i * 0.06}s">
				{#if lhref}
					<g class="node-link" tabindex="0" role="button" aria-label="Preview {lesson.title}" onclick={() => openPreview(lesson)} onkeydown={(e) => handleNodeKeydown(e, lesson)}>
						<!-- Glow behind current node -->
						{#if current}
							<circle cx={x} cy={y} r={NODE_R + 12} fill="var(--color-primary)" filter="url(#node-glow)" class="node-glow-ring" />
						{/if}

						<!-- 3D shadow ellipse -->
						{#if active}
							<ellipse cx={x} cy={y + 4} rx={NODE_R} ry={NODE_R * 0.92}
								fill={done ? 'var(--color-success-dark)' : 'var(--color-primary-dark)'}
								opacity="0.6" />
						{/if}

						<!-- Main node -->
						<circle cx={x} cy={y} r={NODE_R}
							class="node-fill"
							class:node-locked={!active}
							class:node-active={current}
							class:node-done={done} />

						<!-- Subtle inner highlight -->
						{#if active && !done}
							<ellipse cx={x} cy={y - 6} rx={NODE_R * 0.6} ry={NODE_R * 0.28}
								fill="white" opacity="0.18" />
						{/if}

						<!-- Icon -->
						{#if done}
							<path d="M {x - 10} {y} L {x - 3} {y + 8} L {x + 12} {y - 8}"
								fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
						{:else}
							<text x={x} y={y + 1} text-anchor="middle" dominant-baseline="central"
								class="node-num" class:node-num-active={active} class:node-num-locked={!active}>
								{lesson.partNumber}
							</text>
						{/if}

						<!-- Title -->
						<text x={titleX(x)} y={splitTitle(lesson.title).length > 1 ? y - 9 : y + 1}
							text-anchor={titleAnchor(x)} dominant-baseline="central"
							class="node-label" class:node-label-active={active} class:node-label-locked={!active}>
							{#each splitTitle(lesson.title) as line, li (li)}
								{#if li === 0}{line}{:else}<tspan x={titleX(x)} dy="18">{line}</tspan>{/if}
							{/each}
						</text>

						<!-- "START" badge -->
						{#if st === 'available'}
							<g class="start-badge">
								<rect x={x - 26} y={y + NODE_R + 8} width="52" height="22" rx="11"
									fill="var(--color-primary)" />
								<rect x={x - 26} y={y + NODE_R + 8 + 18} width="52" height="4" rx="0 0 11 11"
									fill="var(--color-primary-dark)" opacity="0.7" />
								<text x={x} y={y + NODE_R + 20} text-anchor="middle" dominant-baseline="central"
									class="start-text">START</text>
							</g>
						{/if}
					</g>
				{:else}
					<!-- Locked -->
					<circle cx={x} cy={y} r={NODE_R} class="node-fill node-locked" />
					<svg x={x - 9} y={y - 10} width="18" height="20" viewBox="0 0 18 20" fill="none">
						<rect x="1" y="8" width="16" height="11" rx="2.5" fill="var(--color-text-muted)" opacity="0.25"/>
						<path d="M4.5 8V6a4.5 4.5 0 1 1 9 0v2" stroke="var(--color-text-muted)" stroke-width="1.8" stroke-linecap="round" opacity="0.25"/>
						<circle cx="9" cy="14" r="1.5" fill="var(--color-text-muted)" opacity="0.2"/>
					</svg>
					<text x={titleX(x)} y={splitTitle(lesson.title).length > 1 ? y - 9 : y + 1}
						text-anchor={titleAnchor(x)} dominant-baseline="central"
						class="node-label node-label-locked">
						{#each splitTitle(lesson.title) as line, li (li)}
							{#if li === 0}{line}{:else}<tspan x={titleX(x)} dy="18">{line}</tspan>{/if}
						{/each}
					</text>
				{/if}
			</g>
		{/each}
	</svg>
</div>

<!-- Lesson preview popup -->
{#if selectedLesson}
	<div
		class="preview-backdrop"
		onclick={closePreview}
		onkeydown={(e) => { if (e.key === 'Escape') closePreview(); }}
		role="dialog"
		tabindex="-1"
		aria-modal="true"
		aria-label="Lesson preview"
	>
		<div class="preview-card" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="presentation">
			<button class="preview-close" onclick={closePreview} aria-label="Close preview">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
					<path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
				</svg>
			</button>

			<div class="preview-badge">Part {selectedLesson.partNumber}</div>
			<h2 class="preview-title">{selectedLesson.title}</h2>

			{#if selectedObjectives.length > 0}
				<ul class="preview-objectives">
					{#each selectedObjectives as objective (objective)}
						<li class="preview-objective">
							<svg class="preview-bullet" width="16" height="16" viewBox="0 0 16 16" fill="none">
								<circle cx="8" cy="8" r="6" fill="var(--color-primary-subtle)" />
								<path d="M5.5 8l2 2 3.5-3.5" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
							<span>{objective}</span>
						</li>
					{/each}
				</ul>
			{/if}

			{#if selectedHref}
				<a href={selectedHref} class="preview-cta" class:preview-cta-review={selectedStatus === 'complete'}>
					{selectedStatus === 'complete' ? 'Review' : 'Start'}
					<svg class="preview-cta-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none">
						<path d="M13 7l5 5m0 0l-5 5m5-5H6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</a>
			{/if}
		</div>
	</div>
{/if}

<style>
	.map-wrap {
		position: relative;
		overflow-y: auto;
		overflow-x: hidden;
		max-height: 82vh;
		padding: 1rem 0;
		scrollbar-width: none;
	}
	.map-wrap::-webkit-scrollbar { display: none; }

	.map-svg { display: block; margin: 0 auto; position: relative; z-index: 1; }

	/* ── Themed background zones ── */
	.map-zones {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		pointer-events: none;
		z-index: 0;
		overflow: hidden;
		border-radius: var(--radius-2xl);
	}
	.map-zone {
		flex: 1;
	}
	.map-zone-foundations {
		background: linear-gradient(180deg, transparent, oklch(44% 0.26 280 / 0.025));
	}
	.map-zone-intermediate {
		background: oklch(58% 0.21 155 / 0.018);
	}
	.map-zone-advanced {
		background: linear-gradient(180deg, oklch(78% 0.155 70 / 0.03), transparent);
	}

	/* ── Spark pill ── */
	.spark-pill {
		position: sticky;
		top: 0.5rem;
		float: right;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		background: oklch(100% 0 0 / 0.85);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		padding: 0.375rem 0.75rem;
		text-decoration: none;
		transition: transform 0.2s var(--ease-smooth), box-shadow 0.2s ease;
		margin-right: 0.5rem;
		box-shadow: 0 2px 8px oklch(16% 0.02 280 / 0.08);
	}
	.spark-pill:hover { transform: translateY(-2px); box-shadow: 0 4px 12px oklch(16% 0.02 280 / 0.12); }
	.spark-pill:active { transform: translateY(0); box-shadow: none; }
	.spark-pill-val { font-size: 0.8125rem; font-weight: 800; color: var(--color-text); }

	/* ── Nodes ── */
	.node-fill { transition: fill 0.3s ease; }

	.node-locked {
		fill: var(--color-surface-container);
		stroke: var(--color-border-strong);
		stroke-width: 2.5;
	}

	.node-active {
		fill: var(--color-primary);
		filter: drop-shadow(0 3px 8px oklch(44% 0.26 280 / 0.3));
	}

	.node-done {
		fill: var(--color-success);
		filter: drop-shadow(0 2px 6px oklch(58% 0.21 155 / 0.25));
	}

	/* ── Glow ── */
	.node-glow-ring {
		opacity: 0;
		animation: glow-breathe 2.4s ease-in-out infinite;
	}

	@keyframes glow-breathe {
		0%, 100% { opacity: 0; }
		50% { opacity: 0.35; }
	}

	/* ── Numbers / labels ── */
	.node-num {
		font-family: 'Bricolage Grotesque', system-ui, sans-serif;
		font-size: 17px;
		font-weight: 800;
		pointer-events: none;
	}
	.node-num-active { fill: white; }
	.node-num-locked { fill: var(--color-text-muted); }

	.node-label {
		font-family: 'Outfit', system-ui, sans-serif;
		font-size: 12.5px;
		font-weight: 700;
		pointer-events: none;
		transition: fill 0.3s ease;
	}
	.node-label-active { fill: var(--color-text); }
	.node-label-locked { fill: var(--color-text-subtle); }

	.start-text {
		font-family: 'Outfit', system-ui, sans-serif;
		font-size: 9px;
		font-weight: 800;
		fill: white;
		letter-spacing: 0.1em;
		pointer-events: none;
	}

	.start-badge { animation: badge-bounce 2s ease-in-out infinite; }

	@keyframes badge-bounce {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-3px); }
	}

	/* ── Hover ── */
	.node-link { cursor: pointer; }
	.node-link:hover .node-fill:not(.node-done):not(.node-locked) { filter: brightness(1.1) drop-shadow(0 4px 12px oklch(44% 0.26 280 / 0.35)); }
	.node-link:hover .node-fill.node-done { filter: drop-shadow(0 4px 12px oklch(58% 0.21 155 / 0.3)); }
	.node-link:active .node-fill:not(.node-locked) { filter: brightness(0.92); }
	.node-link:focus-visible { outline: none; }
	.node-link:focus-visible .node-fill { stroke: var(--color-accent); stroke-width: 4; }

	/* ── Preview popup ── */
	.preview-backdrop {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
		background: oklch(16% 0.02 280 / 0.4);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		animation: backdrop-in 0.2s ease-out;
		padding: 1rem;
	}

	@keyframes backdrop-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.preview-card {
		position: relative;
		background: var(--color-surface);
		border-radius: var(--radius-2xl);
		box-shadow:
			0 24px 80px oklch(16% 0.02 280 / 0.18),
			0 8px 24px oklch(16% 0.02 280 / 0.08);
		padding: 1.75rem 1.5rem 1.5rem;
		max-width: 22rem;
		width: 100%;
		animation: preview-in 0.25s var(--ease-bounce);
	}

	@keyframes preview-in {
		from { opacity: 0; transform: scale(0.92) translateY(12px); }
		to { opacity: 1; transform: scale(1) translateY(0); }
	}

	.preview-close {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border: none;
		border-radius: var(--radius-full);
		background: var(--color-surface-raised);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: background 0.15s ease, color 0.15s ease;
	}
	.preview-close:hover { background: var(--color-surface-sunken); color: var(--color-text); }

	.preview-badge {
		display: inline-block;
		font-family: 'Outfit', system-ui, sans-serif;
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-primary);
		background: var(--color-primary-subtle);
		border-radius: var(--radius-full);
		padding: 0.25rem 0.625rem;
		margin-bottom: 0.625rem;
	}

	.preview-title {
		font-family: 'Bricolage Grotesque', system-ui, sans-serif;
		font-size: 1.25rem;
		font-weight: 800;
		color: var(--color-text);
		margin: 0 0 1rem;
		line-height: 1.3;
		letter-spacing: -0.02em;
	}

	.preview-objectives {
		list-style: none;
		margin: 0 0 1.25rem;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.preview-objective {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-family: 'Outfit', system-ui, sans-serif;
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	.preview-bullet { flex-shrink: 0; margin-top: 0.1rem; }

	.preview-cta {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.75rem 1.25rem;
		border: none;
		border-radius: var(--radius-full);
		background: linear-gradient(180deg, oklch(48% 0.26 280) 0%, var(--color-primary) 100%);
		color: white;
		font-family: 'Outfit', system-ui, sans-serif;
		font-size: 0.9375rem;
		font-weight: 700;
		text-decoration: none;
		cursor: pointer;
		transition: transform 0.15s var(--ease-smooth), box-shadow 0.15s ease, filter 0.15s ease;
		box-shadow: 0 4px 12px oklch(44% 0.26 280 / 0.25);
		border-bottom: 4px solid var(--color-primary-dark);
	}
	.preview-cta:hover { filter: brightness(1.08); transform: translateY(-2px); box-shadow: 0 6px 20px oklch(44% 0.26 280 / 0.3); }
	.preview-cta:active { transform: translateY(2px); border-bottom-width: 2px; filter: brightness(0.95); }

	.preview-cta-review {
		background: linear-gradient(180deg, oklch(62% 0.21 155) 0%, var(--color-success) 100%);
		box-shadow: 0 4px 12px oklch(58% 0.21 155 / 0.25);
		border-bottom-color: var(--color-success-dark);
	}
	.preview-cta-review:hover { box-shadow: 0 6px 20px oklch(58% 0.21 155 / 0.3); }

	.preview-cta-arrow { transition: transform 0.15s ease; }
	.preview-cta:hover .preview-cta-arrow { transform: translateX(2px); }
</style>
