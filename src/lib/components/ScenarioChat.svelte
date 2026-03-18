<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import { getLessonContent } from '$lib/content/lesson-data';

	let {
		lessonSlug,
		onComplete
	}: {
		lessonSlug: string;
		onComplete: (score: number) => void;
	} = $props();

	type ChatMessage = { role: 'user' | 'jamie'; text: string };

	// svelte-ignore state_referenced_locally
	const content = getLessonContent(lessonSlug);
	const opener = content?.jamieOpener ?? "Hey, good morning! What did you want to talk about?";

	let status = $state<'active' | 'waiting' | 'processing' | 'done' | 'error'>('active');
	let messages = $state<ChatMessage[]>([{ role: 'jamie', text: opener }]);
	let inputText = $state('');
	let history = $state<Array<{ role: string; content: string }>>([
		{ role: 'assistant', content: opener }
	]);
	let score = $state(0);
	let gaps = $state<string[]>([]);
	let summary = $state('');
	let errorMessage = $state('');
	let chatArea: HTMLDivElement | undefined = $state();

	// Auto-scroll when messages change
	$effect(() => {
		if (messages.length > 0 && chatArea) {
			// Use a microtask to ensure DOM has updated
			queueMicrotask(() => {
				chatArea?.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
			});
		}
	});

	async function sendMessage() {
		const text = inputText.trim();
		if (!text || status !== 'active') return;

		inputText = '';
		messages = [...messages, { role: 'user', text }];
		history = [...history, { role: 'user', content: text }];
		status = 'waiting';

		try {
			const res = await fetch('/api/comprehension/roleplay', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'message',
					lessonSlug,
					message: text,
					history
				})
			});

			if (!res.ok) {
				throw new Error(`API error: ${res.status}`);
			}

			const data = await res.json();
			messages = [...messages, { role: 'jamie', text: data.reply }];
			history = [...history, { role: 'assistant', content: data.reply }];

			if (data.done) {
				status = 'processing';
				await evaluateTranscript();
			} else {
				status = 'active';
			}
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to send message';
			status = 'error';
		}
	}

	async function evaluateTranscript() {
		try {
			const res = await fetch('/api/comprehension/roleplay', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'evaluate',
					lessonSlug,
					transcript: history
				})
			});

			if (!res.ok) {
				throw new Error(`Evaluation failed: ${res.status}`);
			}

			const data = await res.json();
			score = data.score;
			gaps = data.gaps ?? [];
			summary = data.summary ?? '';
			status = 'done';
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to evaluate';
			status = 'error';
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function handleComplete() {
		onComplete(score);
	}
</script>

<Card variant="elevated">
	<div class="chat-container">
		<!-- Messages area -->
		<div class="chat-messages" bind:this={chatArea}>
			{#each messages as msg, i (i)}
				<div class="chat-bubble-row" class:chat-bubble-row--user={msg.role === 'user'}>
					<div
						class="chat-bubble"
						class:chat-bubble--jamie={msg.role === 'jamie'}
						class:chat-bubble--user={msg.role === 'user'}
					>
						<span class="chat-sender">{msg.role === 'user' ? 'You' : 'Jamie'}</span>
						{msg.text}
					</div>
				</div>
			{/each}

			{#if status === 'waiting'}
				<div class="chat-bubble-row">
					<div class="chat-bubble chat-bubble--jamie">
						<span class="chat-sender">Jamie</span>
						<span class="typing-indicator">
							<span class="typing-dot"></span>
							<span class="typing-dot"></span>
							<span class="typing-dot"></span>
						</span>
					</div>
				</div>
			{/if}
		</div>

		<!-- Input area or result -->
		{#if status === 'active' || status === 'waiting'}
			<div class="chat-input-area">
				<textarea
					class="chat-input"
					placeholder="Type your feedback to Jamie..."
					bind:value={inputText}
					onkeydown={handleKeydown}
					disabled={status === 'waiting'}
					rows={2}
				></textarea>
				<Button
					onclick={sendMessage}
					disabled={status === 'waiting' || !inputText.trim()}
					size="sm"
				>
					Send
				</Button>
			</div>
		{:else if status === 'processing'}
			<div class="chat-status">
				<div class="chat-status-spinner"></div>
				<p class="chat-status-text">Evaluating your feedback skills...</p>
			</div>
		{:else if status === 'done'}
			<div class="chat-results">
				<div class="chat-score">
					<span class="chat-score-value">{Math.round(score * 100)}%</span>
					<span class="chat-score-label">Feedback Score</span>
				</div>
				{#if summary}
					<p class="chat-summary">{summary}</p>
				{/if}
				{#if gaps.length > 0}
					<div class="chat-gaps">
						<p class="chat-gaps-title">Areas to improve:</p>
						<ul class="chat-gaps-list">
							{#each gaps as gap, i (i)}
								<li>{gap}</li>
							{/each}
						</ul>
					</div>
				{/if}
				<Button onclick={handleComplete} variant="cta" fullWidth>
					See Results
				</Button>
			</div>
		{:else if status === 'error'}
			<div class="chat-status">
				<p class="chat-error-text">{errorMessage}</p>
				<Button
					variant="secondary"
					onclick={() => {
						status = 'active';
						errorMessage = '';
					}}
				>
					Try Again
				</Button>
			</div>
		{/if}
	</div>
</Card>

<style>
	.chat-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-height: 400px;
	}

	.chat-messages {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		max-height: 400px;
		overflow-y: auto;
		padding: 0.5rem;
		scroll-behavior: smooth;
	}

	.chat-bubble-row {
		display: flex;
		justify-content: flex-start;
	}

	.chat-bubble-row--user {
		justify-content: flex-end;
	}

	.chat-bubble {
		max-width: 80%;
		padding: 0.625rem 0.875rem;
		border-radius: var(--radius-lg);
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.chat-bubble--jamie {
		background: var(--color-surface-raised);
		color: var(--color-text);
		border-bottom-left-radius: 4px;
	}

	.chat-bubble--user {
		background: var(--color-primary);
		color: white;
		border-bottom-right-radius: 4px;
	}

	.chat-sender {
		display: block;
		font-size: 0.6875rem;
		font-weight: 700;
		opacity: 0.7;
		margin-bottom: 0.125rem;
	}

	.typing-indicator {
		display: inline-flex;
		gap: 0.25rem;
		padding: 0.25rem 0;
	}

	.typing-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-text-muted);
		animation: typing-bounce 1.4s ease-in-out infinite;
	}

	.typing-dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.typing-dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes typing-bounce {
		0%,
		60%,
		100% {
			transform: translateY(0);
		}
		30% {
			transform: translateY(-4px);
		}
	}

	.chat-input-area {
		display: flex;
		gap: 0.5rem;
		align-items: flex-end;
		padding-top: 0.5rem;
		border-top: 1px solid var(--color-border);
	}

	.chat-input {
		flex: 1;
		padding: 0.625rem 0.75rem;
		border: 1.5px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		color: var(--color-text);
		font-size: 0.875rem;
		font-family: inherit;
		line-height: 1.4;
		resize: none;
		outline: none;
		transition: border-color 0.15s ease;
	}

	.chat-input:focus {
		border-color: var(--color-primary);
	}

	.chat-input:disabled {
		opacity: 0.5;
	}

	.chat-status {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1.5rem;
	}

	.chat-status-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.chat-status-text {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.chat-error-text {
		font-size: 0.875rem;
		color: var(--color-error);
		text-align: center;
	}

	.chat-results {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		border-top: 1px solid var(--color-border);
	}

	.chat-score {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.chat-score-value {
		font-size: 2rem;
		font-weight: 800;
		color: var(--color-primary);
	}

	.chat-score-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.chat-summary {
		font-size: 0.875rem;
		color: var(--color-text);
		line-height: 1.5;
		text-align: center;
	}

	.chat-gaps {
		background: var(--color-surface-raised);
		border-radius: var(--radius-lg);
		padding: 0.75rem 1rem;
	}

	.chat-gaps-title {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-text-muted);
		margin-bottom: 0.5rem;
	}

	.chat-gaps-list {
		list-style: disc;
		padding-left: 1.25rem;
		font-size: 0.8125rem;
		color: var(--color-text);
		line-height: 1.6;
	}
</style>
