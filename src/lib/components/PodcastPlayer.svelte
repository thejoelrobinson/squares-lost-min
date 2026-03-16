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

	let lastCueIdx = $derived.by(() => {
		if (!subtitles || subtitles.length === 0) return -1;
		let idx = -1;
		for (let i = 0; i < subtitles.length; i++) {
			if (subtitles[i].start <= currentTime) idx = i;
			else break;
		}
		return idx;
	});

	let transcriptContext = $derived(
		lastCueIdx < 0 || !subtitles ? '' : subtitles.slice(0, lastCueIdx + 1).map((c) => c.text).join(' ')
	);

	function togglePlay() {
		if (!audioEl) return;
		if (playing) audioEl.pause();
		else audioEl.play();
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
		if (audioEl) audioEl.playbackRate = playbackRate;
	}

	function handleTimeUpdate() {
		if (!audioEl) return;
		currentTime = audioEl.currentTime;
		if (duration > 0 && currentTime / duration > 0.85) hasListened = true;
	}

	function handleLoadedMetadata() {
		if (!audioEl) return;
		duration = audioEl.duration;
	}

	function handlePlay() { playing = true; }
	function handlePause() { playing = false; }

	function handleEnded() {
		playing = false;
		hasListened = true;
		onComplete();
	}

	function seekTo(time: number) {
		if (audioEl) audioEl.currentTime = time;
	}
</script>

<div class="player-wrapper">
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
	<div class="cover-art" class:cover-playing={playing}>
		<div class="cover-gradient"></div>
		<div class="cover-pattern"></div>
		<div class="cover-content">
			<div class="cover-icon-wrap">
				<SparkIcon size={56} class="cover-spark" />
			</div>
			<div class="cover-meta">
				<p class="cover-label">Walmart Academy<br/>The Art of Feedback</p>
				<p class="cover-episode">Episode {episodeNumber}</p>
			</div>
		</div>
	</div>

	<!-- Title -->
	<div class="player-title-area">
		<h2 class="player-title">{title}</h2>
		<p class="player-subtitle">Walmart Academy · The Art of Feedback</p>
	</div>

	<!-- Seekbar -->
	<div class="seekbar-area">
		<div
			bind:this={seekbarEl}
			role="slider"
			tabindex="0"
			aria-label="Seek through audio"
			aria-valuemin={0}
			aria-valuemax={Math.round(duration)}
			aria-valuenow={Math.round(currentTime)}
			aria-valuetext="{formatTime(currentTime)} of {formatTime(duration)}"
			class="seekbar"
			onpointerdown={handlePointerDown}
			onpointermove={handlePointerMove}
			onpointerup={handlePointerUp}
			onpointercancel={handlePointerUp}
		>
			<div class="seekbar-track"></div>
			<div class="seekbar-fill" style="width: {progress}%"></div>
			<div
				class="seekbar-thumb"
				class:seekbar-thumb-visible={isSeeking}
				style="left: {progress}%"
			></div>
		</div>

		<div class="seekbar-times">
			<span>{formatTime(currentTime)}</span>
			<span>-{formatTime(remaining)}</span>
		</div>
	</div>

	<!-- Transport -->
	<div class="transport">
		<button type="button" class="transport-btn transport-skip" onclick={skipBack} aria-label="Skip back 15 seconds">
			<svg class="transport-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
			</svg>
			<span class="skip-label">15</span>
		</button>

		<button type="button" class="play-btn" onclick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
			{#if playing}
				<svg class="play-icon" fill="currentColor" viewBox="0 0 24 24">
					<rect x="6" y="4" width="4" height="16" rx="1.5" />
					<rect x="14" y="4" width="4" height="16" rx="1.5" />
				</svg>
			{:else}
				<svg class="play-icon play-icon-play" fill="currentColor" viewBox="0 0 24 24">
					<path d="M8 5.14v13.72a1 1 0 001.5.86l11.04-6.86a1 1 0 000-1.72L9.5 4.28a1 1 0 00-1.5.86z" />
				</svg>
			{/if}
		</button>

		<button type="button" class="transport-btn transport-skip" onclick={skipForward} aria-label="Skip forward 15 seconds">
			<svg class="transport-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
				<path stroke-linecap="round" stroke-linejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
			</svg>
			<span class="skip-label">15</span>
		</button>
	</div>

	<!-- Bottom actions -->
	<div class="player-actions">
		<button type="button" class="action-chip" onclick={cycleSpeed} aria-label="Playback speed: {playbackRate}x">
			{playbackRate}x
		</button>

		{#if lessonSlug}
			<button
				type="button"
				class="action-chip"
				class:action-chip-active={askOpen}
				onclick={openAsk}
				aria-label="Ask a question"
				aria-expanded={askOpen}
			>
				<svg class="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
				</svg>
				Ask
			</button>
		{/if}

		<button
			type="button"
			class="action-chip"
			class:action-chip-active={showTranscript}
			onclick={() => (showTranscript = !showTranscript)}
			aria-label={showTranscript ? 'Hide transcript' : 'Show transcript'}
			aria-expanded={showTranscript}
		>
			<svg class="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2zM7 8h10M7 12h6" />
			</svg>
			Transcript
		</button>
	</div>

	<!-- Ask panel -->
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
			<div class="transcript-area">
				<SyncedTranscript cues={subtitles} {currentTime} onSeek={seekTo} />
			</div>
		{:else}
			<div class="transcript-area transcript-empty">
				<p>No transcript available.</p>
			</div>
		{/if}
	{/if}

	<!-- Continue button -->
	{#if hasListened}
		<div class="continue-area">
			<button type="button" class="continue-btn" onclick={onComplete}>
				Continue
				<svg class="continue-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</button>
		</div>
	{/if}
</div>

<style>
	.player-wrapper {
		max-width: 28rem;
		margin: 0 auto;
		width: 100%;
	}

	/* ── Cover Art ── */
	.cover-art {
		position: relative;
		width: 15rem;
		aspect-ratio: 1;
		margin: 0 auto 1.75rem;
		border-radius: var(--radius-2xl);
		overflow: hidden;
		box-shadow: var(--shadow-xl);
		transition: transform 0.5s var(--ease-spring);
	}

	.cover-playing {
		transform: scale(1.03) rotate(0.5deg);
		box-shadow: var(--shadow-xl), var(--shadow-glow-primary);
	}

	.cover-gradient {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, var(--color-secondary), var(--color-primary), var(--color-primary-light));
	}

	.cover-pattern {
		position: absolute;
		inset: 0;
		opacity: 0.06;
		background-image:
			radial-gradient(circle at 25% 25%, white 1.5px, transparent 1.5px),
			radial-gradient(circle at 75% 75%, white 1px, transparent 1px);
		background-size: 32px 32px;
	}

	.cover-content {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}

	.cover-icon-wrap {
		position: relative;
		color: var(--color-accent);
		filter: drop-shadow(0 4px 12px oklch(82% 0.16 75 / 0.4));
	}

	.cover-meta {
		text-align: center;
	}

	.cover-label {
		font-family: 'Outfit', system-ui, sans-serif;
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: oklch(100% 0 0 / 0.45);
		line-height: 1.5;
	}

	.cover-episode {
		font-family: 'Bricolage Grotesque', system-ui, sans-serif;
		font-size: 1rem;
		font-weight: 800;
		color: white;
		margin-top: 0.375rem;
		letter-spacing: -0.02em;
	}

	/* ── Title ── */
	.player-title-area {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.player-title {
		font-size: 1.25rem;
		font-weight: 800;
		color: var(--color-text);
		letter-spacing: -0.02em;
	}

	.player-subtitle {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-subtle);
		margin-top: 0.25rem;
	}

	/* ── Seekbar ── */
	.seekbar-area {
		margin-bottom: 1.5rem;
	}

	.seekbar {
		position: relative;
		height: 2rem;
		cursor: pointer;
		touch-action: none;
		user-select: none;
	}

	.seekbar-track {
		position: absolute;
		top: 50%;
		width: 100%;
		height: 5px;
		transform: translateY(-50%);
		border-radius: var(--radius-full);
		background: var(--color-surface-sunken);
	}

	.seekbar-fill {
		position: absolute;
		top: 50%;
		height: 5px;
		transform: translateY(-50%);
		border-radius: var(--radius-full);
		background: var(--color-primary);
		transition: width 0.05s linear;
	}

	.seekbar-thumb {
		position: absolute;
		top: 50%;
		width: 1rem;
		height: 1rem;
		transform: translate(-50%, -50%) scale(0);
		border-radius: 50%;
		background: var(--color-primary);
		box-shadow: 0 2px 6px oklch(50% 0.22 275 / 0.3);
		transition: transform 0.15s ease;
	}

	.seekbar:hover .seekbar-thumb,
	.seekbar-thumb-visible {
		transform: translate(-50%, -50%) scale(1) !important;
	}

	.seekbar-times {
		display: flex;
		justify-content: space-between;
		margin-top: 0.375rem;
		font-size: 0.6875rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--color-text-subtle);
	}

	/* ── Transport ── */
	.transport {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		margin-bottom: 1.5rem;
	}

	.transport-btn {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		cursor: pointer;
		color: var(--color-text);
		background: none;
		border: none;
		border-radius: 50%;
		transition: color 0.15s ease, background 0.15s ease;
	}

	.transport-btn:hover {
		color: var(--color-primary);
		background: var(--color-primary-subtle);
	}

	.transport-btn:active {
		transform: scale(0.95);
	}

	.transport-icon {
		width: 1.75rem;
		height: 1.75rem;
	}

	.skip-label {
		position: absolute;
		bottom: 0.125rem;
		font-size: 0.5625rem;
		font-weight: 800;
	}

	.play-btn {
		width: 4.25rem;
		height: 4.25rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		border: none;
		border-bottom: 5px solid var(--color-secondary);
		background: var(--color-text);
		color: var(--color-bg);
		box-shadow: var(--shadow-lg);
		transform: translateY(0);
		transition: transform 0.12s var(--ease-spring), border-bottom-width 0.08s ease, filter 0.15s ease;
	}

	.play-btn:hover {
		filter: brightness(1.15);
		transform: translateY(-1px);
	}

	.play-btn:active {
		transform: translateY(3px);
		border-bottom-width: 2px;
		filter: brightness(0.92);
	}

	.play-icon {
		width: 1.75rem;
		height: 1.75rem;
	}

	.play-icon-play {
		margin-left: 0.125rem;
	}

	/* ── Actions ── */
	.player-actions {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding-top: 1rem;
		border-top: 2px solid var(--color-border);
	}

	.action-chip {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius-full);
		border: 2px solid var(--color-border);
		background: var(--color-surface);
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
	}

	.action-chip:hover {
		border-color: var(--color-primary-light);
		color: var(--color-primary);
	}

	.action-chip-active {
		background: var(--color-primary-subtle);
		border-color: var(--color-primary-light);
		color: var(--color-primary);
	}

	.action-icon {
		width: 0.875rem;
		height: 0.875rem;
	}

	/* ── Transcript ── */
	.transcript-area {
		margin-top: 1rem;
	}

	.transcript-empty {
		padding: 1.5rem;
		border-radius: var(--radius-lg);
		background: var(--color-surface-raised);
		font-size: 0.875rem;
		font-style: italic;
		color: var(--color-text-muted);
	}

	/* ── Continue ── */
	.continue-area {
		margin-top: 1.5rem;
		text-align: center;
	}

	.continue-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 2.25rem;
		border-radius: var(--radius-xl);
		border: none;
		border-bottom: 5px solid var(--color-primary-dark);
		background: var(--color-primary);
		color: white;
		font-family: 'Outfit', system-ui, sans-serif;
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
		box-shadow: var(--shadow-md);
		transform: translateY(0);
		transition: transform 0.12s var(--ease-spring), border-bottom-width 0.08s ease, filter 0.15s ease;
	}

	.continue-btn:hover {
		filter: brightness(1.12);
		transform: translateY(-1px);
	}

	.continue-btn:active {
		transform: translateY(3px);
		border-bottom-width: 2px;
		filter: brightness(0.95);
	}

	.continue-arrow {
		width: 1.125rem;
		height: 1.125rem;
	}
</style>
