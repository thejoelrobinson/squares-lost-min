<script lang="ts">
	import SoundEffects from '$lib/utils/soundEffects';

	let soundEnabled = $state(SoundEffects.isEnabled());

	function toggleSound() {
		soundEnabled = SoundEffects.toggleSound();
		// Play a click sound when toggling (if toggling ON)
		if (soundEnabled) {
			SoundEffects.play('click');
		}
	}
</script>

<button
	onclick={toggleSound}
	class="rounded-full p-2 transition hover:bg-surface-raised"
	title={soundEnabled ? 'Sound is on' : 'Sound is off'}
	aria-label={soundEnabled ? 'Turn sound off' : 'Turn sound on'}
>
	<span class="text-lg">{soundEnabled ? '🔊' : '🔇'}</span>
</button>
