// Enhanced High-Fidelity Web Audio API Procedural Sound Engine for Kuşçu Simülatörü & Bird Village
// Studio-Grade Master Bus with Dynamics Compressor, Limiter, and Authentic Turkish Pigeon Acoustics

class SoundManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.limiter = null;
        this.enabled = true;
        this.ambientNode = null;
        this.ambientGain = null;
        this.isAmbientPlaying = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            // Master Gain Node (smooth fading for mute/unmute)
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.enabled ? 0.88 : 0, this.ctx.currentTime);

            // Studio-Grade Dynamics Compressor (Prevents clipping, distortion & clicks)
            this.limiter = this.ctx.createDynamicsCompressor();
            this.limiter.threshold.setValueAtTime(-12, this.ctx.currentTime);
            this.limiter.knee.setValueAtTime(28, this.ctx.currentTime);
            this.limiter.ratio.setValueAtTime(14, this.ctx.currentTime);
            this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
            this.limiter.release.setValueAtTime(0.22, this.ctx.currentTime);

            this.masterGain.connect(this.limiter);
            this.limiter.connect(this.ctx.destination);
        }

        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    // Connects an audio voice directly to the master limiter bus
    connectVoice(node) {
        if (!this.masterGain) this.init();
        if (this.masterGain) {
            node.connect(this.masterGain);
        } else if (this.ctx) {
            node.connect(this.ctx.destination);
        }
    }

    setEnabled(val) {
        this.enabled = !!val;
        if (this.masterGain && this.ctx) {
            const now = this.ctx.currentTime;
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.linearRampToValueAtTime(this.enabled ? 0.88 : 0, now + 0.08);
        }
    }

    // Wing Flap sound ("Kanat Şakırtısı & Pır Pır")
    playFlap(intensity = 1.0) {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;

        const bufferSize = Math.floor(this.ctx.sampleRate * 0.14);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(380 * intensity, now);
        filter.frequency.exponentialRampToValueAtTime(130, now + 0.14);
        filter.Q.value = 2.2;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.52 * intensity, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.14);

        noise.connect(filter);
        filter.connect(gain);
        this.connectVoice(gain);

        noise.start(now);
        noise.stop(now + 0.15);
    }

    // Authentic Turkish "Taban Taklası" Wing-Clap ("Tok Çat-Pat Kanat Vuruşu")
    playTakla() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;

        // Two authentic distinct feather slaps separated by 75ms
        for (let j = 0; j < 2; j++) {
            const t = now + j * 0.075;

            // 1. Acoustic chest/tail air compression thud
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(240, t);
            osc.frequency.exponentialRampToValueAtTime(48, t + 0.065);

            gain.gain.setValueAtTime(0.75, t);
            gain.gain.exponentialRampToValueAtTime(0.005, t + 0.07);

            osc.connect(gain);
            this.connectVoice(gain);
            osc.start(t);
            osc.stop(t + 0.08);

            // 2. High-frequency feather whip crack
            const bufSize = Math.floor(this.ctx.sampleRate * 0.045);
            const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
            const bData = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) {
                bData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.18));
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buf;

            const noiseFilter = this.ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(1250, t);
            noiseFilter.Q.value = 3.0;

            const nGain = this.ctx.createGain();
            nGain.gain.setValueAtTime(0.7, t);
            nGain.gain.exponentialRampToValueAtTime(0.005, t + 0.05);

            noise.connect(noiseFilter);
            noiseFilter.connect(nGain);
            this.connectVoice(nGain);

            noise.start(t);
            noise.stop(t + 0.06);
        }

        this.triggerHaptic([35, 25, 45]);
    }

    // Fişekleme Vertical Rocket Soar ("Fişekleme Roket & Rüzgar Sesi")
    playFisek() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(1650, now + 0.32);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35);

        // Breath flutter
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(26, now);
        lfoGain.gain.setValueAtTime(45, now);
        lfo.connect(osc.frequency);

        osc.connect(gain);
        this.connectVoice(gain);

        lfo.start(now);
        osc.start(now);
        lfo.stop(now + 0.36);
        osc.stop(now + 0.36);
    }

    // Progressive Combo Fanfare ("Takla Kombo Şöleni") - Fixes Missing Method!
    playCombo(comboCount = 2) {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;

        const scaleTones = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
        const steps = Math.min(scaleTones.length, Math.max(2, comboCount + 1));

        for (let i = 0; i < steps; i++) {
            const t = now + i * 0.065;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = i === steps - 1 ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(scaleTones[i], t);

            const vol = 0.22 + (i / steps) * 0.15;
            gain.gain.setValueAtTime(vol, t);
            gain.gain.exponentialRampToValueAtTime(0.005, t + 0.28);

            osc.connect(gain);
            this.connectVoice(gain);
            osc.start(t);
            osc.stop(t + 0.3);
        }

        this.triggerHaptic([20, 20, 35, 30, 60]);
    }

    // Authentic Turkish Rooftop Pigeon Whistle ("Otantik Kuşçu Islığı - Piiii-vittt!")
    playWhistle() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;

        // 1. Resonant Carrier Oscillator with Double Pitch Modulation
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';

        osc.frequency.setValueAtTime(1600, now);
        osc.frequency.exponentialRampToValueAtTime(2900, now + 0.14);
        osc.frequency.linearRampToValueAtTime(3050, now + 0.32);
        osc.frequency.exponentialRampToValueAtTime(2350, now + 0.52);

        // Human finger/teeth vibrato LFO
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(22, now);
        lfoGain.gain.setValueAtTime(45, now);
        lfo.connect(osc.frequency);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.48, now + 0.07);
        gain.gain.setValueAtTime(0.44, now + 0.38);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.56);

        osc.connect(gain);
        this.connectVoice(gain);

        // 2. Air turbulence breath noise layer
        const bufSize = Math.floor(this.ctx.sampleRate * 0.52);
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const bData = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
            bData[i] = (Math.random() * 2 - 1) * 0.35;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buf;
        const nFilter = this.ctx.createBiquadFilter();
        nFilter.type = 'bandpass';
        nFilter.frequency.setValueAtTime(2700, now);
        nFilter.Q.value = 3.2;

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.01, now);
        nGain.gain.linearRampToValueAtTime(0.18, now + 0.08);
        nGain.gain.exponentialRampToValueAtTime(0.005, now + 0.52);

        noise.connect(nFilter);
        nFilter.connect(nGain);
        this.connectVoice(nGain);

        lfo.start(now);
        osc.start(now);
        noise.start(now);

        lfo.stop(now + 0.58);
        osc.stop(now + 0.58);
        noise.stop(now + 0.55);

        this.triggerHaptic([30, 40]);
    }

    // Authentic Pigeon Cooing & Dem Çekme ("Guu-guk-guuu / Huu-huu")
    playCoo() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(270, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.16);
        osc.frequency.exponentialRampToValueAtTime(230, now + 0.36);
        osc.frequency.setValueAtTime(345, now + 0.46);
        osc.frequency.exponentialRampToValueAtTime(215, now + 0.72);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.32, now + 0.12);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.36);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.76);

        // Throat formant lowpass filter
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(540, now);

        osc.connect(filter);
        filter.connect(gain);
        this.connectVoice(gain);

        osc.start(now);
        osc.stop(now + 0.8);
    }

    // Hawk Predator Screech ("Atmaca Saldırı Çığlığı")
    playHawk() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';

        osc.frequency.setValueAtTime(1750, now);
        osc.frequency.exponentialRampToValueAtTime(3300, now + 0.22);
        osc.frequency.exponentialRampToValueAtTime(850, now + 0.72);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2150, now);
        filter.Q.value = 3.8;

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.38, now + 0.14);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.75);

        osc.connect(filter);
        filter.connect(gain);
        this.connectVoice(gain);

        osc.start(now);
        osc.stop(now + 0.78);
        this.triggerHaptic([60, 40, 80]);
    }

    // Chick Peep / Egg Hatching ("Cik Cik / Yavru Çıkımı")
    playHatch() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;

        [0, 0.12, 0.25].forEach(delay => {
            const t = now + delay;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(2700, t);
            osc.frequency.exponentialRampToValueAtTime(3600, t + 0.04);
            osc.frequency.exponentialRampToValueAtTime(2350, t + 0.08);

            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.005, t + 0.09);

            osc.connect(gain);
            this.connectVoice(gain);
            osc.start(t);
            osc.stop(t + 0.1);
        });
    }

    // Live Mezat Gavel Strike ("Mezat Tokmağı - Satıyorum, Sattım!")
    playGavel() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;

        // Wood impact
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(42, now + 0.09);

        gain.gain.setValueAtTime(0.85, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.1);

        osc.connect(gain);
        this.connectVoice(gain);
        osc.start(now);
        osc.stop(now + 0.11);

        this.triggerHaptic([40]);
    }

    // Grain scatter on terrace rooftop ("Yem Serpme Sesi")
    playFeed() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;

        for (let i = 0; i < 9; i++) {
            const delay = Math.random() * 0.26;
            const t = now + delay;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1700 + Math.random() * 1500, t);
            osc.frequency.exponentialRampToValueAtTime(350, t + 0.035);

            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.005, t + 0.04);

            osc.connect(gain);
            this.connectVoice(gain);

            osc.start(t);
            osc.stop(t + 0.045);
        }
    }

    // Crystalline Gold Coins Clink ("Altın & Para Şıngırtısı")
    playCoin() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [987.77, 1318.51, 1567.98]; // B5, E6, G6
        notes.forEach((freq, idx) => {
            const t = now + idx * 0.07;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.28, t);
            gain.gain.exponentialRampToValueAtTime(0.005, t + 0.28);
            osc.connect(gain);
            this.connectVoice(gain);
            osc.start(t);
            osc.stop(t + 0.3);
        });
        this.triggerHaptic([15]);
    }

    // Pırıltı Luring Flutter ("Pırıltı Kanat Çırpışı")
    playPirilti() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        for (let i = 0; i < 5; i++) {
            const t = now + i * 0.055;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(420 + i * 130, t);
            osc.frequency.exponentialRampToValueAtTime(170, t + 0.075);
            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.005, t + 0.08);
            osc.connect(gain);
            this.connectVoice(gain);
            osc.start(t);
            osc.stop(t + 0.09);
        }
    }

    // Wheel Peg Tick
    playWheelTick() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(210, now + 0.035);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.04);
        osc.connect(gain);
        this.connectVoice(gain);
        osc.start(now);
        osc.stop(now + 0.045);
        this.triggerHaptic([10]);
    }

    // Grand Win Fanfare
    playWin() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
            const t = now + idx * 0.085;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.38, t);
            gain.gain.exponentialRampToValueAtTime(0.005, t + 0.4);
            osc.connect(gain);
            this.connectVoice(gain);
            osc.start(t);
            osc.stop(t + 0.42);
        });
        this.triggerHaptic([35, 45, 80]);
    }

    // Audience Applause & Cheering
    playCheer() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;

        for (let i = 0; i < 20; i++) {
            const delay = Math.random() * 0.85;
            const t = now + delay;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(280 + Math.random() * 220, t);
            osc.frequency.exponentialRampToValueAtTime(75, t + 0.04);
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.005, t + 0.045);
            osc.connect(gain);
            this.connectVoice(gain);
            osc.start(t);
            osc.stop(t + 0.05);
        }
    }

    // Sweep sound (Kümes Temizliği)
    playSweep() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;

        const bufferSize = Math.floor(this.ctx.sampleRate * 0.28);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(750, now);
        filter.frequency.linearRampToValueAtTime(380, now + 0.28);
        filter.Q.value = 1.6;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.38, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.28);

        noise.connect(filter);
        filter.connect(gain);
        this.connectVoice(gain);

        noise.start(now);
        noise.stop(now + 0.29);
    }

    // Build construction hammer sound
    playBuild() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;

        [0, 0.1, 0.2].forEach(delay => {
            const t = now + delay;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(320 + delay * 350, t);
            osc.frequency.exponentialRampToValueAtTime(80, t + 0.055);

            gain.gain.setValueAtTime(0.32, t);
            gain.gain.exponentialRampToValueAtTime(0.005, t + 0.06);

            osc.connect(gain);
            this.connectVoice(gain);
            osc.start(t);
            osc.stop(t + 0.07);
        });
    }

    // Medicine & Vitamin Bubble Sound
    playMedicine() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25];
        notes.forEach((freq, idx) => {
            const t = now + idx * 0.07;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.12);
            gain.gain.setValueAtTime(0.28, t);
            gain.gain.exponentialRampToValueAtTime(0.005, t + 0.14);
            osc.connect(gain);
            this.connectVoice(gain);
            osc.start(t);
            osc.stop(t + 0.15);
        });
    }

    // Metallic Ring Clink ("Bilezik Takma")
    playBilezik() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2400, now);
        osc.frequency.exponentialRampToValueAtTime(1550, now + 0.11);
        gain.gain.setValueAtTime(0.38, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.22);
        osc.connect(gain);
        this.connectVoice(gain);
        osc.start(now);
        osc.stop(now + 0.24);
    }

    // Quest Fanfare
    playQuest() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            const t = now + idx * 0.09;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.32, t);
            gain.gain.exponentialRampToValueAtTime(0.005, t + 0.36);
            osc.connect(gain);
            this.connectVoice(gain);
            osc.start(t);
            osc.stop(t + 0.38);
        });
    }

    // Mobile Haptic Vibration
    triggerHaptic(pattern = [25]) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {}
        }
    }
}

window.sounds = new SoundManager();

// Mobile & Desktop WebAudio Auto-Unlock on first user gesture
['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown'].forEach(evt => {
    window.addEventListener(evt, () => {
        if (window.sounds) window.sounds.init();
    }, { once: true, passive: true });
});