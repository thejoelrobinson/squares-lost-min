<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quartOut } from 'svelte/easing';

	interface Message {
		role: 'user' | 'sam';
		text: string;
	}

	interface Props {
		lessonSlug: string;
		open: boolean;
		onClose: () => void;
	}

	let { lessonSlug, open, onClose }: Props = $props();

	let input = $state('');
	let messages = $state<Message[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let hasGreeted = $state(false);
	let messagesEl = $state<HTMLDivElement | undefined>(undefined);
	let inputEl = $state<HTMLTextAreaElement | undefined>(undefined);

	// Prompt starters — Clarify vs Apply split
	const starters = [
		{ label: 'Break this down simply', icon: '💬' },
		{ label: 'Give me a real example', icon: '🎯' },
		{ label: 'How do I try this in a 1:1?', icon: '🤝' },
		{ label: "Why does this matter?", icon: '💡' }
	];

	// Sam opens the conversation — no blank state
	$effect(() => {
		if (open && !hasGreeted) {
			hasGreeted = true;
			setTimeout(() => {
				messages = [
					{
						role: 'sam',
						text: "I'm here to help you go deeper on what you just read. What clicked for you, what confused you, or what do you want to try in your next 1:1?"
					}
				];
			}, 480);
		}
	});

	$effect(() => {
		if (inputEl && open) {
			setTimeout(() => inputEl?.focus(), 520);
		}
	});

	$effect(() => {
		if (messagesEl && messages.length > 0) {
			messagesEl.scrollTop = messagesEl.scrollHeight;
		}
	});

	async function send(text?: string) {
		const question = (text ?? input).trim();
		if (!question || loading) return;

		input = '';
		error = null;
		messages = [...messages, { role: 'user', text: question }];
		loading = true;

		const history = messages.slice(0, -1).map((m) => ({
			role: m.role === 'user' ? 'user' : 'assistant',
			content: m.text
		}));

		try {
			const res = await fetch('/api/article/ask', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ lessonSlug, question, history })
			});
			if (!res.ok) throw new Error('Request failed');
			const data = await res.json();
			messages = [...messages, { role: 'sam', text: data.answer }];
		} catch {
			error = 'Something went wrong. Please try again.';
			messages = messages.slice(0, -1);
		} finally {
			loading = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}

	function handleBackdropKey(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}
</script>

{#if open}
	<!-- Scrim -->
	<div
		class="absolute inset-0 z-30 rounded-xl bg-black/70"
		transition:fade={{ duration: 200 }}
		onclick={onClose}
		onkeydown={handleBackdropKey}
		role="button"
		tabindex="-1"
		aria-label="Close"
	></div>

	<!-- Sheet -->
	<div
		class="panel absolute inset-x-0 bottom-0 z-40 flex flex-col rounded-t-3xl bg-surface"
		style="height: 90%"
		transition:fly={{ y: 480, duration: 440, opacity: 1, easing: quartOut }}
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
		role="dialog"
		tabindex="-1"
		aria-modal="true"
		aria-label="Ask Sam"
	>
		<!-- Drag handle -->
		<div class="flex shrink-0 justify-center pb-1 pt-3" aria-hidden="true">
			<div class="h-1 w-10 rounded-full bg-text/10"></div>
		</div>

		<!-- Header -->
		<div class="shrink-0 px-5 pb-4 pt-2">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="sam-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
						<svg
							class="h-4 w-4 text-white"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.75"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
							/>
						</svg>
					</div>
					<div>
						<p class="text-[13px] font-bold tracking-tight text-text">Agent</p>
						<p class="text-[11px] text-text-muted">Learning coach · always here</p>
					</div>
				</div>
				<button
					type="button"
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-surface-raised text-text-muted transition hover:text-text active:scale-95"
					onclick={onClose}
					aria-label="Close"
				>
					<svg
						class="h-[14px] w-[14px]"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2.5"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>

		<!-- Divider -->
		<div class="mx-5 shrink-0 border-t border-text/[0.06]"></div>

		<!-- Messages -->
		<div bind:this={messagesEl} class="flex-1 overflow-y-auto px-5 py-4">
			<div class="flex flex-col gap-4">
				{#each messages as msg, i (i)}
					{#if msg.role === 'sam'}
						<!-- Sam message — with inline avatar -->
						<div class="msg-enter flex items-start gap-2.5">
							<div
								class="sam-avatar mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
							>
								<svg
									class="h-[10px] w-[10px] text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
									/>
								</svg>
							</div>
							<div class="max-w-[82%]">
								<p class="mb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
									Agent
								</p>
								<div
									class="rounded-2xl rounded-tl-sm bg-surface-raised px-4 py-3 text-sm leading-relaxed text-text"
								>
									{msg.text}
								</div>
							</div>
						</div>
					{:else}
						<!-- User message -->
						<div class="msg-enter flex justify-end">
							<div class="max-w-[82%]">
								<p
									class="mb-1 text-right text-[10px] font-semibold uppercase tracking-widest text-text-muted"
								>
									You
								</p>
								<div
									class="rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm leading-relaxed text-white"
								>
									{msg.text}
								</div>
							</div>
						</div>
					{/if}
				{/each}

				<!-- Typing indicator -->
				{#if loading}
					<div class="msg-enter flex items-start gap-2.5">
						<div
							class="sam-avatar mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
						>
							<svg
								class="h-[10px] w-[10px] text-white"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
								/>
							</svg>
						</div>
						<div class="rounded-2xl rounded-tl-sm bg-surface-raised px-4 py-3.5">
							<span class="flex items-center gap-1.5">
								<span
									class="h-2 w-2 animate-bounce rounded-full bg-text-muted/50 [animation-delay:0ms]"
								></span>
								<span
									class="h-2 w-2 animate-bounce rounded-full bg-text-muted/50 [animation-delay:150ms]"
								></span>
								<span
									class="h-2 w-2 animate-bounce rounded-full bg-text-muted/50 [animation-delay:300ms]"
								></span>
							</span>
						</div>
					</div>
				{/if}

				{#if error}
					<p class="text-center text-xs text-error">{error}</p>
				{/if}
			</div>
		</div>

		<!-- Prompt starters (shown until first user message) -->
		{#if !messages.some((m) => m.role === 'user')}
			<div class="shrink-0 px-5 pb-3">
				<div class="grid grid-cols-2 gap-2">
					{#each starters as s (s.label)}
						<button
							type="button"
							class="starter-chip flex cursor-pointer items-center gap-2 rounded-2xl border border-text/[0.08] bg-surface-raised px-3.5 py-2.5 text-left text-xs font-medium text-text transition hover:border-primary/30 hover:bg-primary/5 active:scale-[0.97]"
							onclick={() => send(s.label)}
						>
							<span class="text-base leading-none">{s.icon}</span>
							<span class="leading-snug">{s.label}</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Input -->
		<div class="shrink-0 px-4 pb-5 pt-2">
			<div
				class="input-bar flex items-end gap-2 rounded-2xl border border-text/[0.08] bg-surface-raised px-4 py-2.5 transition-all focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb),0.08)]"
			>
				<textarea
					bind:this={inputEl}
					bind:value={input}
					onkeydown={handleKeydown}
					rows={1}
					placeholder="Ask anything…"
					disabled={loading}
					class="max-h-24 flex-1 resize-none bg-transparent py-0.5 text-sm leading-relaxed text-text placeholder:text-text-muted focus:outline-none disabled:opacity-50"
				></textarea>
				<button
					type="button"
					onclick={() => send()}
					disabled={loading || !input.trim()}
					class="send-btn mb-0.5 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-primary text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-25"
					aria-label="Send"
				>
					<svg
						class="h-3.5 w-3.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2.5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.269 20.876L5.999 12zm0 0h7.5"
						/>
					</svg>
				</button>
			</div>
			<p class="mt-2 text-center text-[10px] text-text-muted/60">
				Enter ↵ to send · Shift+Enter for new line
			</p>
		</div>
	</div>
{/if}

<style>
	/* Panel elevation — upward shadow makes it feel like it's floating above content */
	.panel {
		box-shadow:
			0 -24px 80px rgba(0, 0, 0, 0.28),
			0 -4px 16px rgba(0, 0, 0, 0.12);
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}

	/* Sam's signature gradient avatar */
	.sam-avatar {
		background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%);
		box-shadow:
			0 2px 8px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	/* Send button — tactile press feel */
	.send-btn:not(:disabled):hover {
		transform: scale(1.06);
		box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 40%, transparent);
	}
	.send-btn:not(:disabled):active {
		transform: scale(0.93);
	}

	/* Message entrance */
	.msg-enter {
		animation: msgIn 0.28s cubic-bezier(0.34, 1.2, 0.64, 1) both;
	}

	@keyframes msgIn {
		from {
			opacity: 0;
			transform: translateY(10px) scale(0.97);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* Prompt chip — subtle lift on hover */
	.starter-chip:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	}

	/* Input focus ring — uses primary color with transparency */
	.input-bar {
		transition:
			border-color 150ms ease,
			box-shadow 150ms ease;
	}

	/* Respect reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.msg-enter {
			animation: none;
		}
		.starter-chip:hover {
			transform: none;
		}
		.send-btn:not(:disabled):hover {
			transform: none;
		}
	}
</style>
