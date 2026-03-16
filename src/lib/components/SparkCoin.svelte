<script lang="ts">
	interface Props {
		size?: number;
		class?: string;
		muted?: boolean;
		backImage?: string;
	}

	let { size = 48, class: className = '', muted = false, backImage }: Props = $props();

	// Unique ID per instance to avoid SVG gradient ID collisions
	let uid = $state(Math.random().toString(36).slice(2, 8));
</script>

<span
	class="spark-coin-wrap {className}"
	class:spark-coin-muted={muted}
	class:spark-coin-flippable={!!backImage && !muted}
	style="width: {size}px; height: {size}px;"
>
	<!-- Front face -->
	<span class="spark-coin-face spark-coin-front">
		<svg
			width={size}
			height={size}
			viewBox="0 0 100 100"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			class="spark-coin-svg"
		>
			<defs>
				<linearGradient id="shine-{uid}" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stop-color="rgba(255,255,255,0)" />
					<stop offset="40%" stop-color="rgba(255,255,255,0)" />
					<stop offset="50%" stop-color="rgba(255,255,255,0.7)" />
					<stop offset="60%" stop-color="rgba(255,255,255,0)" />
					<stop offset="100%" stop-color="rgba(255,255,255,0)" />
				</linearGradient>
			</defs>

			<circle cx="50" cy="52" r="46" fill={muted ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.15)'} />
			<circle cx="50" cy="50" r="48" fill={muted ? '#B8B8B8' : '#C49000'} />
			<circle cx="50" cy="50" r="43" fill={muted ? '#D4D4D4' : '#FFC220'} />
			<circle cx="50" cy="50" r="39" fill="none" stroke={muted ? '#C0C0C0' : '#E5A800'} stroke-width="1.5" />

			<path d="M 15 35 A 38 38 0 0 1 85 35" fill="none" stroke={muted ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.35)'} stroke-width="2" stroke-linecap="round" />
			<path d="M 18 68 A 38 38 0 0 0 82 68" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="2" stroke-linecap="round" />

			<g transform="translate(22, 18) scale(2)">
				<g fill={muted ? '#B0B0B0' : '#FFFFFF'} opacity={muted ? 0.45 : 1}>
					<path d="M19.69 14.58c.66-.14 6.45-2.84 6.97-3.15 1.18-.69 1.59-2.23.9-3.43-.68-1.2-2.19-1.62-3.37-.92-.52.3-5.72 4.06-6.16 4.57-.51.58-.6 1.42-.22 2.08.38.66 1.13 1 1.88.85z"/>
					<path d="M26.66 20.57c-.52-.3-6.32-3.01-6.97-3.15-.75-.16-1.51.18-1.88.85-.38.66-.29 1.5.22 2.08.44.51 5.64 4.27 6.16 4.57 1.18.69 2.69.28 3.37-.92.68-1.2.28-2.74-.9-3.43z"/>
					<path d="M13.95 20.53c-.75 0-1.42.5-1.66 1.24-.21.65-.81 7.11-.81 7.72 0 1.39 1.1 2.51 2.47 2.51s2.47-1.13 2.47-2.51c0-.61-.6-7.07-.81-7.72-.24-.74-.91-1.24-1.66-1.24z"/>
					<path d="M8.21 17.42c-.66.14-6.45 2.84-6.97 3.15-1.18.69-1.59 2.23-.9 3.43.68 1.2 2.19 1.62 3.37.92.52-.3 5.72-4.06 6.16-4.57.51-.58.6-1.42.22-2.08-.38-.66-1.13-1-1.88-.85z"/>
					<path d="M3.71 7.08c-1.18-.69-2.69-.28-3.37.92-.69 1.2-.28 2.74.9 3.43.52.3 6.32 3.01 6.97 3.15.75.16 1.51-.18 1.88-.85.38-.66.29-1.5-.22-2.08-.44-.51-5.64-4.27-6.16-4.57z"/>
					<path d="M13.95 0c-1.36 0-2.47 1.13-2.47 2.51 0 .61.6 7.07.81 7.72.24.74.91 1.24 1.66 1.24s1.42-.5 1.66-1.24c.21-.65.81-7.11.81-7.72C16.42 1.13 15.31 0 13.95 0z"/>
				</g>
			</g>

			{#if !muted}
				<circle cx="50" cy="50" r="43" fill="url(#shine-{uid})" class="shine-overlay" />
			{/if}
		</svg>
	</span>

	<!-- Back face (image) — only rendered if backImage is provided -->
	{#if backImage && !muted}
		<span class="spark-coin-face spark-coin-back">
			<svg
				width={size}
				height={size}
				viewBox="0 0 100 100"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<defs>
					<clipPath id="coin-clip-{uid}">
						<circle cx="50" cy="50" r="43" />
					</clipPath>
				</defs>
				<!-- Coin rim -->
				<circle cx="50" cy="50" r="48" fill="#C49000" />
				<circle cx="50" cy="50" r="43" fill="#FFC220" />
				<!-- Clipped image -->
				<image
					href={backImage}
					x="7" y="7" width="86" height="86"
					clip-path="url(#coin-clip-{uid})"
					preserveAspectRatio="xMidYMid slice"
				/>
				<!-- Inner ring overlay -->
				<circle cx="50" cy="50" r="39" fill="none" stroke="rgba(196,144,0,0.4)" stroke-width="1.5" />
			</svg>
		</span>
	{/if}
</span>

<style>
	.spark-coin-wrap {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		perspective: 600px;
		position: relative;
	}

	.spark-coin-face {
		display: block;
		backface-visibility: visible;
		transition:
			transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1),
			filter 0.4s ease;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12));
	}

	/* When flippable, set up proper 3D card flip */
	.spark-coin-flippable .spark-coin-face {
		backface-visibility: hidden;
	}

	.spark-coin-flippable .spark-coin-back {
		position: absolute;
		inset: 0;
		transform: rotateY(180deg);
	}

	/* Non-flippable hover: original 360 spin */
	.spark-coin-wrap:not(.spark-coin-muted):not(.spark-coin-flippable):hover .spark-coin-front {
		animation: coin-spin 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
		filter: drop-shadow(0 4px 12px rgba(196, 144, 0, 0.35));
	}

	.spark-coin-wrap:not(.spark-coin-muted):not(.spark-coin-flippable):hover .shine-overlay {
		animation: shine-sweep 1.2s ease-in-out forwards;
	}

	/* Flippable hover: 180 flip to reveal back */
	.spark-coin-flippable:hover .spark-coin-front {
		transform: rotateY(180deg);
		filter: drop-shadow(0 4px 12px rgba(196, 144, 0, 0.35));
	}

	.spark-coin-flippable:hover .spark-coin-back {
		transform: rotateY(0deg);
		filter: drop-shadow(0 4px 12px rgba(196, 144, 0, 0.35));
	}

	@keyframes coin-spin {
		0% {
			transform: rotateY(0deg) scale(1) scaleX(1);
		}
		8% {
			transform: rotateY(-12deg) scale(1.02) scaleX(1);
		}
		30% {
			transform: rotateY(90deg) scale(1) scaleX(0.85);
		}
		50% {
			transform: rotateY(200deg) scale(1.06) scaleX(1.04);
		}
		75% {
			transform: rotateY(370deg) scale(1.03) scaleX(1);
		}
		90% {
			transform: rotateY(358deg) scale(1.01) scaleX(1);
		}
		100% {
			transform: rotateY(360deg) scale(1) scaleX(1);
		}
	}

	.shine-overlay {
		opacity: 0;
	}

	@keyframes shine-sweep {
		0% {
			opacity: 0;
			transform: translateX(-40px) rotate(-15deg);
		}
		35% {
			opacity: 0;
		}
		50% {
			opacity: 0.9;
			transform: translateX(0px) rotate(-15deg);
		}
		75% {
			opacity: 0.6;
			transform: translateX(25px) rotate(-15deg);
		}
		100% {
			opacity: 0;
			transform: translateX(40px) rotate(-15deg);
		}
	}
</style>
