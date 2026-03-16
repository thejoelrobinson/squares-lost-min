<script lang="ts">
	import { Conversation, type Mode } from '@11labs/client';
	import type { DisconnectionDetails } from '@11labs/client';

	interface Props {
		lessonSlug: string;
		transcriptContext: string;
		onDismiss: () => void;
	}

	let { lessonSlug, transcriptContext, onDismiss }: Props = $props();

	let status = $state<'idle' | 'connecting' | 'active' | 'error'>('idle');
	let transcript = $state<Array<{ role: 'user' | 'ai'; text: string }>>([]);
	let error = $state<string | null>(null);
	let mode = $state<Mode>('listening');
	let conversation: Conversation | null = null;

	let isSpeaking = $derived(mode === 'speaking');

	let transcriptEl: HTMLDivElement | undefined = $state(undefined);

	$effect(() => {
		if (transcriptEl && transcript.length > 0) {
			transcriptEl.scrollTop = transcriptEl.scrollHeight;
		}
	});

	// Clean up conversation on unmount
	$effect(() => {
		return () => {
			if (conversation) {
				conversation.endSession();
				conversation = null;
			}
		};
	});

	async function start() {
		status = 'connecting';
		error = null;
		transcript = [];

		let agentConfig: { agentId: string; dynamicVariables?: Record<string, string | number | boolean> } | null = null;

		try {
			const res = await fetch('/api/podcast/ask', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ lessonSlug, transcriptContext })
			});
			if (!res.ok) throw new Error('Failed to fetch agent config');
			agentConfig = await res.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load voice configuration';
			status = 'error';
			return;
		}

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
					if (details.reason === 'user') return;
					if (details.reason === 'error') {
						error = 'message' in details ? details.message : 'Connection lost';
						status = 'error';
					} else {
						// Agent ended the conversation — reset to idle
						status = 'idle';
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

	function dismiss() {
		if (conversation) {
			conversation.endSession();
			conversation = null;
		}
		onDismiss();
	}

	async function endAndDismiss() {
		if (conversation) {
			await conversation.endSession();
			conversation = null;
		}
		onDismiss();
	}
</script>

<div class="mt-4 rounded-2xl border border-primary/20 bg-surface p-4">
	<div class="mb-3 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<div class="rounded-full bg-primary/10 p-1.5">
				<svg class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
				</svg>
			</div>
			<span class="text-sm font-semibold text-text">Ask Jamie</span>
		</div>
		<button
			type="button"
			class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-text-muted transition hover:bg-surface-raised hover:text-text"
			onclick={dismiss}
			aria-label="Close"
		>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>

	{#if status === 'idle'}
		<div class="flex flex-col items-center gap-3 py-3">
			<p class="text-center text-sm text-text-muted">
				Ask Jamie anything about what you've heard so far.
			</p>
			<button
				type="button"
				class="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] active:scale-[0.98]"
				onclick={start}
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
				</svg>
				Start
			</button>
		</div>

	{:else if status === 'connecting'}
		<div class="flex items-center justify-center gap-2 py-4">
			<svg class="h-4 w-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
			</svg>
			<span class="text-sm text-text-muted">Connecting to Jamie...</span>
		</div>

	{:else if status === 'active'}
		<div class="flex flex-col gap-3">
			<div class="flex items-center justify-center gap-2">
				<div class="h-2 w-2 rounded-full {isSpeaking ? 'animate-pulse bg-success' : 'animate-pulse bg-primary'}"></div>
				<span class="text-xs font-medium {isSpeaking ? 'text-success' : 'text-primary'}">
					{isSpeaking ? 'Jamie is speaking…' : 'Listening…'}
				</span>
			</div>

			{#if transcript.length > 0}
				<div
					bind:this={transcriptEl}
					class="flex max-h-48 flex-col gap-1.5 overflow-y-auto"
				>
					{#each transcript as entry, i (i)}
						<div class="flex {entry.role === 'user' ? 'justify-end' : 'justify-start'}">
							<div class="max-w-[85%] rounded-xl px-3 py-2 text-sm {entry.role === 'user' ? 'bg-primary text-white' : 'bg-surface-raised text-text'}">
								<span class="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide opacity-60">
									{entry.role === 'user' ? 'You' : 'Jamie'}
								</span>
								{entry.text}
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<div class="flex justify-center">
				<button
					type="button"
					class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-text/15 px-4 py-1.5 text-xs font-semibold text-text-muted transition hover:border-primary hover:text-primary"
					onclick={endAndDismiss}
				>
					Done
				</button>
			</div>
		</div>

	{:else if status === 'error'}
		<div class="flex flex-col items-center gap-2 py-3">
			<p class="text-center text-sm text-error">{error ?? 'Something went wrong.'}</p>
			<button
				type="button"
				class="text-xs font-semibold text-primary underline"
				onclick={() => { status = 'idle'; error = null; }}
			>
				Try again
			</button>
		</div>
	{/if}
</div>
