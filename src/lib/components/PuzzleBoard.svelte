<script lang="ts">
	interface PuzzlePiece {
		position: string | null;
		lessonTitle: string;
		earned: boolean;
		partNumber: number;
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
			{@const positionKey = Object.entries(gridPositions).find(
				([, v]) => v.row === rowIndex && v.col === colIndex
			)?.[0]}
			<div class="puzzle-cell aspect-square w-[150px] overflow-hidden rounded-lg">
				{#if cell && cell.earned}
					<div class="earned-piece h-full w-full">
						<img
							src="/puzzle/{positionKey}.svg"
							alt={cell.lessonTitle}
							class="h-full w-full object-cover"
						/>
					</div>
				{:else}
					<div
						class="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-200 p-3"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-8 w-8 text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
							<path d="M7 11V7a5 5 0 0 1 10 0v4" />
						</svg>
						<span class="text-center text-xs text-gray-500">
							{cell ? cell.lessonTitle : 'Part ' + (rowIndex * 3 + colIndex + 2)}
						</span>
					</div>
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
