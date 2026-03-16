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
	}

	let { lessons, progress }: Props = $props();

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
</script>

<div class="map-wrap" bind:this={mapEl}>
	<a href="/puzzle" class="spark-pill">
		<SparkCoin size={22} />
		<span class="spark-pill-val">{sparksEarned}/7</span>
	</a>

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
					<a href={lhref} class="node-link">
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
					</a>
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

<style>
	.map-wrap {
		position: relative;
		overflow-y: auto;
		overflow-x: hidden;
		max-height: 82vh;
		padding: 1rem 0;
	}

	.map-svg { display: block; margin: 0 auto; }

	/* ── Spark pill ── */
	.spark-pill {
		position: sticky;
		top: 0.5rem;
		float: right;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-bottom-width: 3px;
		border-bottom-color: var(--color-border-strong);
		border-radius: var(--radius-full);
		padding: 0.375rem 0.75rem;
		text-decoration: none;
		transition: transform 0.15s var(--ease-spring);
		margin-right: 0.5rem;
	}
	.spark-pill:hover { transform: translateY(-2px); }
	.spark-pill:active { transform: translateY(1px); }
	.spark-pill-val { font-size: 0.8125rem; font-weight: 800; color: var(--color-text); }

	/* ── Nodes ── */
	.node-fill { transition: fill 0.3s ease; }

	.node-locked {
		fill: var(--color-surface-raised);
		stroke: var(--color-border-strong);
		stroke-width: 3;
	}

	.node-active {
		fill: var(--color-primary);
	}

	.node-done {
		fill: var(--color-success);
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
	.node-link:hover .node-fill:not(.node-done):not(.node-locked) { filter: brightness(1.15); }
	.node-link:active .node-fill:not(.node-locked) { filter: brightness(0.92); }
	.node-link:focus-visible { outline: none; }
	.node-link:focus-visible .node-fill { stroke: var(--color-accent); stroke-width: 4; }
</style>
