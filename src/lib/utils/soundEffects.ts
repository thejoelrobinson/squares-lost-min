// Sound effects manager inspired by Duolingo - synthesized Web Audio API
type SoundType = 'correct' | 'incorrect' | 'reward' | 'level-up' | 'click' | 'swoosh';

interface SoundOptions {
	volume?: number;
	playbackRate?: number;
}

class SoundEffects {
	private static enabled = true;

	static play(type: SoundType, options?: SoundOptions) {
		if (!this.enabled) return;
		this.playSynthesizedSound(type, options?.volume);
	}

	private static playSynthesizedSound(type: SoundType, volume = 0.5) {
		if (typeof window === 'undefined') return;

		try {
			const win = window as unknown as { AudioContext: typeof AudioContext; webkitAudioContext: typeof AudioContext };
			const AudioContextClass = win.AudioContext || win.webkitAudioContext;
			if (!AudioContextClass) return;

			const ctx = new AudioContextClass();
			const now = ctx.currentTime;

			// Helper: Create a note with harmonics and proper envelope
			const playNote = (
				frequency: number,
				startTime: number,
				duration: number,
				vol = 0.3,
				harmonics = [1]
			) => {
				harmonics.forEach((harmonic, idx) => {
					const osc = ctx.createOscillator();
					const gain = ctx.createGain();

					const freq = frequency * harmonic;
					osc.type = idx === 0 ? 'sine' : 'triangle';
					osc.frequency.value = freq;

					// ADSR-like envelope
					const attackTime = 0.02;
					const decayTime = duration * 0.3;
					const sustainLevel = 0.6;

					gain.gain.setValueAtTime(0, startTime);
					gain.gain.linearRampToValueAtTime(vol * (0.5 / harmonics.length), startTime + attackTime);
					gain.gain.linearRampToValueAtTime(vol * sustainLevel * (0.5 / harmonics.length), startTime + attackTime + decayTime);
					gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

					osc.connect(gain);
					gain.connect(ctx.destination);

					osc.start(startTime);
					osc.stop(startTime + duration);
				});
			};

			switch (type) {
				case 'correct': {
					// Duolingo-style correct: bright major chord with harmonics
					const duration = 0.5;
					// Major chord: G4, B4, D5
					playNote(392, now, duration, volume * 0.4, [1, 2, 0.5]);
					playNote(494, now + 0.05, duration * 0.9, volume * 0.35, [1, 2]);
					playNote(587, now + 0.1, duration * 0.8, volume * 0.3, [1, 2]);
					break;
				}
				case 'incorrect': {
					// Duolingo-style incorrect: descending sad notes
					const noteLength = 0.15;
					// Descending minor interval
					playNote(400, now, noteLength, volume * 0.4, [1, 2]);
					playNote(320, now + noteLength * 0.8, noteLength, volume * 0.4, [1, 2]);
					playNote(240, now + noteLength * 1.6, noteLength * 1.2, volume * 0.35, [1, 2]);
					break;
				}
				case 'reward': {
					// Duolingo-style reward: triumphant 4-note melody
					playNote(262, now, 0.2, volume * 0.4, [1, 2]); // C
					playNote(330, now + 0.15, 0.2, volume * 0.4, [1, 2]); // E
					playNote(392, now + 0.3, 0.25, volume * 0.45, [1, 2, 0.5]); // G
					playNote(523, now + 0.5, 0.4, volume * 0.5, [1, 2, 0.5]); // C octave
					break;
				}
				case 'level-up': {
					// Duolingo-style level-up: triumphant scale with rhythm
					const notes = [
						{ freq: 262, time: 0, dur: 0.15 },
						{ freq: 294, time: 0.12, dur: 0.15 },
						{ freq: 330, time: 0.24, dur: 0.15 },
						{ freq: 392, time: 0.36, dur: 0.2 },
						{ freq: 523, time: 0.52, dur: 0.4 },
						{ freq: 659, time: 0.88, dur: 0.3 }
					];
					notes.forEach((note) => {
						playNote(note.freq, now + note.time, note.dur, volume * 0.45, [1, 2, 0.5]);
					});
					break;
				}
				case 'click': {
					// Musical click: bright with harmonics
					playNote(800, now, 0.06, volume * 0.3, [1, 2]);
					playNote(1200, now + 0.01, 0.05, volume * 0.2, [1]);
					break;
				}
				case 'swoosh': {
					// Musical whoosh: sweep with harmonics
					const duration = 0.25;
					const osc1 = ctx.createOscillator();
					const osc2 = ctx.createOscillator();
					const gain = ctx.createGain();

					osc1.type = 'triangle';
					osc2.type = 'sine';

					osc1.frequency.setValueAtTime(1200, now);
					osc1.frequency.exponentialRampToValueAtTime(300, now + duration);

					osc2.frequency.setValueAtTime(600, now);
					osc2.frequency.exponentialRampToValueAtTime(150, now + duration);

					gain.gain.setValueAtTime(0, now);
					gain.gain.linearRampToValueAtTime(volume * 0.25, now + 0.05);
					gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

					osc1.connect(gain);
					osc2.connect(gain);
					gain.connect(ctx.destination);

					osc1.start(now);
					osc2.start(now);
					osc1.stop(now + duration);
					osc2.stop(now + duration);
					break;
				}
			}
		} catch {
			// Silently fail
		}
	}

	static setEnabled(enabled: boolean) {
		this.enabled = enabled;
	}

	static isEnabled(): boolean {
		return this.enabled;
	}

	static toggleSound() {
		this.enabled = !this.enabled;
		return this.enabled;
	}
}

export default SoundEffects;
