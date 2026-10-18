/**
 * Procedural Web Audio API sound synthesizer for Nostalgia 3D Studio App.
 * No external audio files required!
 */

import { MusicTrackId } from '../types';
export type { MusicTrackId };

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // Background Music Synthesis State
  private currentMusicTrack: MusicTrackId = 'none';
  private musicGainNode: GainNode | null = null;
  private musicLoopInterval: NodeJS.Timeout | null = null;
  private activeMusicOscillators: OscillatorNode[] = [];
  private noiseBufferNode: AudioBufferSourceNode | null = null;
  private customAudioElem: HTMLAudioElement | null = null;
  private customAudioUrl: string | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else if (this.currentMusicTrack !== 'none') {
      this.setMusicTrack(this.currentMusicTrack, this.customAudioUrl || undefined);
    }
    return !this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getCurrentTrack(): MusicTrackId {
    return this.currentMusicTrack;
  }

  public setCustomAudioUrl(url: string | null) {
    this.customAudioUrl = url;
  }

  public getCustomAudioUrl(): string | null {
    return this.customAudioUrl;
  }

  private stopMusic() {
    if (this.customAudioElem) {
      try {
        this.customAudioElem.pause();
        this.customAudioElem.currentTime = 0;
        this.customAudioElem.removeAttribute('src');
      } catch (e) {}
      this.customAudioElem = null;
    }

    if (this.musicLoopInterval) {
      clearInterval(this.musicLoopInterval);
      this.musicLoopInterval = null;
    }

    this.activeMusicOscillators.forEach((o) => {
      try {
        o.stop();
        o.disconnect();
      } catch {}
    });
    this.activeMusicOscillators = [];

    if (this.noiseBufferNode) {
      try {
        this.noiseBufferNode.stop();
        this.noiseBufferNode.disconnect();
      } catch {}
      this.noiseBufferNode = null;
    }

    if (this.ctx && this.musicGainNode) {
      try {
        this.musicGainNode.gain.cancelScheduledValues(0);
        this.musicGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        this.musicGainNode.disconnect();
      } catch (e) {}
      this.musicGainNode = null;
    }
  }

  private PRESET_URLS: Record<string, string> = {
    lofi: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    ambient: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_c0e0b3c4f3.mp3?filename=deep-ambient-110624.mp3',
    violin: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_d0a13f69d2.mp3?filename=sad-violin-10332.mp3',
    piano: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_24e5088210.mp3?filename=peaceful-piano-124976.mp3',
  };

  public setMusicTrack(trackId: MusicTrackId, customUrl?: string) {
    this.currentMusicTrack = trackId;
    if (customUrl) {
      this.customAudioUrl = customUrl;
    }

    this.stopMusic();

    if (this.isMuted || trackId === 'none') {
      return;
    }

    if (trackId === 'custom') {
      const targetUrl = customUrl || this.customAudioUrl;
      if (targetUrl) {
        try {
          const audio = new Audio();
          audio.preload = 'auto';
          audio.src = targetUrl;
          audio.loop = true;
          audio.volume = 0.70;

          const handleEnded = () => {
            if (this.currentMusicTrack === 'custom' && !this.isMuted) {
              audio.currentTime = 0;
              audio.play().catch(() => {});
            }
          };
          audio.addEventListener('ended', handleEnded);

          this.customAudioElem = audio;
          audio.play().catch((e) => {
            console.log('Autoplay deferred or waiting for user gesture', e);
          });
        } catch (e) {
          console.error('Error playing custom MP3 audio file', e);
        }
      }
      return;
    }

    // Try HTML5 Audio stream for default presets (lofi, ambient, violin, piano)
    const presetUrl = this.PRESET_URLS[trackId];
    if (presetUrl) {
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = presetUrl;
        audio.loop = true;
        audio.volume = 0.60;

        const handleEnded = () => {
          if (this.currentMusicTrack === trackId && !this.isMuted) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
          }
        };
        audio.addEventListener('ended', handleEnded);

        this.customAudioElem = audio;
        const playPromise = audio.play();
        if (playPromise) {
          playPromise.catch(() => {
            this.startMusicTrackSynth(trackId);
          });
        }
      } catch (e) {
        this.startMusicTrackSynth(trackId);
      }
    } else {
      this.startMusicTrackSynth(trackId);
    }
  }

  private startMusicTrackSynth(trackId: MusicTrackId) {
    this.initCtx();
    if (!this.ctx) return;

    setTimeout(() => {
      if (!this.ctx || this.isMuted || this.currentMusicTrack !== trackId) return;

      const now = this.ctx.currentTime;
      this.musicGainNode = this.ctx.createGain();
      this.musicGainNode.gain.setValueAtTime(0.001, now);
      this.musicGainNode.gain.linearRampToValueAtTime(0.35, now + 0.8);
      this.musicGainNode.connect(this.ctx.destination);

      if (trackId === 'lofi') {
        this.playLoFiLoop();
      } else if (trackId === 'ambient') {
        this.playAmbientLoop();
      } else if (trackId === 'violin') {
        this.playViolinLoop();
      } else if (trackId === 'piano') {
        this.playPianoLoop();
      }
    }, 100);
  }

  // 1. LO-FI BEATS (Warm minor chords, vinyl crackle & soft rhythmic beat)
  private playLoFiLoop() {
    if (!this.ctx || !this.musicGainNode) return;

    // Vinyl Crackle Noise Generator
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.noiseBufferNode = this.ctx.createBufferSource();
    this.noiseBufferNode.buffer = noiseBuffer;
    this.noiseBufferNode.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    noiseFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.005, this.ctx.currentTime);

    this.noiseBufferNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.musicGainNode);
    this.noiseBufferNode.start();

    // Lo-fi Chord Progression: Ebmaj7 -> Cm7 -> Fm7 -> Bb7
    const chords = [
      [155.56, 196.00, 233.08, 293.66], // Ebmaj7
      [130.81, 155.56, 196.00, 233.08], // Cm7
      [174.61, 207.65, 261.63, 311.13], // Fm7
      [116.54, 146.83, 174.61, 233.08], // Bb7
    ];

    let chordIdx = 0;

    const playNextLoFiBar = () => {
      if (!this.ctx || !this.musicGainNode || this.currentMusicTrack !== 'lofi' || this.isMuted) return;

      const time = this.ctx.currentTime;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach((freq) => {
        if (!this.ctx || !this.musicGainNode) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        const vibrato = this.ctx.createOscillator();
        vibrato.frequency.setValueAtTime(0.25, time);
        const vibratoGain = this.ctx.createGain();
        vibratoGain.gain.setValueAtTime(1.2, time);
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        vibrato.start(time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, time);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.20, time + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 2.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGainNode);

        osc.start(time);
        osc.stop(time + 3.0);
        this.activeMusicOscillators.push(osc);
      });

      const triggerKick = (kickTime: number) => {
        if (!this.ctx || !this.musicGainNode) return;
        const kOsc = this.ctx.createOscillator();
        const kGain = this.ctx.createGain();

        kOsc.type = 'sine';
        kOsc.frequency.setValueAtTime(70, kickTime);
        kOsc.frequency.exponentialRampToValueAtTime(28, kickTime + 0.15);

        kGain.gain.setValueAtTime(0.25, kickTime);
        kGain.gain.exponentialRampToValueAtTime(0.001, kickTime + 0.18);

        kOsc.connect(kGain);
        kGain.connect(this.musicGainNode);

        kOsc.start(kickTime);
        kOsc.stop(kickTime + 0.2);
      };

      triggerKick(time);
      triggerKick(time + 1.4);
    };

    playNextLoFiBar();
    this.musicLoopInterval = setInterval(playNextLoFiBar, 2800);
  }

  // 2. AMBIENT SPACE (Ethereal multi-octave space pad & cosmic sparkles)
  private playAmbientLoop() {
    if (!this.ctx || !this.musicGainNode) return;

    const now = this.ctx.currentTime;
    const baseFreqs = [130.81, 196.00, 233.08, 311.13, 392.00];

    const padGain = this.ctx.createGain();
    padGain.gain.setValueAtTime(0.001, now);
    padGain.gain.linearRampToValueAtTime(0.18, now + 1.2);
    padGain.connect(this.musicGainNode);

    baseFreqs.forEach((freq) => {
      if (!this.ctx || !this.musicGainNode) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.18, now);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(1.8, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);

      osc.connect(padGain);
      osc.start(now);
      this.activeMusicOscillators.push(osc);
    });

    const playCosmicSparkle = () => {
      if (!this.ctx || !this.musicGainNode || this.currentMusicTrack !== 'ambient' || this.isMuted) return;

      const time = this.ctx.currentTime;
      const sparkleFreqs = [880, 1046.5, 1318.51, 1567.98, 2093];
      const selectedFreq = sparkleFreqs[Math.floor(Math.random() * sparkleFreqs.length)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(selectedFreq, time);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.08, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.2);

      osc.connect(gain);
      gain.connect(this.musicGainNode);

      osc.start(time);
      osc.stop(time + 1.3);
    };

    this.musicLoopInterval = setInterval(playCosmicSparkle, 2200);
  }

  // 3. MELANCHOLY VIOLIN (Emotional & soothing acoustic violin strings loop)
  private playViolinLoop() {
    if (!this.ctx || !this.musicGainNode) return;

    const violinPattern = [
      { freq: 293.66, delay: 0, dur: 1.8 },   // D4
      { freq: 349.23, delay: 1.6, dur: 1.8 }, // F4
      { freq: 440.00, delay: 3.2, dur: 2.2 }, // A4
      { freq: 587.33, delay: 5.2, dur: 2.2 }, // D5
      { freq: 523.25, delay: 7.2, dur: 1.8 }, // C5
      { freq: 440.00, delay: 8.8, dur: 1.8 }, // A4
      { freq: 349.23, delay: 10.4, dur: 1.8 },// F4
      { freq: 329.63, delay: 12.0, dur: 2.2 },// E4
    ];

    const playViolinTone = (freq: number, noteTime: number, dur: number) => {
      if (!this.ctx || !this.musicGainNode) return;

      const osc = this.ctx.createOscillator();
      const subOsc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(freq * 0.5, noteTime);

      const vibrato = this.ctx.createOscillator();
      vibrato.frequency.setValueAtTime(4.5, noteTime);
      const vibratoGain = this.ctx.createGain();
      vibratoGain.gain.setValueAtTime(freq * 0.012, noteTime);
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      vibrato.start(noteTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, noteTime);
      filter.Q.setValueAtTime(2.0, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + dur + 0.3);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGainNode);

      osc.start(noteTime);
      osc.stop(noteTime + dur + 0.4);
      subOsc.start(noteTime);
      subOsc.stop(noteTime + dur + 0.4);
      vibrato.stop(noteTime + dur + 0.4);
    };

    const triggerViolinLoop = () => {
      if (!this.ctx || !this.musicGainNode || this.currentMusicTrack !== 'violin' || this.isMuted) return;
      const time = this.ctx.currentTime;
      violinPattern.forEach((note) => {
        playViolinTone(note.freq, time + note.delay, note.dur);
      });
    };

    triggerViolinLoop();
    this.musicLoopInterval = setInterval(triggerViolinLoop, 14200);
  }

  // 4. CALM PIANO (Peaceful acoustic piano style arpeggio loop)
  private playPianoLoop() {
    if (!this.ctx || !this.musicGainNode) return;

    const arpeggioPattern = [
      { freq: 261.63, delay: 0 },    // C4
      { freq: 329.63, delay: 0.4 },  // E4
      { freq: 392.00, delay: 0.8 },  // G4
      { freq: 493.88, delay: 1.2 },  // B4
      { freq: 523.25, delay: 1.6 },  // C5
      { freq: 392.00, delay: 2.0 },  // G4
      { freq: 329.63, delay: 2.4 },  // E4
      { freq: 220.00, delay: 2.8 },  // A3
      { freq: 261.63, delay: 3.2 },  // C4
      { freq: 329.63, delay: 3.6 },  // E4
      { freq: 440.00, delay: 4.0 },  // A4
      { freq: 329.63, delay: 4.4 },  // E4
    ];

    const playPianoNote = (freq: number, noteTime: number) => {
      if (!this.ctx || !this.musicGainNode) return;

      const fundamental = this.ctx.createOscillator();
      const harmonic2 = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      fundamental.type = 'triangle';
      fundamental.frequency.setValueAtTime(freq, noteTime);

      harmonic2.type = 'sine';
      harmonic2.frequency.setValueAtTime(freq * 2, noteTime);

      const h2Gain = this.ctx.createGain();
      h2Gain.gain.setValueAtTime(0.25, noteTime);
      harmonic2.connect(h2Gain);

      fundamental.connect(noteGain);
      h2Gain.connect(noteGain);

      noteGain.gain.setValueAtTime(0, noteTime);
      noteGain.gain.linearRampToValueAtTime(0.22, noteTime + 0.015);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 2.2);

      noteGain.connect(this.musicGainNode);

      fundamental.start(noteTime);
      fundamental.stop(noteTime + 2.3);
      harmonic2.start(noteTime);
      harmonic2.stop(noteTime + 2.3);
    };

    const triggerArpeggioLoop = () => {
      if (!this.ctx || !this.musicGainNode || this.currentMusicTrack !== 'piano' || this.isMuted) return;
      const time = this.ctx.currentTime;
      arpeggioPattern.forEach((note) => {
        playPianoNote(note.freq, time + note.delay);
      });
    };

    triggerArpeggioLoop();
    this.musicLoopInterval = setInterval(triggerArpeggioLoop, 4800);
  }

  // Sound Effects (Ultra-soft, warm, romantic, and dreamy for 3D Studio)
  public playSparkleSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Ascending romantic arpeggio (A4, C5, E5, G5, B5)
    const freqs = [440.0, 523.25, 659.25, 783.99, 987.77];

    freqs.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.035);

      gain.gain.setValueAtTime(0, now + i * 0.035);
      gain.gain.linearRampToValueAtTime(0.018, now + i * 0.035 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.035 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.035);
      osc.stop(now + i * 0.035 + 0.4);
    });
  }

  // 3D Explosion Sound (Silenced per user request)
  public playExplosionSound() {
    // Silent
  }

  public playHeartbeatSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    const triggerThump = (time: number, freq: number, duration: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(28, time + duration);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.04, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    };

    triggerThump(now, 85, 0.18);
    triggerThump(now + 0.2, 70, 0.22);
  }

  public playChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.06);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.015, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playBicycleBellSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const playRing = (delay: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2093, now + delay);
      osc.frequency.exponentialRampToValueAtTime(2000, now + delay + 0.15);

      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.12, now + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.22);
    };

    playRing(0);
    playRing(0.12);
  }

  // Legacy ambient wrappers
  public startAmbient() {
    this.setMusicTrack('ambient');
  }

  public stopAmbient() {
    this.setMusicTrack('none');
  }
}

export const soundEngine = new SoundEngine();
