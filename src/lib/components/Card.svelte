<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		padding?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let { class: className = '', padding = 'md', children }: Props = $props();

	const paddingClasses = {
		sm: 'p-3',
		md: 'p-5',
		lg: 'p-8'
	};
</script>

<div class="bg-surface-raised rounded-xl shadow-sm {paddingClasses[padding]} {className}">
	{@render children()}
</div>
