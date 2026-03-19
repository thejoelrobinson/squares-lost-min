<script lang="ts">
	import { Conversation, type Mode } from '@11labs/client';
	import type { DisconnectionDetails } from '@11labs/client';
	import type { StructuredFeedback } from '$lib/types';
	import Button from './Button.svelte';
	import Card from './Card.svelte';
	import FeedbackPanel from './FeedbackPanel.svelte';

	let {
		lessonId: _lessonId,
		lessonSlug,
		onComplete,
		heading = 'Ready to Talk?',
		description = 'Tap below and start talking naturally — just like a real conversation.'
	}: {
		lessonId: string;
		lessonSlug: string;
		onComplete: (score: number, feedback?: StructuredFeedback) => void;
		heading?: string;
		description?: string;
	} = $props();

	let status = $state<'idle' | 'connecting' | 'active' | 'processing' | 'done' | 'error'>('idle');
	let transcript = $state<Array<{ role: 'user' | 'ai'; text: string }>>([]);
	let agentConfig = $state<{
		agentId: string;
		dynamicVariables?: Record<string, string | number | boolean>;
	} | null>(null);
	let error = $state<string | null>(null);
	let mode = $state<Mode>('listening');
	let conversation: Conversation | null = null;
	let score = $state<number | null>(null);
	let feedbackData = $state<StructuredFeedback | undefined>();

	let isSpeaking = $derived(mode === 'speaking');

	// Clean up conversation on unmount
	$effect(() => {
		return () => {
			if (conversation) {
				conversation.endSession();
				conversation = null;
			}
		};
	});

	function scrollToBottom(node: HTMLElement) {
		if (transcript.length > 0) {
			node.scrollTop = node.scrollHeight;
		}
	}

	async function fetchAgentConfig() {
		try {
			const res = await fetch(
				`/api/comprehension/agent-config?lessonId=${encodeURIComponent(lessonSlug)}`
			);
			if (!res.ok) {
				throw new Error('Failed to fetch agent configuration');
			}
			const data = await res.json();
			if (!data.agentId) {
				throw new Error('No agent ID configured');
			}
			agentConfig = data;
		} catch (err) {
			error =
				err instanceof Error ? err.message : 'Failed to load voice configuration';
			status = 'error';
		}
	}

	async function startConversation() {
		status = 'connecting';
		error = null;
		transcript = [];

		await fetchAgentConfig();
		if (!agentConfig) return;

		try {
			const conv = await Conversation.startSession({
				agentId: agentConfig.agentId,
				connectionType: 'websocket',
				useWakeLock: true,
				dynamicVariables: agentConfig.dynamicVariables ?? {},
				onConnect: () => {
					status = 'active';
				},
				onMessage: (props: { message: string; source: 'user' | 'ai' }) => {
					transcript = [...transcript, { role: props.source, text: props.message }];
				},
				onError: (message: string) => {
					error = message;
					status = 'error';
				},
				onModeChange: (prop: { mode: Mode }) => {
					mode = prop.mode;
				},
				onDisconnect: (details: DisconnectionDetails) => {
					conversation = null;
					if (details.reason !== 'user' && status === 'active') {
						handleConversationEnd();
					}
				}
			});
			conversation = conv;
		} catch (err) {
			const msg = err instanceof Error ? err.message : '';
			error = msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied')
				? 'Microphone access is required. Please allow microphone access and try again.'
				: 'Failed to start voice conversation.';
			status = 'error';
		}
	}

	async function endConversation() {
		if (conversation) {
			await conversation.endSession();
			conversation = null;
		}
		handleConversationEnd();
	}

	async function handleConversationEnd() {
		if (status === 'processing' || status === 'done') return;

		status = 'processing';
		conversation = null;

		try {
			const res = await fetch('/api/comprehension/evaluate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					lessonId: lessonSlug,
					mode: 'voice',
					transcript: transcript.map((t) => ({
						role: t.role,
						content: t.text
					}))
				})
			});

			if (!res.ok) {
				throw new Error(`Failed to evaluate comprehension: ${res.status}`);
			}

			const result = await res.json();
			const finalScore: number = result.score ?? 0;
			score = finalScore;
			feedbackData = result;
			status = 'done';
		} catch (err) {
			error =
				err instanceof Error ? err.message : 'Failed to evaluate conversation';
			status = 'error';
		}
	}
</script>

<Card variant="featured" class="flex flex-col gap-5">
	{#if status === 'idle'}
		<div class="flex flex-col items-center gap-4 py-8">
			<div class="rounded-full bg-primary/10 p-6">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-12 w-12 text-primary"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
					/>
				</svg>
			</div>
			<h3 class="text-lg font-semibold text-text">{heading}</h3>
			<p class="max-w-sm text-center text-sm text-text-muted">
				{description}
			</p>
			<Button onclick={startConversation} size="lg" variant="cta">Start Talking</Button>
		</div>

	{:else if status === 'connecting'}
		<div class="flex flex-col items-center gap-4 py-8">
			<div class="voice-pulse voice-pulse--connecting">
				<div class="voice-pulse__ring"></div>
				<div class="voice-pulse__ring voice-pulse__ring--delay-1"></div>
				<div class="voice-pulse__ring voice-pulse__ring--delay-2"></div>
				<div class="voice-pulse__core"></div>
			</div>
			<p class="text-sm font-medium text-text-muted">Connecting...</p>
		</div>

	{:else if status === 'active'}
		<div class="flex flex-col gap-4">
			<!-- Speaking/Listening indicator -->
			<div class="flex flex-col items-center gap-3 py-4">
				{#if isSpeaking}
					<div class="voice-pulse voice-pulse--speaking" aria-label="AI is speaking">
						<div class="voice-pulse__ring"></div>
						<div class="voice-pulse__ring voice-pulse__ring--delay-1"></div>
						<div class="voice-pulse__ring voice-pulse__ring--delay-2"></div>
						<div class="voice-pulse__core voice-pulse__core--speaking"></div>
					</div>
					<p class="text-sm font-medium text-success">AI is speaking...</p>
				{:else}
					<div class="voice-pulse voice-pulse--listening" aria-label="Listening to you">
						<div class="voice-pulse__ring"></div>
						<div class="voice-pulse__ring voice-pulse__ring--delay-1"></div>
						<div class="voice-pulse__ring voice-pulse__ring--delay-2"></div>
						<div class="voice-pulse__core voice-pulse__core--listening"></div>
					</div>
					<p class="text-sm font-medium text-primary">Listening...</p>
				{/if}
			</div>

			<!-- Transcript -->
			{#if transcript.length > 0}
				<div
					{@attach scrollToBottom}
					class="flex max-h-60 flex-col gap-2 overflow-y-auto rounded-lg bg-surface p-3"
				>
					{#each transcript as entry, i (i)}
						<div
							class="flex {entry.role === 'user' ? 'justify-end' : 'justify-start'}"
						>
							<div
								class="max-w-[80%] rounded-lg px-3 py-2 text-sm {entry.role === 'user'
									? 'bg-primary text-white'
									: 'bg-surface-raised text-text'}"
							>
								<span class="mb-0.5 block text-xs font-semibold opacity-70">
									{entry.role === 'user' ? 'You' : 'Host'}
								</span>
								{entry.text}
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- End button -->
			<div class="flex justify-center">
				<Button variant="secondary" onclick={endConversation}>
					End Conversation
				</Button>
			</div>
		</div>

	{:else if status === 'processing'}
		<div class="flex flex-col items-center gap-4 py-8">
			<div class="voice-pulse voice-pulse--processing">
				<div class="voice-pulse__ring"></div>
				<div class="voice-pulse__ring voice-pulse__ring--delay-1"></div>
				<div class="voice-pulse__core"></div>
			</div>
			<p class="text-sm font-medium text-text-muted">Evaluating your understanding...</p>

			{#if transcript.length > 0}
				<div class="mt-2 max-h-40 w-full overflow-y-auto rounded-lg bg-surface p-3">
					{#each transcript as entry, i (i)}
						<div
							class="flex {entry.role === 'user' ? 'justify-end' : 'justify-start'} mb-2"
						>
							<div
								class="max-w-[80%] rounded-lg px-3 py-2 text-sm {entry.role === 'user'
									? 'bg-primary/20 text-text'
									: 'bg-surface-raised text-text'}"
							>
								<span class="mb-0.5 block text-xs font-semibold opacity-70">
									{entry.role === 'user' ? 'You' : 'Host'}
								</span>
								{entry.text}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

	{:else if status === 'done'}
		<div class="flex flex-col items-center gap-4 py-6">
			<div class="rounded-full bg-success/10 p-4">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-10 w-10 text-success"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>
			<h3 class="text-lg font-semibold text-text">Conversation Complete</h3>
			{#if score !== null}
				<p class="text-sm text-text-muted">
					Comprehension score: <span class="font-semibold text-text">{Math.round(score * 100)}%</span>
				</p>
			{/if}
			{#if feedbackData}
				<FeedbackPanel feedback={feedbackData} />
			{/if}
			<Button onclick={() => onComplete(score ?? 0, feedbackData)} variant="cta">
				See Results
			</Button>
		</div>

	{:else if status === 'error'}
		<div class="flex flex-col items-center gap-4 py-6">
			<div class="rounded-full bg-error/10 p-4">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-10 w-10 text-error"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
					/>
				</svg>
			</div>
			<h3 class="text-lg font-semibold text-text">Something went wrong</h3>
			<p class="max-w-sm text-center text-sm text-error">
				{error ?? 'An unexpected error occurred.'}
			</p>
			{#if !agentConfig}
				<p class="text-sm text-text-muted">
					Voice mode is not configured. Please switch to quiz mode.
				</p>
			{/if}
			<div class="flex gap-3">
				<Button
					variant="secondary"
					onclick={() => {
						status = 'idle';
						error = null;
					}}
				>
					Try Again
				</Button>
			</div>
		</div>
	{/if}
</Card>

<style>
	.voice-pulse {
		position: relative;
		width: 120px;
		height: 120px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.voice-pulse__ring {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		opacity: 0;
	}

	.voice-pulse__core {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		z-index: 1;
	}

	/* Connecting state */
	.voice-pulse--connecting .voice-pulse__ring {
		border: 2px solid var(--color-text-muted);
		animation: pulse-ring 1.8s ease-out infinite;
	}

	.voice-pulse--connecting .voice-pulse__core {
		background-color: var(--color-text-muted);
		animation: pulse-core 1.8s ease-in-out infinite;
	}

	/* Speaking state (AI) — green */
	.voice-pulse--speaking .voice-pulse__ring {
		border: 2px solid var(--color-success);
		animation: pulse-ring 1.2s ease-out infinite;
	}

	.voice-pulse__core--speaking {
		background-color: var(--color-success);
		animation: pulse-core 1.2s ease-in-out infinite;
	}

	/* Listening state (User) — primary */
	.voice-pulse--listening .voice-pulse__ring {
		border: 2px solid var(--color-primary);
		animation: pulse-ring 2s ease-out infinite;
	}

	.voice-pulse__core--listening {
		background-color: var(--color-primary);
		animation: pulse-core-slow 2s ease-in-out infinite;
	}

	/* Processing state */
	.voice-pulse--processing .voice-pulse__ring {
		border: 2px solid var(--color-accent);
		animation: pulse-ring 1.5s ease-out infinite;
	}

	.voice-pulse--processing .voice-pulse__core {
		background-color: var(--color-accent);
		animation: pulse-core 1.5s ease-in-out infinite;
	}

	.voice-pulse__ring--delay-1 {
		animation-delay: 0.6s !important;
	}

	.voice-pulse__ring--delay-2 {
		animation-delay: 1.2s !important;
	}

	@keyframes pulse-ring {
		0% {
			transform: scale(0.5);
			opacity: 0.6;
		}
		100% {
			transform: scale(1);
			opacity: 0;
		}
	}

	@keyframes pulse-core {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.15);
		}
	}

	@keyframes pulse-core-slow {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.08);
		}
	}
</style>
