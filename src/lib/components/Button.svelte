<script lang="ts">
	import type { Snippet } from 'svelte';
	import SoundEffects from '$lib/utils/soundEffects';

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

	function handleClick() {
		if (!disabled) {
			// Play click sound
			SoundEffects.play('click');
			onclick?.();
		}
	}

	const variantClasses = {
		primary: 'bg-primary text-white shadow-sm hover:brightness-110 active:brightness-95',
		secondary: 'bg-surface-raised text-primary border border-primary/25 hover:bg-primary-light/15 active:bg-primary-light/25',
		ghost: 'bg-transparent text-text-muted hover:text-primary hover:bg-primary/5'
	};

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-5 py-2.5',
		lg: 'px-7 py-3 text-lg'
	};

	let classes = $derived(
		[
			'inline-flex items-center justify-center rounded-full font-semibold tracking-wide transition-all duration-150',
			variantClasses[variant],
			sizeClasses[size],
			disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
		].join(' ')
	);
</script>

{#if href && !disabled}
	<a {href} class={classes} onclick={handleClick}>
		{@render children()}
	</a>
{:else}
	<button {type} {disabled} class={classes} onclick={handleClick}>
		{@render children()}
	</button>
{/if}
