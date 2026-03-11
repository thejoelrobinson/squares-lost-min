<script lang="ts">
	import lottie from 'lottie-web';

	interface Props {
		src: string;
		autoplay?: boolean;
		loop?: boolean;
		class?: string;
	}

	let { src, autoplay = true, loop = true, class: className = '' }: Props = $props();

	let container: HTMLDivElement;

	$effect(() => {
		const anim = lottie.loadAnimation({
			container,
			renderer: 'svg',
			loop,
			autoplay,
			path: src
		});
		return () => anim.destroy();
	});
</script>

<div bind:this={container} class={className}></div>
