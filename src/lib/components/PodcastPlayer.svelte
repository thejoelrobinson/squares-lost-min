<script lang="ts">
	interface Props {
		src: string;
		title: string;
		onComplete: () => void;
	}

	let { src, title, onComplete }: Props = $props();

	let audioEl: HTMLAudioElement | undefined = $state(undefined);
	let playing = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let playbackRate = $state(1);
	let showTranscript = $state(false);
	let hasListened = $state(true);

	const speeds = [0.75, 1, 1.25, 1.5];

	function formatTime(seconds: number): string {
		if (!isFinite(seconds) || seconds < 0) return '0:00';
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	let progress = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);

	function togglePlay() {
		if (!audioEl) return;
		if (playing) {
			audioEl.pause();
		} else {
			audioEl.play();
		}
	}

	function seek(e: MouseEvent) {
		if (!audioEl || !duration) return;
		const bar = e.currentTarget as HTMLElement;
		const rect = bar.getBoundingClientRect();
		const ratio = (e.clientX - rect.left) / rect.width;
		audioEl.currentTime = ratio * duration;
	}

	function cycleSpeed() {
		const currentIndex = speeds.indexOf(playbackRate);
		const nextIndex = (currentIndex + 1) % speeds.length;
		playbackRate = speeds[nextIndex];
		if (audioEl) {
			audioEl.playbackRate = playbackRate;
		}
	}

	function handleTimeUpdate() {
		if (!audioEl) return;
		currentTime = audioEl.currentTime;
		if (currentTime > 10) {
			hasListened = true;
		}
	}

	function handleLoadedMetadata() {
		if (!audioEl) return;
		duration = audioEl.duration;
	}

	function handlePlay() {
		playing = true;
	}

	function handlePause() {
		playing = false;
	}

	function handleEnded() {
		playing = false;
		hasListened = true;
		onComplete();
	}
</script>

<div class="rounded-xl bg-surface-raised p-6 shadow-sm">
	<audio
		bind:this={audioEl}
		{src}
		preload="metadata"
		ontimeupdate={handleTimeUpdate}
		onloadedmetadata={handleLoadedMetadata}
		onplay={handlePlay}
		onpause={handlePause}
		onended={handleEnded}
	></audio>

	<h2 class="mb-4 text-center text-lg font-semibold text-text">{title}</h2>

	<!-- Seekable progress bar -->
	<button
		type="button"
		class="group mb-4 block h-3 w-full cursor-pointer rounded-full bg-surface"
		onclick={seek}
		aria-label="Seek through audio"
	>
		<div
			class="h-full rounded-full bg-accent transition-all duration-150"
			style="width: {progress}%"
		></div>
	</button>

	<!-- Time display -->
	<div class="mb-4 flex justify-between text-xs text-text-muted">
		<span>{formatTime(currentTime)}</span>
		<span>{formatTime(duration)}</span>
	</div>

	<!-- Controls: speed, play/pause, transcript toggle -->
	<div class="flex items-center justify-center gap-6">
		<button
			type="button"
			class="rounded-lg px-3 py-1 text-sm font-medium text-text-muted transition hover:bg-surface hover:text-text"
			onclick={cycleSpeed}
			aria-label="Playback speed: {playbackRate}x"
		>
			{playbackRate}x
		</button>

		<button
			type="button"
			class="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-md transition hover:brightness-110"
			onclick={togglePlay}
			aria-label={playing ? 'Pause' : 'Play'}
		>
			{#if playing}
				<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
					<rect x="6" y="4" width="4" height="16" rx="1" />
					<rect x="14" y="4" width="4" height="16" rx="1" />
				</svg>
			{:else}
				<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
					<path d="M8 5v14l11-7z" />
				</svg>
			{/if}
		</button>

		<button
			type="button"
			class="rounded-lg px-3 py-1 text-sm font-medium transition {showTranscript
				? 'bg-primary/10 text-primary'
				: 'text-text-muted hover:bg-surface hover:text-text'}"
			onclick={() => (showTranscript = !showTranscript)}
			aria-label={showTranscript ? 'Hide transcript' : 'Show transcript'}
			aria-expanded={showTranscript}
		>
			Transcript
		</button>
	</div>

	<!-- Transcript area -->
	{#if showTranscript}
		<div class="mt-4 rounded-lg bg-surface p-4 text-sm text-text-muted">
			<p class="italic">Transcript will appear here when available.</p>
		</div>
	{/if}

	<!-- Mark complete button (visible immediately in dev since audio files may not exist) -->
	{#if hasListened}
		<div class="mt-6 text-center">
			<button
				type="button"
				class="rounded-lg bg-success px-6 py-2 font-medium text-white transition hover:brightness-110"
				onclick={onComplete}
			>
				Mark as complete &rarr;
			</button>
		</div>
	{/if}
</div>
