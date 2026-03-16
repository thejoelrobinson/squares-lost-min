<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import SparkCoin from '$lib/components/SparkCoin.svelte';
	import SoundToggle from '$lib/components/SoundToggle.svelte';
	import type { LayoutData } from './$types';

	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	let sparkCount = $derived(
		data.user ? `${data.sparkCount}/7` : null
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="bg-primary shadow-md">
	<div class="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
		<a href="/" class="flex items-center gap-2 text-lg font-bold text-white">
			<svg viewBox="0 0 28 32" class="h-6 w-6" fill="#FFC220" aria-hidden="true">
				<path d="M19.69 14.58c.65-.14 6.45-2.84 6.97-3.15 1.18-.69 1.59-2.23.9-3.43-.68-1.2-2.19-1.61-3.37-.92-.52.3-5.72 4.06-6.16 4.57-.51.58-.6 1.42-.22 2.08.38.66 1.13 1 1.88.85z"/>
				<path d="M26.66 20.57c-.52-.3-6.32-3.01-6.97-3.15-.75-.16-1.51.18-1.88.85-.38.66-.29 1.5.22 2.08.44.51 5.64 4.27 6.16 4.57 1.18.69 2.69.28 3.37-.92.68-1.2.28-2.74-.9-3.43z"/>
				<path d="M13.95 20.53c-.75 0-1.42.5-1.66 1.24-.21.65-.81 7.11-.81 7.72 0 1.39 1.1 2.51 2.47 2.51s2.47-1.13 2.47-2.51c0-.61-.6-7.07-.81-7.72-.24-.74-.91-1.24-1.66-1.24z"/>
				<path d="M8.21 17.42c-.66.14-6.45 2.84-6.97 3.15-1.18.69-1.59 2.23-.9 3.43.68 1.2 2.19 1.62 3.37.92.52-.3 5.72-4.06 6.16-4.57.51-.58.6-1.42.22-2.08-.38-.66-1.13-1-1.88-.85z"/>
				<path d="M3.71 7.08c-1.18-.69-2.69-.28-3.37.92-.69 1.2-.28 2.74.9 3.43.52.3 6.32 3.01 6.97 3.15.75.16 1.51-.18 1.88-.85.38-.66.29-1.5-.22-2.08-.44-.51-5.64-4.27-6.16-4.57z"/>
				<path d="M13.95 0c-1.36 0-2.47 1.13-2.47 2.51 0 .61.6 7.07.81 7.72.24.74.91 1.24 1.66 1.24s1.42-.5 1.66-1.24c.21-.65.81-7.11.81-7.72C16.42 1.13 15.31 0 13.95 0z"/>
			</svg>
			FeedbackLoop
		</a>

		{#if data.user}
			<div class="flex items-center gap-4">
				<a href="/puzzle" class="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-accent transition hover:bg-white/25">
					<SparkCoin size={20} />
					{sparkCount}
				</a>
				<span class="text-sm font-medium text-white/80">{data.user.name}</span>
				<div class="text-white">
					<SoundToggle />
				</div>
			</div>
		{/if}
	</div>
</nav>

<main class="mx-auto max-w-2xl p-4">
	{@render children()}
</main>
