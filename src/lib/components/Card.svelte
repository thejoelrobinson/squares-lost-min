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
		transition: box-shadow 0.3s var(--ease-smooth), border-color 0.3s ease;
	}

	.card-default {
		border: 1px solid var(--color-border);
		box-shadow: 0 1px 2px oklch(16% 0.02 280 / 0.03);
	}

	.card-elevated {
		border: 1px solid oklch(0% 0 0 / 0.04);
		box-shadow:
			0 1px 2px oklch(16% 0.02 280 / 0.04),
			0 4px 16px oklch(16% 0.02 280 / 0.06),
			0 12px 40px oklch(16% 0.02 280 / 0.04);
	}

	.card-outlined {
		border: 1.5px solid var(--color-border-strong);
	}

	/* Featured card — gradient top border accent */
	.card-featured {
		border: 1px solid oklch(0% 0 0 / 0.04);
		border-top: none;
		overflow: hidden;
		box-shadow:
			0 1px 2px oklch(16% 0.02 280 / 0.04),
			0 4px 16px oklch(16% 0.02 280 / 0.06);
	}

	.card-featured::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, var(--color-primary), var(--color-accent), var(--color-success));
		border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
	}
</style>
