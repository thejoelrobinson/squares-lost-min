<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		padding?: 'sm' | 'md' | 'lg';
		variant?: 'default' | 'elevated' | 'outlined' | 'featured';
		children: Snippet;
	}

	let { class: className = '', padding = 'md', variant = 'default', children }: Props = $props();

	const paddingClasses = {
		sm: 'p-4',
		md: 'p-6',
		lg: 'p-8'
	};
</script>

<div
	class="card card-{variant} {paddingClasses[padding]} {className}"
>
	{@render children()}
</div>

<style>
	.card {
		border-radius: var(--radius-2xl);
		background: var(--color-surface);
		position: relative;
	}

	.card-default {
		border: 2px solid var(--color-border);
		border-bottom-width: 4px;
		border-bottom-color: var(--color-border-strong);
	}

	.card-elevated {
		border: 2px solid var(--color-border);
		box-shadow: var(--shadow-lg);
	}

	.card-outlined {
		border: 2.5px solid var(--color-border-strong);
	}

	/* Featured card — gradient top border accent */
	.card-featured {
		border: 2px solid var(--color-border);
		border-top: none;
		overflow: hidden;
	}

	.card-featured::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, var(--color-primary), var(--color-accent), var(--color-success));
		border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
	}
</style>
