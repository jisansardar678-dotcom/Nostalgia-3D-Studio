export type ShapeType =
  | 'spiral'
  | 'dna'
  | 'heart'
  | 'lotus'
  | 'saturn'
  | 'constellation'
  | 'wormhole'
  | 'fireworks'
  | 'rose'
  | 'infinity'
  | 'sun'
  | 'butterfly'
  | 'cloud'
  | 'rainbow'
  | 'word_art';

export type WordArtLayout = 'heart' | 'helix' | 'globe' | 'saturn' | 'cloud';

export type ColorMode = 'multi_auto' | 'rose_gold' | 'cyber_neon' | 'golden_star' | 'aurora_violet';

export type MusicTrackId = 'none' | 'lofi' | 'ambient' | 'violin' | 'piano' | 'custom';

export type ThemeMode = 'galaxy' | 'sunset' | 'dark' | 'light';

export type CategoryTab = 'shape' | 'color' | 'words' | 'gift';

export interface WordItem {
  id: string;
  text: string;
  color?: string; // Optional custom hex
  size?: 'small' | 'medium' | 'large';
}

export interface WordArtData {
  title: string;
  heading: string;
  description: string;
  responseButtonText: string;
  layout: WordArtLayout;
  colorMode: ColorMode;
  words: WordItem[];
  musicTrack?: MusicTrackId;
  customAudioUrl?: string;
}

export interface ParticleConfig {
  speed: number;
  particleSize: number;
  particleCount: number;
  trailEffect: number;
  pulseFrequency: number;
  attraction: boolean;
  colorPresetId: string;
  customText: string;
}

export interface ShapeOption {
  id: ShapeType;
  name: string;
  iconName: string;
  description: string;
}
