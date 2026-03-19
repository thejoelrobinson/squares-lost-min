<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import SparkCoin from '$lib/components/SparkCoin.svelte';
	import SoundToggle from '$lib/components/SoundToggle.svelte';
	import { onNavigate, goto, invalidateAll } from '$app/navigation';
	import { navigating } from '$app/stores';
	import type { LayoutData } from './$types';

	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	let sparkCount = $derived(
		data.user ? `${data.sparkCount}/7` : null
	);

	let streak = $derived((data as Record<string, unknown>).streak as number ?? 0);

	// Settings panel state
	let settingsOpen = $state(false);
	let confirmingReset = $state(false);
	let jumpOpen = $state(false);
	let busy = $state(false);

	function toggleSettings() {
		settingsOpen = !settingsOpen;
		if (!settingsOpen) {
			confirmingReset = false;
			jumpOpen = false;
		}
	}

	function closeSettings() {
		settingsOpen = false;
		confirmingReset = false;
		jumpOpen = false;
	}

	async function handleReset() {
		if (!confirmingReset) {
			confirmingReset = true;
			return;
		}
		busy = true;
		try {
			const res = await fetch('/api/settings/reset', { method: 'POST' });
			if (res.ok) {
				closeSettings();
				await invalidateAll();
				await goto('/');
			}
		} finally {
			busy = false;
			confirmingReset = false;
		}
	}

	async function handleJump(partNumber: number) {
		busy = true;
		try {
			const res = await fetch('/api/settings/jump', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ partNumber })
			});
			if (res.ok) {
				const { slug } = await res.json();
				closeSettings();
				await invalidateAll();
				await goto(`/lesson/${slug}`);
			}
		} finally {
			busy = false;
		}
	}

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	let progressWidth = $state(0);
	let progressVisible = $state(false);

	$effect(() => {
		if ($navigating) {
			progressWidth = 0;
			progressVisible = true;
			requestAnimationFrame(() => { progressWidth = 90; });
		} else if (progressVisible) {
			progressWidth = 100;
			const timeout = setTimeout(() => {
				progressVisible = false;
				progressWidth = 0;
			}, 300);
			return () => clearTimeout(timeout);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if progressVisible}
	<div
		class="nav-progress"
		class:nav-progress-done={progressWidth === 100}
		class:nav-progress-loading={progressWidth === 90}
		style="width: {progressWidth}%"
	></div>
{/if}

<nav class="top-nav">
	<div class="nav-inner">
		<a href="/" class="nav-brand">
			<div class="brand-mark">
				<svg viewBox="0 0 28 32" fill="currentColor" aria-hidden="true">
					<path d="M19.69 14.58c.65-.14 6.45-2.84 6.97-3.15 1.18-.69 1.59-2.23.9-3.43-.68-1.2-2.19-1.61-3.37-.92-.52.3-5.72 4.06-6.16 4.57-.51.58-.6 1.42-.22 2.08.38.66 1.13 1 1.88.85z"/>
					<path d="M26.66 20.57c-.52-.3-6.32-3.01-6.97-3.15-.75-.16-1.51.18-1.88.85-.38.66-.29 1.5.22 2.08.44.51 5.64 4.27 6.16 4.57 1.18.69 2.69.28 3.37-.92.68-1.2.28-2.74-.9-3.43z"/>
					<path d="M13.95 20.53c-.75 0-1.42.5-1.66 1.24-.21.65-.81 7.11-.81 7.72 0 1.39 1.1 2.51 2.47 2.51s2.47-1.13 2.47-2.51c0-.61-.6-7.07-.81-7.72-.24-.74-.91-1.24-1.66-1.24z"/>
					<path d="M8.21 17.42c-.66.14-6.45 2.84-6.97 3.15-1.18.69-1.59 2.23-.9 3.43.68 1.2 2.19 1.62 3.37.92.52-.3 5.72-4.06 6.16-4.57.51-.58.6-1.42.22-2.08-.38-.66-1.13-1-1.88-.85z"/>
					<path d="M3.71 7.08c-1.18-.69-2.69-.28-3.37.92-.69 1.2-.28 2.74.9 3.43.52.3 6.32 3.01 6.97 3.15.75.16 1.51-.18 1.88-.85.38-.66.29-1.5-.22-2.08-.44-.51-5.64-4.27-6.16-4.57z"/>
					<path d="M13.95 0c-1.36 0-2.47 1.13-2.47 2.51 0 .61.6 7.07.81 7.72.24.74.91 1.24 1.66 1.24s1.42-.5 1.66-1.24c.21-.65.81-7.11.81-7.72C16.42 1.13 15.31 0 13.95 0z"/>
				</svg>
			</div>
			<span class="brand-wordmark">Feedback<span class="brand-accent">Loop</span></span>
		</a>

		{#if data.user}
			<div class="nav-actions">
				<div class="nav-chip nav-chip-streak">
					<svg class="chip-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C5 0 3 3 3 6c0 1.5.5 2.8 1.3 3.8L3 14l2.5-1 .5 3 2-3 2 3 .5-3 2.5 1-1.3-4.2C12.5 8.8 13 7.5 13 6c0-3-2-6-5-6z"/></svg>
					<span class="chip-value">{streak}</span>
				</div>

				<a href="/puzzle" class="nav-chip nav-chip-spark">
					<SparkCoin size={20} />
					<span class="chip-value">{sparkCount}</span>
				</a>

				<div class="avatar-wrap">
					<button
						type="button"
						class="nav-avatar"
						class:nav-avatar-active={settingsOpen}
						onclick={toggleSettings}
						aria-label="Settings"
						aria-expanded={settingsOpen}
					>
						<span class="avatar-letter">{data.user.name.charAt(0).toUpperCase()}</span>
					</button>

					{#if settingsOpen}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="settings-backdrop" onclick={closeSettings} onkeydown={() => {}}></div>
						<div class="settings-panel">
							<div class="settings-header">
								<span class="settings-title">Settings</span>
							</div>

							<!-- Jump to Lesson -->
							<button
								type="button"
								class="settings-item"
								onclick={() => (jumpOpen = !jumpOpen)}
								disabled={busy}
							>
								<svg class="settings-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
								</svg>
								Jump to lesson
								<svg
									class="settings-chevron"
									class:settings-chevron-open={jumpOpen}
									fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
								</svg>
							</button>

							{#if jumpOpen}
								<div class="jump-list">
									{#each data.allLessons as lesson (lesson.partNumber)}
										<button
											type="button"
											class="jump-item"
											onclick={() => handleJump(lesson.partNumber)}
											disabled={busy}
										>
											<span class="jump-num">{lesson.partNumber}</span>
											<span class="jump-title">{lesson.title}</span>
										</button>
									{/each}
								</div>
							{/if}

							<div class="settings-divider"></div>

							<!-- Reset -->
							<button
								type="button"
								class="settings-item settings-item-danger"
								onclick={handleReset}
								disabled={busy}
							>
								<svg class="settings-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
								{#if confirmingReset}
									Tap again to confirm reset
								{:else}
									Reset all progress
								{/if}
							</button>
						</div>
					{/if}
				</div>

				<SoundToggle />
			</div>
		{/if}
	</div>
</nav>

<main class="app-main" style="view-transition-name: main">
	{@render children()}
</main>

{#if data.user}
	<nav class="bottom-nav">
		<a href="/" class="bnav-item">
			<svg class="bnav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
			</svg>
			<span class="bnav-label">Learn</span>
		</a>
		<a href="/puzzle" class="bnav-item">
			<SparkCoin size={20} />
			<span class="bnav-label">Sparks</span>
		</a>
	</nav>
{/if}

<style>
	/* ── Progress ── */
	.nav-progress {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 100;
		height: 3px;
		background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
		border-radius: 0 2px 2px 0;
	}
	.nav-progress-loading { transition: width 2s cubic-bezier(0.1, 0.45, 0.1, 0.9); }
	.nav-progress-done { transition: width 0.3s ease, opacity 0.3s ease; opacity: 0; }

	/* ── Top Nav ── */
	.top-nav {
		background: oklch(99% 0.003 280 / 0.78);
		backdrop-filter: blur(24px) saturate(1.6);
		-webkit-backdrop-filter: blur(24px) saturate(1.6);
		border-bottom: 1px solid oklch(0% 0 0 / 0.05);
		position: sticky;
		top: 0;
		z-index: 40;
	}

	.nav-inner {
		max-width: 42rem;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.25rem;
	}

	/* ── Brand ── */
	.nav-brand {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		text-decoration: none;
		transition: transform 0.2s var(--ease-smooth);
	}

	.nav-brand:hover { transform: scale(1.02); }
	.nav-brand:active { transform: scale(0.98); }

	.brand-mark {
		width: 2.25rem;
		height: 2.25rem;
		border-radius: var(--radius-lg);
		background: linear-gradient(145deg, var(--color-primary), var(--color-primary-dark));
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		box-shadow: 0 2px 8px oklch(44% 0.26 280 / 0.25), 0 1px 2px oklch(16% 0.02 280 / 0.1);
	}

	.brand-mark svg { width: 1.125rem; height: 1.125rem; }

	.brand-wordmark {
		font-family: 'Bricolage Grotesque', system-ui, sans-serif;
		font-size: 1.25rem;
		font-weight: 800;
		color: var(--color-text);
		letter-spacing: -0.04em;
	}

	.brand-accent { color: var(--color-primary); }

	/* ── Nav Actions ── */
	.nav-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.nav-chip {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		border-radius: var(--radius-full);
		border: 1px solid oklch(0% 0 0 / 0.06);
		background: oklch(100% 0 0 / 0.6);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--color-text);
		text-decoration: none;
		transition: transform 0.2s var(--ease-smooth), border-color 0.2s ease, box-shadow 0.2s ease;
		box-shadow: 0 1px 3px oklch(16% 0.02 280 / 0.06);
	}

	.nav-chip:hover {
		transform: translateY(-1px);
		border-color: var(--color-border-strong);
		box-shadow: 0 3px 8px oklch(16% 0.02 280 / 0.1);
	}

	.nav-chip:active { transform: translateY(0); box-shadow: none; }

	.nav-chip-streak { color: var(--color-accent-dark); }
	.nav-chip-streak .chip-icon { width: 0.875rem; height: 0.875rem; color: var(--color-accent); }
	.nav-chip-spark .chip-value { color: var(--color-accent-dark); }

	.avatar-wrap {
		position: relative;
	}

	.nav-avatar {
		width: 2.125rem;
		height: 2.125rem;
		border-radius: var(--radius-full);
		background: linear-gradient(145deg, var(--color-primary), var(--color-primary-light));
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 6px oklch(44% 0.26 280 / 0.2), 0 0 0 2px oklch(100% 0 0 / 0.5);
		border: none;
		cursor: pointer;
		transition: transform 0.15s var(--ease-smooth), box-shadow 0.15s ease;
	}

	.nav-avatar:hover {
		transform: scale(1.08);
		box-shadow: 0 3px 10px oklch(44% 0.26 280 / 0.3), 0 0 0 2px oklch(100% 0 0 / 0.5);
	}

	.nav-avatar:active {
		transform: scale(0.95);
	}

	.nav-avatar-active {
		box-shadow: 0 2px 6px oklch(44% 0.26 280 / 0.2), 0 0 0 2.5px var(--color-primary-light);
	}

	.avatar-letter {
		font-family: 'Bricolage Grotesque', system-ui, sans-serif;
		font-size: 0.75rem;
		font-weight: 800;
		color: white;
	}

	/* ── Settings Panel ── */
	.settings-backdrop {
		position: fixed;
		inset: 0;
		z-index: 49;
	}

	.settings-panel {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		z-index: 50;
		width: 16rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		box-shadow: 0 8px 32px oklch(16% 0.02 280 / 0.12), 0 2px 8px oklch(16% 0.02 280 / 0.06);
		overflow: hidden;
		animation: settings-in 0.15s var(--ease-out-expo);
	}

	@keyframes settings-in {
		from { opacity: 0; transform: translateY(-4px) scale(0.97); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	.settings-header {
		padding: 0.75rem 1rem 0.5rem;
	}

	.settings-title {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-subtle);
	}

	.settings-item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
		padding: 0.625rem 1rem;
		border: none;
		background: none;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text);
		cursor: pointer;
		text-align: left;
		transition: background 0.1s ease;
	}

	.settings-item:hover {
		background: var(--color-surface-raised);
	}

	.settings-item:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.settings-item-icon {
		width: 1rem;
		height: 1rem;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.settings-chevron {
		width: 0.875rem;
		height: 0.875rem;
		color: var(--color-text-muted);
		margin-left: auto;
		transition: transform 0.2s var(--ease-smooth);
	}

	.settings-chevron-open {
		transform: rotate(180deg);
	}

	.settings-divider {
		height: 1px;
		background: var(--color-border);
		margin: 0.25rem 0;
	}

	.settings-item-danger {
		color: var(--color-error, #dc2626);
	}

	.settings-item-danger .settings-item-icon {
		color: var(--color-error, #dc2626);
	}

	/* ── Jump List ── */
	.jump-list {
		max-height: 14rem;
		overflow-y: auto;
		padding: 0.25rem 0;
	}

	.jump-item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
		padding: 0.5rem 1rem 0.5rem 2.625rem;
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
		transition: background 0.1s ease;
	}

	.jump-item:hover {
		background: var(--color-surface-raised);
	}

	.jump-item:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.jump-num {
		width: 1.375rem;
		height: 1.375rem;
		border-radius: var(--radius-full);
		background: var(--color-primary-subtle);
		color: var(--color-primary);
		font-size: 0.6875rem;
		font-weight: 800;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.jump-title {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* ── Main ── */
	.app-main {
		max-width: 42rem;
		margin: 0 auto;
		padding: 1.75rem 1.25rem 7rem;
	}

	@media (min-width: 768px) {
		.app-main { padding-bottom: 2.5rem; }
	}

	/* ── Bottom Nav ── */
	.bottom-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 40;
		background: oklch(99% 0.003 280 / 0.78);
		backdrop-filter: blur(24px) saturate(1.6);
		-webkit-backdrop-filter: blur(24px) saturate(1.6);
		border-top: 1px solid oklch(0% 0 0 / 0.05);
		padding-bottom: env(safe-area-inset-bottom);
		display: flex;
		justify-content: space-around;
	}

	@media (min-width: 768px) { .bottom-nav { display: none; } }

	.bnav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.125rem;
		padding: 0.5rem 1.5rem;
		text-decoration: none;
		color: var(--color-text-muted);
		transition: color 0.15s ease;
	}

	.bnav-item:hover { color: var(--color-primary); }

	.bnav-icon { width: 1.375rem; height: 1.375rem; }

	.bnav-label {
		font-size: 0.5625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
</style>
