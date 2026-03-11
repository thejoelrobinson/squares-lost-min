<script lang="ts">
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
	const NODE_RADIUS = 24;
	const VERTICAL_SPACING = 90;
	const TOP_PADDING = 60;
	const BOTTOM_PADDING = 60;

	let svgHeight = $derived(lessons.length * VERTICAL_SPACING + TOP_PADDING + BOTTOM_PADDING);

	// X positions for the winding snake pattern (left, center, right)
	const xPositions = [100, 200, 300, 200];

	function getNodeX(index: number): number {
		return xPositions[index % xPositions.length];
	}

	// Y positions go bottom-to-top (earliest lesson at the bottom)
	function getNodeY(index: number): number {
		return svgHeight - BOTTOM_PADDING - index * VERTICAL_SPACING;
	}

	function getStatus(lessonId: string): LessonStatus {
		const p = progress.find((pr) => pr.lessonId === lessonId);
		return (p?.status as LessonStatus) ?? 'locked';
	}

	function getLessonHref(lesson: LessonItem): string | null {
		const status = getStatus(lesson.id);
		if (status === 'locked') return null;
		if (lesson.partNumber === 1) return '/onboarding';
		return `/lesson/${lesson.slug}`;
	}

	// Build the meandering SVG path through all nodes
	let pathD = $derived.by(() => {
		if (lessons.length === 0) return '';
		const points = lessons.map((_, i) => ({ x: getNodeX(i), y: getNodeY(i) }));
		// Start at the first node (bottom)
		let d = `M ${points[0].x} ${points[0].y}`;
		for (let i = 1; i < points.length; i++) {
			const prev = points[i - 1];
			const curr = points[i];
			// Use a smooth cubic bezier for the winding effect
			const cpOffsetY = (prev.y - curr.y) / 2;
			const cp1x = prev.x;
			const cp1y = prev.y - cpOffsetY;
			const cp2x = curr.x;
			const cp2y = curr.y + cpOffsetY;
			d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
		}
		return d;
	});

	// Find the first available or in-progress lesson index for auto-scroll
	let currentLessonIndex = $derived.by(() => {
		const inProgressStates: LessonStatus[] = [
			'available',
			'podcast_complete',
			'comprehension_complete'
		];
		const idx = lessons.findIndex((l) => inProgressStates.includes(getStatus(l.id)));
		return idx >= 0 ? idx : 0;
	});

	let mapContainer: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (!mapContainer) return;
		const nodeId = `lesson-node-${currentLessonIndex}`;
		const el = mapContainer.querySelector(`#${nodeId}`);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	});

	// Total puzzle pieces earned
	let puzzlesEarned = $derived(
		progress.filter((p) => p.puzzleEarned === 1).length
	);
</script>

<div class="lesson-map" bind:this={mapContainer}>
	<!-- Puzzle thumbnail link -->
	<a href="/puzzle" class="puzzle-thumbnail">
		<svg viewBox="0 0 36 36" width="36" height="36" aria-hidden="true">
			<rect x="1" y="1" width="10" height="10" rx="1" class="puzzle-piece" class:earned={puzzlesEarned >= 1} />
			<rect x="13" y="1" width="10" height="10" rx="1" class="puzzle-piece" class:earned={puzzlesEarned >= 2} />
			<rect x="25" y="1" width="10" height="10" rx="1" class="puzzle-piece" class:earned={puzzlesEarned >= 3} />
			<rect x="1" y="13" width="10" height="10" rx="1" class="puzzle-piece" class:earned={puzzlesEarned >= 4} />
			<rect x="13" y="13" width="10" height="10" rx="1" class="puzzle-piece" class:earned={puzzlesEarned >= 5} />
			<rect x="25" y="13" width="10" height="10" rx="1" class="puzzle-piece" class:earned={puzzlesEarned >= 6} />
			<rect x="1" y="25" width="10" height="10" rx="1" class="puzzle-piece" class:earned={puzzlesEarned >= 7} />
			<rect x="13" y="25" width="10" height="10" rx="1" class="puzzle-piece" class:earned={puzzlesEarned >= 8} />
			<rect x="25" y="25" width="10" height="10" rx="1" class="puzzle-piece" class:earned={puzzlesEarned >= 9} />
		</svg>
		<span class="puzzle-count">{puzzlesEarned}/9</span>
	</a>

	<!-- Main SVG map -->
	<svg
		viewBox="0 0 {SVG_WIDTH} {svgHeight}"
		width={SVG_WIDTH}
		height={svgHeight}
		class="mx-auto block"
		role="img"
		aria-label="Lesson progression map"
	>
		<!-- Dotted path -->
		<path
			d={pathD}
			fill="none"
			stroke="var(--color-surface-raised)"
			stroke-width="4"
			stroke-dasharray="8 6"
			stroke-linecap="round"
		/>

		<!-- Completed portion of the path -->
		<path
			d={pathD}
			fill="none"
			stroke="var(--color-success)"
			stroke-width="4"
			stroke-dasharray="8 6"
			stroke-linecap="round"
			class="path-completed"
			style="--completed-nodes: {lessons.filter((l) => getStatus(l.id) === 'complete').length}; --total-nodes: {lessons.length}"
		/>

		<!-- Lesson nodes -->
		{#each lessons as lesson, i (lesson.id)}
			{@const x = getNodeX(i)}
			{@const y = getNodeY(i)}
			{@const status = getStatus(lesson.id)}
			{@const href = getLessonHref(lesson)}
			{@const isActive = status !== 'locked'}
			{@const isComplete = status === 'complete'}
			{@const isInProgress = status === 'podcast_complete' || status === 'comprehension_complete'}
			{@const isAvailable = status === 'available'}

			<g id="lesson-node-{i}">
				{#if href}
					<a href={href} class="lesson-node-link">
						<!-- Glow ring for available lessons -->
						{#if isAvailable}
							<circle
								cx={x}
								cy={y}
								r={NODE_RADIUS + 6}
								class="node-glow"
							/>
						{/if}

						<!-- Node circle -->
						<circle
							cx={x}
							cy={y}
							r={NODE_RADIUS}
							class="node-circle"
							class:node-locked={!isActive}
							class:node-available={isAvailable}
							class:node-in-progress={isInProgress}
							class:node-complete={isComplete}
						/>

						<!-- Part number -->
						{#if isComplete}
							<!-- Checkmark icon -->
							<path
								d="M {x - 8} {y} L {x - 2} {y + 6} L {x + 10} {y - 6}"
								fill="none"
								stroke="white"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						{:else}
							<text
								x={x}
								y={y + 1}
								text-anchor="middle"
								dominant-baseline="central"
								class="node-text"
								class:node-text-locked={!isActive}
								class:node-text-active={isActive}
							>
								{lesson.partNumber}
							</text>
						{/if}

						<!-- Title label -->
						<text
							x={x > 200 ? x - NODE_RADIUS - 12 : x + NODE_RADIUS + 12}
							y={y + 1}
							text-anchor={x > 200 ? 'end' : 'start'}
							dominant-baseline="central"
							class="node-title"
							class:node-title-locked={!isActive}
						>
							{lesson.title}
						</text>
					</a>
				{:else}
					<!-- Locked node - no link -->
					<circle
						cx={x}
						cy={y}
						r={NODE_RADIUS}
						class="node-circle node-locked"
					/>
					<text
						x={x}
						y={y + 1}
						text-anchor="middle"
						dominant-baseline="central"
						class="node-text node-text-locked"
					>
						{lesson.partNumber}
					</text>
					<text
						x={x > 200 ? x - NODE_RADIUS - 12 : x + NODE_RADIUS + 12}
						y={y + 1}
						text-anchor={x > 200 ? 'end' : 'start'}
						dominant-baseline="central"
						class="node-title node-title-locked"
					>
						{lesson.title}
					</text>
				{/if}
			</g>
		{/each}
	</svg>
</div>

<style>
	.lesson-map {
		position: relative;
		overflow-y: auto;
		overflow-x: hidden;
		max-height: 80vh;
		padding: 1rem 0;
	}

	.puzzle-thumbnail {
		position: sticky;
		top: 0.5rem;
		float: right;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		background: var(--color-surface);
		border: 1px solid var(--color-surface-raised);
		border-radius: 0.5rem;
		padding: 0.375rem 0.625rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		text-decoration: none;
		transition: box-shadow 0.2s;
		margin-right: 0.5rem;
	}

	.puzzle-thumbnail:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.puzzle-count {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.puzzle-piece {
		fill: var(--color-surface-raised);
		stroke: var(--color-text-muted);
		stroke-width: 0.5;
	}

	.puzzle-piece.earned {
		fill: var(--color-accent);
		stroke: var(--color-accent);
	}

	/* Path */
	.path-completed {
		stroke-dashoffset: 0;
	}

	/* Node styling */
	.node-circle {
		transition: fill 0.3s, stroke 0.3s, opacity 0.3s;
	}

	.node-locked {
		fill: var(--color-surface-raised);
		stroke: var(--color-text-muted);
		stroke-width: 2;
		opacity: 0.5;
	}

	.node-available {
		fill: var(--color-surface);
		stroke: var(--color-primary);
		stroke-width: 3;
	}

	.node-in-progress {
		fill: var(--color-primary-light);
		stroke: var(--color-primary);
		stroke-width: 3;
	}

	.node-complete {
		fill: var(--color-success);
		stroke: var(--color-success);
		stroke-width: 2;
	}

	/* Glow animation for available nodes */
	.node-glow {
		fill: none;
		stroke: var(--color-primary);
		stroke-width: 2;
		opacity: 0;
		animation: pulse-glow 2s ease-in-out infinite;
	}

	@keyframes pulse-glow {
		0%,
		100% {
			opacity: 0;
			r: 30;
		}
		50% {
			opacity: 0.4;
			r: 34;
		}
	}

	/* Node text */
	.node-text {
		font-size: 14px;
		font-weight: 700;
		pointer-events: none;
	}

	.node-text-locked {
		fill: var(--color-text-muted);
	}

	.node-text-active {
		fill: var(--color-primary);
	}

	.node-title {
		font-size: 13px;
		font-weight: 500;
		fill: var(--color-text);
		pointer-events: none;
	}

	.node-title-locked {
		fill: var(--color-text-muted);
		opacity: 0.6;
	}

	/* Link styling */
	.lesson-node-link {
		cursor: pointer;
	}

	.lesson-node-link:hover .node-circle:not(.node-complete) {
		filter: brightness(1.1);
	}

	.lesson-node-link:focus-visible {
		outline: none;
	}

	.lesson-node-link:focus-visible .node-circle {
		stroke: var(--color-accent);
		stroke-width: 3;
	}
</style>
