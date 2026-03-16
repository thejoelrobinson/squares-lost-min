<script lang="ts">
	import type { SubtitleCue } from '$lib/types';

	interface Props {
		cues: SubtitleCue[];
		currentTime: number;
		onSeek?: (time: number) => void;
	}

	let { cues, currentTime, onSeek }: Props = $props();

	let containerEl: HTMLDivElement | undefined = $state(undefined);

	let activeCueId = $derived.by(() => {
		for (let i = cues.length - 1; i >= 0; i--) {
			if (currentTime >= cues[i].start) {
				return cues[i].id;
			}
		}
		return cues.length > 0 ? cues[0].id : -1;
	});

	// Only scroll when the active cue actually changes
	let lastScrolledCue = $state(-1);
	$effect(() => {
		if (!containerEl || activeCueId < 0 || activeCueId === lastScrolledCue) return;
		lastScrolledCue = activeCueId;
		const activeEl = containerEl.querySelector(`[data-cue="${activeCueId}"]`);
		if (activeEl) {
			activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	});
</script>

<div class="relative">
	<div
		bind:this={containerEl}
		class="max-h-64 overflow-y-auto rounded-xl bg-surface px-4 py-3 scrollbar-thin"
	>
		<div class="flex flex-col">
			{#each cues as cue (cue.id)}
				<button
					type="button"
					data-cue={cue.id}
					class="cursor-pointer rounded-lg px-2.5 py-1.5 text-left text-sm leading-relaxed transition-colors duration-200
						{cue.id === activeCueId
						? 'bg-primary/10 font-medium text-text'
						: currentTime >= cue.end
							? 'text-text-muted opacity-50'
							: 'text-text-muted'}"
					onclick={() => onSeek?.(cue.start)}
				>
					{cue.text}
				</button>
			{/each}
		</div>
	</div>
	<!-- Top/bottom fade to hint scrollability -->
	<div class="pointer-events-none absolute inset-x-0 top-0 h-6 rounded-t-xl bg-gradient-to-b from-surface to-transparent"></div>
	<div class="pointer-events-none absolute inset-x-0 bottom-0 h-6 rounded-b-xl bg-gradient-to-t from-surface to-transparent"></div>
</div>
