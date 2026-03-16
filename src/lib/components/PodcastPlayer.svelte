<script lang="ts">
	import type { SubtitleCue } from '$lib/types';
	import SparkIcon from '$lib/components/SparkIcon.svelte';
	import SyncedTranscript from '$lib/components/SyncedTranscript.svelte';
	import PodcastAsk from '$lib/components/PodcastAsk.svelte';

	interface Props {
		src: string;
		title: string;
		episodeNumber?: number;
		subtitles?: SubtitleCue[];
		lessonSlug?: string;
		onComplete: () => void;
	}

	let { src, title, episodeNumber = 1, subtitles, lessonSlug, onComplete }: Props = $props();

	let audioEl: HTMLAudioElement | undefined = $state(undefined);
	let seekbarEl: HTMLDivElement | undefined = $state(undefined);
	let playing = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let playbackRate = $state(1);
	let showTranscript = $state(false);
	let hasListened = $state(false);
	let isSeeking = $state(false);
	let askOpen = $state(false);

	const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

	function formatTime(seconds: number): string {
		if (!isFinite(seconds) || seconds < 0) return '0:00';
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	let progress = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);
	let remaining = $derived(duration > 0 ? duration - currentTime : 0);

	// Only changes when a new cue boundary is crossed — gates the expensive join below
	let lastCueIdx = $derived.by(() => {
		if (!subtitles || subtitles.length === 0) return -1;
		let idx = -1;
		for (let i = 0; i < subtitles.length; i++) {
			if (subtitles[i].start <= currentTime) idx = i;
			else break;
		}
		return idx;
	});

	// Depends on lastCueIdx (not currentTime directly), so only re-runs on cue boundary
	let transcriptContext = $derived(
		lastCueIdx < 0 || !subtitles ? '' : subtitles.slice(0, lastCueIdx + 1).map((c) => c.text).join(' ')
	);

	function togglePlay() {
		if (!audioEl) return;
		if (playing) {
			audioEl.pause();
		} else {
			audioEl.play();
		}
	}

	function openAsk() {
		if (audioEl && playing) audioEl.pause();
		askOpen = true;
	}

	function closeAsk() {
		askOpen = false;
	}

	function seekToRatio(clientX: number) {
		if (!audioEl || !duration || !seekbarEl) return;
		const rect = seekbarEl.getBoundingClientRect();
		const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		audioEl.currentTime = ratio * duration;
	}

	function handlePointerDown(e: PointerEvent) {
		isSeeking = true;
		seekToRatio(e.clientX);
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isSeeking) return;
		seekToRatio(e.clientX);
	}

	function handlePointerUp() {
		isSeeking = false;
	}

	function skipForward() {
		if (!audioEl) return;
		audioEl.currentTime = Math.min(audioEl.currentTime + 15, duration);
	}

	function skipBack() {
		if (!audioEl) return;
		audioEl.currentTime = Math.max(audioEl.currentTime - 15, 0);
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
		if (duration > 0 && currentTime / duration > 0.85) {
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

	function seekTo(time: number) {
		if (audioEl) audioEl.currentTime = time;
	}
</script>

<div class="mx-auto w-full max-w-md">
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

	<!-- Cover Art -->
	<div class="relative mx-auto mb-6 aspect-square w-64 overflow-hidden rounded-2xl bg-gradient-to-br from-secondary via-primary to-primary-light shadow-xl">
		<!-- Subtle pattern overlay -->
		<div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px); background-size: 40px 40px;"></div>

		<!-- Central Spark -->
		<div class="absolute inset-0 flex flex-col items-center justify-center gap-3">
			<div class="relative">
				<div class="absolute -inset-4 rounded-full bg-accent/20 blur-xl {playing ? 'animate-pulse' : ''}"></div>
				<SparkIcon size={64} class="relative text-accent drop-shadow-lg" />
			</div>
			<div class="px-6 text-center">
				<p class="text-xs font-semibold uppercase tracking-widest text-white/60">The Leadership Loop</p>
				<p class="mt-1 text-sm font-bold text-white">Episode {episodeNumber}</p>
			</div>
		</div>

		<!-- Bottom gradient fade -->
		<div class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent"></div>
	</div>

	<!-- Title & Show Name -->
	<div class="mb-5 text-center">
		<h2 class="text-lg font-bold tracking-tight text-text">{title}</h2>
		<p class="mt-0.5 text-xs font-medium uppercase tracking-wider text-text-muted">The Leadership Loop</p>
	</div>

	<!-- Seekbar — uses Pointer Events for mouse + touch -->
	<div class="mb-2 px-1">
		<div
			bind:this={seekbarEl}
			role="slider"
			tabindex="0"
			aria-label="Seek through audio"
			aria-valuemin={0}
			aria-valuemax={Math.round(duration)}
			aria-valuenow={Math.round(currentTime)}
			aria-valuetext="{formatTime(currentTime)} of {formatTime(duration)}"
			class="group relative h-5 w-full cursor-pointer touch-none select-none"
			onpointerdown={handlePointerDown}
			onpointermove={handlePointerMove}
			onpointerup={handlePointerUp}
			onpointercancel={handlePointerUp}
		>
			<!-- Track bg -->
			<div class="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-surface transition-all group-hover:h-1.5"></div>
			<!-- Filled track -->
			<div
				class="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary transition-all group-hover:h-1.5"
				style="width: {progress}%"
			></div>
			<!-- Scrubber handle -->
			<div
				class="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-md ring-4 ring-primary/20 transition-transform {isSeeking ? 'scale-125' : 'scale-0 group-hover:scale-100'}"
				style="left: {progress}%"
			></div>
		</div>
	</div>

	<!-- Time display -->
	<div class="mb-5 flex justify-between px-1 text-[11px] font-medium tabular-nums text-text-muted">
		<span>{formatTime(currentTime)}</span>
		<span>-{formatTime(remaining)}</span>
	</div>

	<!-- Transport Controls -->
	<div class="mb-5 flex items-center justify-center gap-6">
		<!-- Skip Back 15s -->
		<button
			type="button"
			class="relative flex h-11 w-11 cursor-pointer items-center justify-center text-text transition-colors hover:text-primary active:scale-95"
			onclick={skipBack}
			aria-label="Skip back 15 seconds"
		>
			<svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
			</svg>
			<span class="absolute -bottom-0.5 text-[9px] font-bold">15</span>
		</button>

		<!-- Play/Pause -->
		<button
			type="button"
			class="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-text text-bg shadow-lg transition-all hover:scale-105 active:scale-95"
			onclick={togglePlay}
			aria-label={playing ? 'Pause' : 'Play'}
		>
			{#if playing}
				<svg class="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
					<rect x="6" y="4" width="4" height="16" rx="1.5" />
					<rect x="14" y="4" width="4" height="16" rx="1.5" />
				</svg>
			{:else}
				<svg class="ml-1 h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
					<path d="M8 5.14v13.72a1 1 0 001.5.86l11.04-6.86a1 1 0 000-1.72L9.5 4.28a1 1 0 00-1.5.86z" />
				</svg>
			{/if}
		</button>

		<!-- Skip Forward 15s -->
		<button
			type="button"
			class="relative flex h-11 w-11 cursor-pointer items-center justify-center text-text transition-colors hover:text-primary active:scale-95"
			onclick={skipForward}
			aria-label="Skip forward 15 seconds"
		>
			<svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
				<path stroke-linecap="round" stroke-linejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
			</svg>
			<span class="absolute -bottom-0.5 text-[9px] font-bold">15</span>
		</button>
	</div>

	<!-- Bottom Controls: Speed, Ask & Transcript -->
	<div class="flex items-center justify-between border-t border-surface-raised pt-3">
		<button
			type="button"
			class="flex h-8 min-w-14 cursor-pointer items-center justify-center rounded-lg border border-text/15 px-2.5 text-xs font-bold text-text-muted transition hover:border-primary hover:text-primary"
			onclick={cycleSpeed}
			aria-label="Playback speed: {playbackRate}x"
		>
			{playbackRate}x
		</button>

		{#if lessonSlug}
			<button
				type="button"
				class="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition {askOpen
					? 'bg-primary/10 text-primary'
					: 'text-text-muted hover:text-primary'}"
				onclick={openAsk}
				aria-label="Ask a question"
				aria-expanded={askOpen}
			>
				<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
				</svg>
				Ask
			</button>
		{/if}

		<button
			type="button"
			class="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition {showTranscript
				? 'bg-primary/10 text-primary'
				: 'text-text-muted hover:text-primary'}"
			onclick={() => (showTranscript = !showTranscript)}
			aria-label={showTranscript ? 'Hide transcript' : 'Show transcript'}
			aria-expanded={showTranscript}
		>
			<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2zM7 8h10M7 12h6" />
			</svg>
			Transcript
		</button>
	</div>

	<!-- Ask Jordan panel -->
	{#if askOpen}
		<PodcastAsk
			lessonSlug={lessonSlug!}
			{transcriptContext}
			onDismiss={closeAsk}
		/>
	{/if}

	<!-- Transcript area -->
	{#if showTranscript}
		{#if subtitles && subtitles.length > 0}
			<div class="mt-3">
				<SyncedTranscript
					cues={subtitles}
					{currentTime}
					onSeek={seekTo}
				/>
			</div>
		{:else}
			<div class="mt-3 max-h-64 overflow-y-auto rounded-xl bg-surface p-4">
				<p class="text-sm italic text-text-muted">No transcript available.</p>
			</div>
		{/if}
	{/if}

	<!-- Mark complete -->
	{#if hasListened}
		<div class="mt-5 text-center">
			<button
				type="button"
				class="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
				onclick={onComplete}
			>
				Continue
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</button>
		</div>
	{/if}
</div>
