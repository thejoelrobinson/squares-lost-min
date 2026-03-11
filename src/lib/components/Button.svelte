<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		type?: 'button' | 'submit';
		href?: string | undefined;
		onclick?: (() => void) | undefined;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		type = 'button',
		href = undefined,
		onclick = undefined,
		children
	}: Props = $props();

	const variantClasses = {
		primary: 'bg-primary text-white hover:brightness-110',
		secondary: 'bg-surface-raised text-text border border-primary/20 hover:bg-primary-light/20',
		ghost: 'bg-transparent text-text-muted hover:text-text hover:bg-surface-raised'
	};

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2',
		lg: 'px-6 py-3 text-lg'
	};

	let classes = $derived(
		[
			'inline-flex items-center justify-center rounded-lg font-medium transition',
			variantClasses[variant],
			sizeClasses[size],
			disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
		].join(' ')
	);
</script>

{#if href && !disabled}
	<a {href} class={classes} {onclick}>
		{@render children()}
	</a>
{:else}
	<button {type} {disabled} class={classes} {onclick}>
		{@render children()}
	</button>
{/if}
