<script lang="ts">
	import type { Component } from 'svelte';
	import { loadLessonArticle } from '$lib/content/loader';
	import ArticleAsk from '$lib/components/ArticleAsk.svelte';

	interface Props {
		slug: string;
		title: string;
		partNumber?: number;
		onComplete: () => void;
	}

	let { slug, title, partNumber = 1, onComplete }: Props = $props();

	let ArticleContent = $state<Component | null>(null);
	let readingTime = $state<number | null>(null);
	let loading = $state(true);
	let scrollEl = $state<HTMLDivElement | undefined>(undefined);
	let hasRead = $state(false);
	let scrollProgress = $state(0);
	let askOpen = $state(false);
	let pinging = $state(false);



	// Pulse the Ask Sam button for a few seconds once article loads
	$effect(() => {
		if (pinging) {
			const t = setTimeout(() => {
				pinging = false;
			}, 3600);
			return () => clearTimeout(t);
		}
	});

	function handleScroll() {
		if (!scrollEl) return;
		const { scrollTop, scrollHeight, clientHeight } = scrollEl;
		const scrollable = scrollHeight - clientHeight;
		if (scrollable <= 0) {
			// Content fits without scrolling — treat as fully read
			hasRead = true;
			scrollProgress = 100;
			return;
		}
		scrollProgress = Math.round((scrollTop / scrollable) * 100);
		if (scrollProgress >= 80) {
			hasRead = true;
		}
	}

	$effect(() => {
		loading = true;
		loadLessonArticle(slug).then((result) => {
			if (result) {
				ArticleContent = result.component;
				readingTime = result.readingTime;
			} else {
				ArticleContent = null;
				readingTime = null;
			}
			loading = false;
			pinging = true;
			// After DOM updates, check if content requires scrolling at all
			requestAnimationFrame(() => handleScroll());
		});
	});
</script>

<article class="flex flex-col gap-0">
	{#if loading}
		<div class="overflow-hidden rounded-xl shadow-xl">
			<!-- Skeleton masthead -->
			<div
				class="h-28 animate-pulse bg-gradient-to-br from-secondary via-primary to-primary-light opacity-60"
			></div>
			<!-- Skeleton text lines -->
			<div class="space-y-3 bg-surface px-6 py-5">
				{#each [80, 95, 70, 90, 65] as width (width)}
					<div
						class="h-3 animate-pulse rounded-full bg-surface-raised"
						style="width: {width}%"
					></div>
				{/each}
			</div>
		</div>
	{:else if ArticleContent}
		<!-- Card — relative so the floating button + overlay are contained -->
		<div class="relative overflow-hidden rounded-xl shadow-xl">
			<!-- Visual masthead -->
			<div
				class="relative overflow-hidden bg-gradient-to-br from-secondary via-primary to-primary-light"
			>
				<!-- Dot pattern overlay -->
				<div
					class="absolute inset-0 opacity-10"
					style="background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px); background-size: 40px 40px;"
					aria-hidden="true"
				></div>

				<!-- Content -->
				<div class="relative px-6 py-5">
					<div class="mb-2 flex items-center gap-2">
						<span
							class="inline-flex items-center rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-widest text-accent"
						>
							Lesson {partNumber}
						</span>
						{#if readingTime !== null}
							<span
								class="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/70"
							>
								<svg
									class="h-3 w-3"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="2"
								>
									<circle cx="12" cy="12" r="10" />
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M12 6v6l4 2"
									/>
								</svg>
								~{readingTime} min read
							</span>
						{/if}
					</div>
					<h2 class="text-xl font-bold leading-snug tracking-tight text-white">{title}</h2>
					<p class="mt-1 text-xs font-semibold uppercase tracking-wider text-white/50">
						FeedbackLoop — Article
					</p>
				</div>
			</div>

			<!-- Reading area with scroll gate -->
			<div class="relative">
				<div
					bind:this={scrollEl}
					onscroll={handleScroll}
					class="prose
					max-h-[62vh] overflow-y-auto
					bg-surface px-6 pt-5 pb-16 text-text
					[--tw-prose-body:var(--color-text)]
					[--tw-prose-headings:var(--color-text)]
					[--tw-prose-bold:var(--color-text)]
					[--tw-prose-bullets:var(--color-primary)]
					[--tw-prose-links:var(--color-primary)]
					[--tw-prose-quote-borders:var(--color-accent)]
					article-prose"
				>
					<!-- Sticky progress bar -->
					<div class="sticky top-0 z-10 -mx-6 -mt-5 mb-5">
						<div class="h-0.5 w-full bg-surface-raised">
							<div
								class="h-full rounded-r-full bg-primary transition-[width] duration-150"
								style="width: {scrollProgress}%"
							></div>
						</div>
					</div>

					<ArticleContent />
				</div>

				<!-- Bottom fade overlay — hints at more content when not yet read -->
				{#if !hasRead}
					<div
						class="pointer-events-none absolute inset-x-0 bottom-0 h-20 rounded-b-xl bg-gradient-to-t from-surface to-transparent"
						aria-hidden="true"
					></div>
				{/if}
			</div>

			<!-- Floating Ask Jamie trigger — always visible while reading -->
			<div class="absolute bottom-4 right-4 z-20">
				{#if pinging}
					<span
						class="absolute -inset-1.5 animate-ping rounded-full bg-primary opacity-20"
						aria-hidden="true"
					></span>
				{/if}
				<button
					type="button"
					class="relative flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/40 active:scale-95"
					onclick={() => (askOpen = true)}
					aria-label="Ask Jamie a question about this article"
				>
					<svg
						class="h-4 w-4 shrink-0"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="1.75"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
						/>
					</svg>
					Ask Jamie
				</button>
			</div>

			<!-- Ask Sam overlay — lives inside the card -->
			<ArticleAsk lessonSlug={slug} open={askOpen} onClose={() => (askOpen = false)} />
		</div>
	{:else}
		<div class="overflow-hidden rounded-xl bg-surface-raised p-6 shadow-sm">
			<p class="py-8 text-center text-text-muted">No article available for this lesson.</p>
		</div>
	{/if}

	<!-- Continue button — revealed when hasRead with animation -->
	{#if hasRead}
		<div class="mt-6 text-center" style="animation: fadeSlideUp 0.4s ease-out both;">
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
</article>

<style>
	/* Premium blockquote override — matches SamQuote aesthetic */
	:global(.article-prose blockquote) {
		position: relative;
		overflow: hidden;
		border-left: 4px solid var(--color-accent);
		border-radius: 0.5rem;
		background-color: var(--color-secondary);
		padding: 1.25rem 1.25rem 1.25rem 1.5rem;
		margin-top: 1.5rem;
		margin-bottom: 1.5rem;
		font-style: italic;
		color: white;
	}

	:global(.article-prose blockquote p) {
		color: white;
		margin: 0;
	}

	:global(.article-prose blockquote p::before),
	:global(.article-prose blockquote p::after) {
		content: '';
	}

	/* Entrance animation for Continue button */
	@keyframes fadeSlideUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
