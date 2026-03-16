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

	// Build a 3x3 grid array
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

<div
	class="puzzle-board grid grid-cols-3 gap-1 rounded-xl p-2"
	class:celebration={allEarned}
>
	{#each grid as row, rowIndex (rowIndex)}
		{#each row as cell, colIndex (colIndex)}
			<div class="puzzle-cell flex aspect-square w-[150px] flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl bg-surface-raised p-2">
				{#if cell && cell.earned}
					<div class="earned-piece">
						<SparkCoin size={80} backImage={cell.coinImage} />
					</div>
					<span class="text-center text-xs font-medium text-text">{cell.lessonTitle}</span>
				{:else}
					<SparkCoin size={80} muted />
					<span class="text-center text-xs text-text-muted">
						{cell ? cell.lessonTitle : 'Part ' + (rowIndex * 3 + colIndex + 2)}
					</span>
				{/if}
			</div>
		{/each}
	{/each}
</div>

<style>
	.puzzle-board {
		background: color-mix(in oklch, var(--color-surface-raised) 80%, transparent);
	}

	.puzzle-board.celebration {
		box-shadow:
			0 0 20px color-mix(in oklch, var(--color-reward-glow) 60%, transparent),
			0 0 40px color-mix(in oklch, var(--color-reward-glow) 30%, transparent);
		animation: celebrate-glow 2s ease-in-out infinite alternate;
	}

	@keyframes celebrate-glow {
		from {
			box-shadow:
				0 0 20px color-mix(in oklch, var(--color-reward-glow) 60%, transparent),
				0 0 40px color-mix(in oklch, var(--color-reward-glow) 30%, transparent);
		}
		to {
			box-shadow:
				0 0 30px color-mix(in oklch, var(--color-reward-glow) 80%, transparent),
				0 0 60px color-mix(in oklch, var(--color-reward-glow) 50%, transparent);
		}
	}

	.earned-piece {
		box-shadow: 0 0 12px color-mix(in oklch, var(--color-reward-glow) 40%, transparent);
		transition: transform 0.2s ease;
	}

	.earned-piece:hover {
		transform: scale(1.05);
	}
</style>
