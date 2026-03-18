<script lang="ts">
	import type { Snippet } from 'svelte';
	import SoundEffects from '$lib/utils/soundEffects';
	import Haptics from '$lib/utils/haptics';

	interface Props {
		variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'cta';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		type?: 'button' | 'submit';
		href?: string | undefined;
		onclick?: (() => void) | undefined;
		fullWidth?: boolean;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		type = 'button',
		href = undefined,
		onclick = undefined,
		fullWidth = false,
		children
	}: Props = $props();

	function handleClick() {
		if (!disabled) {
			SoundEffects.play('click');
			Haptics.tap();
			onclick?.();
		}
	}
</script>

{#if href && !disabled}
	<a
		{href}
		class="btn btn-{variant} btn-{size}"
		class:btn-full={fullWidth}
		class:btn-disabled={disabled}
		onclick={handleClick}
	>
		<span class="btn-inner">{@render children()}</span>
	</a>
{:else}
	<button
		{type}
		{disabled}
		class="btn btn-{variant} btn-{size}"
		class:btn-full={fullWidth}
		class:btn-disabled={disabled}
		onclick={handleClick}
	>
		<span class="btn-inner">{@render children()}</span>
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-family: 'Outfit', system-ui, sans-serif;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		border: none;
		cursor: pointer;
		position: relative;
		text-decoration: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		isolation: isolate;
	}

	.btn-inner {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		position: relative;
		z-index: 1;
	}

	/* ─── PRIMARY (flat + scale) ─── */
	.btn-primary {
		background: var(--color-primary);
		color: white;
		border-radius: var(--radius-full);
		transition: opacity 0.15s ease, transform 0.12s var(--ease-smooth), box-shadow 0.15s ease;
		box-shadow: 0 2px 6px oklch(44% 0.26 280 / 0.2);
	}

	.btn-primary:hover:not(.btn-disabled) {
		opacity: 0.92;
		box-shadow: 0 4px 12px oklch(44% 0.26 280 / 0.25);
	}

	.btn-primary:active:not(.btn-disabled) {
		transform: scale(0.97);
		opacity: 0.92;
		box-shadow: 0 1px 3px oklch(44% 0.26 280 / 0.15);
	}

	/* ─── SUCCESS (flat + scale) ─── */
	.btn-success {
		background: var(--color-success);
		color: white;
		border-radius: var(--radius-full);
		transition: opacity 0.15s ease, transform 0.12s var(--ease-smooth);
	}

	.btn-success:hover:not(.btn-disabled) {
		opacity: 0.88;
	}

	.btn-success:active:not(.btn-disabled) {
		transform: scale(0.97);
		opacity: 0.92;
	}

	/* ─── DANGER (flat + scale) ─── */
	.btn-danger {
		background: var(--color-error);
		color: white;
		border-radius: var(--radius-full);
		transition: opacity 0.15s ease, transform 0.12s var(--ease-smooth);
	}

	.btn-danger:hover:not(.btn-disabled) {
		opacity: 0.88;
	}

	.btn-danger:active:not(.btn-disabled) {
		transform: scale(0.97);
		opacity: 0.92;
	}

	/* ─── SECONDARY (flat + scale) ─── */
	.btn-secondary {
		background: var(--color-surface);
		color: var(--color-primary);
		border-radius: var(--radius-full);
		border: 2.5px solid var(--color-border-strong);
		transition: opacity 0.15s ease, transform 0.12s var(--ease-smooth), background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
	}

	.btn-secondary:hover:not(.btn-disabled) {
		background: var(--color-primary-subtle);
		border-color: var(--color-primary-light);
		color: var(--color-primary-hover);
	}

	.btn-secondary:active:not(.btn-disabled) {
		transform: scale(0.97);
		opacity: 0.92;
	}

	/* ─── CTA (3D border-bottom press effect, pill radius) ─── */
	.btn-cta {
		background: linear-gradient(180deg, oklch(48% 0.26 280) 0%, var(--color-primary) 100%);
		color: white;
		border-radius: var(--radius-full);
		border-bottom: 5px solid var(--color-primary-dark);
		transform: translateY(0);
		transition: transform 0.12s var(--ease-smooth), border-bottom-width 0.08s ease, filter 0.15s ease, box-shadow 0.15s ease;
		box-shadow: 0 4px 12px oklch(44% 0.26 280 / 0.25), 0 1px 3px oklch(16% 0.02 280 / 0.1);
	}

	.btn-cta:hover:not(.btn-disabled) {
		filter: brightness(1.08);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px oklch(44% 0.26 280 / 0.3), 0 2px 4px oklch(16% 0.02 280 / 0.1);
	}

	.btn-cta:active:not(.btn-disabled) {
		transform: translateY(3px);
		border-bottom-width: 2px;
		filter: brightness(0.95);
		box-shadow: 0 1px 4px oklch(44% 0.26 280 / 0.15);
	}

	/* ─── GHOST ─── */
	.btn-ghost {
		background: transparent;
		color: var(--color-text-muted);
		border-radius: var(--radius-md);
		border: none;
		transition: color 0.15s ease, background 0.15s ease;
	}

	.btn-ghost:hover:not(.btn-disabled) {
		color: var(--color-primary);
		background: var(--color-primary-subtle);
	}

	.btn-ghost:active:not(.btn-disabled) {
		background: oklch(44% 0.26 280 / 0.08);
	}

	/* ─── SIZES ─── */
	.btn-sm {
		padding: 0.5rem 1.125rem;
		font-size: 0.6875rem;
	}

	.btn-sm.btn-cta {
		border-bottom-width: 4px;
	}

	.btn-sm.btn-cta:active:not(.btn-disabled) {
		transform: translateY(2px);
		border-bottom-width: 2px;
	}

	.btn-md {
		padding: 0.8125rem 1.625rem;
		font-size: 0.8125rem;
	}

	.btn-lg {
		padding: 1rem 2.25rem;
		font-size: 0.9375rem;
	}

	.btn-full {
		width: 100%;
	}

	.btn-disabled {
		opacity: 0.4;
		cursor: not-allowed;
		filter: grayscale(0.4) !important;
		transform: none !important;
	}
</style>
