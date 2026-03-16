<script lang="ts">
	import SparkCoin from '$lib/components/SparkCoin.svelte';

	interface PuzzlePiece {
		position: string | null;
		lessonTitle: string;
		earned: boolean;
		partNumber: number;
		coinImage?: string;
	}

	let { pieces }: { pieces: PuzzlePiece[] } = $props();

	const gridPositions: Record<string, { row: number; col: number }> = {
		'top-left': { row: 0, col: 0 },
		'top-center': { row: 0, col: 1 },
		'top-right': { row: 0, col: 2 },
		'middle-left': { row: 1, col: 0 },
		center: { row: 1, col: 1 },
		'middle-right': { row: 1, col: 2 },
		'bottom-left': { row: 2, col: 0 },
		'bottom-center': { row: 2, col: 1 },
		'bottom-right': { row: 2, col: 2 }
	};

	let grid = $derived.by(() => {
		const cells: (PuzzlePiece | null)[][] = [
			[null, null, null],
			[null, null, null],
			[null, null, null]
		];
		for (const piece of pieces) {
			if (piece.position && gridPositions[piece.position]) {
				const { row, col } = gridPositions[piece.position];
				cells[row][col] = piece;
			}
		}
		return cells;
	});

	let allEarned = $derived(pieces.length === 9 && pieces.every((p) => p.earned));
</script>

<div class="puzzle-board" class:puzzle-celebration={allEarned}>
	{#each grid as row, rowIndex (rowIndex)}
		{#each row as cell, colIndex (colIndex)}
			<div class="puzzle-cell" class:puzzle-cell-earned={cell?.earned}>
				{#if cell && cell.earned}
					<div class="earned-coin">
						<SparkCoin size={72} backImage={cell.coinImage} />
					</div>
					<span class="cell-title cell-title-earned">{cell.lessonTitle}</span>
				{:else}
					<SparkCoin size={72} muted />
					<span class="cell-title">
						{cell ? cell.lessonTitle : 'Part ' + (rowIndex * 3 + colIndex + 2)}
					</span>
				{/if}
			</div>
		{/each}
	{/each}
</div>

<style>
	.puzzle-board {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.625rem;
		padding: 0.75rem;
		border-radius: var(--radius-2xl);
		background: var(--color-surface-raised);
		border: 2px solid var(--color-border);
		border-bottom-width: 4px;
		border-bottom-color: var(--color-border-strong);
	}

	.puzzle-celebration {
		border-color: var(--color-accent);
		box-shadow: var(--shadow-glow-accent);
		animation: celebrate 2s ease-in-out infinite alternate;
	}

	@keyframes celebrate {
		from { box-shadow: var(--shadow-glow-accent); }
		to { box-shadow: 0 8px 40px oklch(82% 0.16 75 / 0.45); }
	}

	.puzzle-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		aspect-ratio: 1;
		padding: 0.75rem;
		border-radius: var(--radius-xl);
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-bottom-width: 3px;
		border-bottom-color: var(--color-border-strong);
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.puzzle-cell-earned {
		border-color: var(--color-accent);
	}

	.earned-coin {
		transition: transform 0.2s ease;
		filter: drop-shadow(0 2px 8px oklch(82% 0.16 75 / 0.3));
	}

	.earned-coin:hover {
		transform: scale(1.08);
	}

	.cell-title {
		font-size: 0.6875rem;
		font-weight: 600;
		text-align: center;
		color: var(--color-text-muted);
		line-height: 1.3;
	}

	.cell-title-earned {
		color: var(--color-text);
		font-weight: 700;
	}
</style>
