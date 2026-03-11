<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutData } from './$types';

	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	let puzzleCount = $derived(
		data.user ? '0/9 pieces' : null
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="bg-surface border-b border-surface-raised">
	<div class="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
		<a href="/" class="text-lg font-bold text-primary">FeedbackLoop</a>

		{#if data.user}
			<div class="flex items-center gap-4">
				<a href="/puzzle" class="text-sm text-accent hover:underline">
					{puzzleCount}
				</a>
				<span class="text-sm text-text-muted">{data.user.name}</span>
			</div>
		{/if}
	</div>
</nav>

<main class="mx-auto max-w-2xl p-4">
	{@render children()}
</main>
