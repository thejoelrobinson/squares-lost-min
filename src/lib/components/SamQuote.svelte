<script lang="ts">
	import type { SamQuote } from '$lib/content/sam-quotes';

	let { quote }: { quote: SamQuote } = $props();

	let visible = $state(false);

	$effect(() => {
		const id = requestAnimationFrame(() => {
			visible = true;
		});
		return () => cancelAnimationFrame(id);
	});
</script>

<div class="sam-quote" class:sam-quote-visible={visible}>
	<!-- Decorative Spark watermark -->
	<svg
		class="sam-quote-watermark"
		viewBox="0 0 28 32"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path d="M19.69 14.58c.66-.14 6.45-2.84 6.97-3.15 1.18-.69 1.59-2.23.9-3.43-.68-1.2-2.19-1.62-3.37-.92-.52.3-5.72 4.06-6.16 4.57-.51.58-.6 1.42-.22 2.08.38.66 1.13 1 1.88.85z" fill="currentColor"/>
		<path d="M26.66 20.57c-.52-.3-6.32-3.01-6.97-3.15-.75-.16-1.51.18-1.88.85-.38.66-.29 1.5.22 2.08.44.51 5.64 4.27 6.16 4.57 1.18.69 2.69.28 3.37-.92.68-1.2.28-2.74-.9-3.43z" fill="currentColor"/>
		<path d="M13.95 20.53c-.75 0-1.42.5-1.66 1.24-.21.65-.81 7.11-.81 7.72 0 1.39 1.1 2.51 2.47 2.51s2.47-1.13 2.47-2.51c0-.61-.6-7.07-.81-7.72-.24-.74-.91-1.24-1.66-1.24z" fill="currentColor"/>
		<path d="M8.21 17.42c-.66.14-6.45 2.84-6.97 3.15-1.18.69-1.59 2.23-.9 3.43.68 1.2 2.19 1.62 3.37.92.52-.3 5.72-4.06 6.16-4.57.51-.58.6-1.42.22-2.08-.38-.66-1.13-1-1.88-.85z" fill="currentColor"/>
		<path d="M3.71 7.08c-1.18-.69-2.69-.28-3.37.92-.69 1.2-.28 2.74.9 3.43.52.3 6.32 3.01 6.97 3.15.75.16 1.51-.18 1.88-.85.38-.66.29-1.5-.22-2.08-.44-.51-5.64-4.27-6.16-4.57z" fill="currentColor"/>
		<path d="M13.95 0c-1.36 0-2.47 1.13-2.47 2.51 0 .61.6 7.07.81 7.72.24.74.91 1.24 1.66 1.24s1.42-.5 1.66-1.24c.21-.65.81-7.11.81-7.72C16.42 1.13 15.31 0 13.95 0z" fill="currentColor"/>
	</svg>

	<!-- Large opening quote mark -->
	<svg class="sam-quote-mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
	</svg>

	<blockquote class="sam-quote-text">
		{quote.text}
	</blockquote>

	{#if quote.source}
		<cite class="sam-quote-source">&mdash; {quote.source}</cite>
	{/if}
</div>

<style>
	.sam-quote {
		position: relative;
		overflow: hidden;
		border-left: 4px solid var(--color-accent);
		border-radius: 0.75rem;
		background-color: var(--color-secondary);
		padding: 1.5rem 1.5rem 1.5rem 1.75rem;
		opacity: 0;
		transform: translateY(12px);
		transition:
			opacity 0.5s ease-out,
			transform 0.5s ease-out;
	}

	.sam-quote-visible {
		opacity: 1;
		transform: translateY(0);
	}

	/* Spark watermark in the background */
	.sam-quote-watermark {
		position: absolute;
		right: -8px;
		bottom: -10px;
		width: 80px;
		height: 80px;
		color: var(--color-accent);
		opacity: 0.12;
		pointer-events: none;
	}

	/* Opening quotation mark */
	.sam-quote-mark {
		width: 28px;
		height: 28px;
		color: var(--color-accent);
		opacity: 0.7;
		margin-bottom: 0.25rem;
	}

	.sam-quote-text {
		position: relative;
		font-size: 1.05rem;
		font-weight: 500;
		font-style: italic;
		line-height: 1.6;
		color: white;
		margin: 0;
	}

	.sam-quote-source {
		display: block;
		margin-top: 0.75rem;
		font-size: 0.8rem;
		font-style: normal;
		font-weight: 600;
		color: var(--color-accent);
		letter-spacing: 0.02em;
	}
</style>
