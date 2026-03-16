<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import SparkCoin from '$lib/components/SparkCoin.svelte';
	import SoundToggle from '$lib/components/SoundToggle.svelte';
	import { onNavigate } from '$app/navigation';
	import { navigating } from '$app/stores';
	import type { LayoutData } from './$types';

	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	let sparkCount = $derived(
		data.user ? `${data.sparkCount}/7` : null
	);

	let streak = $derived((data as Record<string, unknown>).streak as number ?? 0);

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

				<div class="nav-avatar">
					<span class="avatar-letter">{data.user.name.charAt(0).toUpperCase()}</span>
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
		background: var(--color-surface);
		border-bottom: 2px solid var(--color-border);
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
		padding: 0.625rem 1.25rem;
	}

	/* ── Brand ── */
	.nav-brand {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		text-decoration: none;
		transition: transform 0.2s var(--ease-spring);
	}

	.nav-brand:hover { transform: scale(1.02); }
	.nav-brand:active { transform: scale(0.98); }

	.brand-mark {
		width: 2.125rem;
		height: 2.125rem;
		border-radius: var(--radius-lg);
		background: var(--color-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		box-shadow: 0 3px 0 var(--color-primary-dark);
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
		padding: 0.3125rem 0.625rem;
		border-radius: var(--radius-full);
		border: 2px solid var(--color-border);
		border-bottom-width: 3px;
		border-bottom-color: var(--color-border-strong);
		background: var(--color-surface);
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--color-text);
		text-decoration: none;
		transition: transform 0.15s var(--ease-spring), border-color 0.15s ease;
	}

	.nav-chip:hover {
		transform: translateY(-1px);
		border-color: var(--color-border-strong);
	}

	.nav-chip:active { transform: translateY(1px); }

	.nav-chip-streak { color: var(--color-accent-dark); }
	.nav-chip-streak .chip-icon { width: 0.875rem; height: 0.875rem; color: var(--color-accent); }
	.nav-chip-spark .chip-value { color: var(--color-accent-dark); }

	.nav-avatar {
		width: 2rem;
		height: 2rem;
		border-radius: var(--radius-full);
		background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 0 var(--color-primary-dark);
	}

	.avatar-letter {
		font-family: 'Bricolage Grotesque', system-ui, sans-serif;
		font-size: 0.75rem;
		font-weight: 800;
		color: white;
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
		background: var(--color-surface);
		border-top: 2px solid var(--color-border);
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
