/** Haptic feedback utility — uses Vibration API where available, no-ops elsewhere */
const Haptics = {
	/** Short tap feedback (e.g. button press) */
	tap() {
		navigator?.vibrate?.(10);
	},

	/** Double pulse on success (e.g. correct answer) */
	success() {
		navigator?.vibrate?.([10, 50, 10]);
	},

	/** Longer buzz on error (e.g. wrong answer) */
	error() {
		navigator?.vibrate?.(40);
	}
};

export default Haptics;
