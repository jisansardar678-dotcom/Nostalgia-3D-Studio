import { ParticleConfig, ShapeType, WordArtData } from '../types';

const WORD_ART_KEY = 'NOSTALGIA_3D_WORD_ART_DRAFT_V1';
const PARTICLE_CONFIG_KEY = 'NOSTALGIA_3D_PARTICLE_CONFIG_DRAFT_V1';
const SHAPE_KEY = 'NOSTALGIA_3D_SHAPE_DRAFT_V1';

export function saveWordArtDraft(data: WordArtData): void {
  try {
    localStorage.setItem(WORD_ART_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save WordArt draft to localStorage', e);
  }
}

export function loadWordArtDraft(): WordArtData | null {
  try {
    const raw = localStorage.getItem(WORD_ART_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WordArtData;
  } catch (e) {
    console.warn('Failed to load WordArt draft from localStorage', e);
    return null;
  }
}

export function saveParticleConfigDraft(config: ParticleConfig): void {
  try {
    localStorage.setItem(PARTICLE_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save ParticleConfig draft to localStorage', e);
  }
}

export function loadParticleConfigDraft(): ParticleConfig | null {
  try {
    const raw = localStorage.getItem(PARTICLE_CONFIG_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ParticleConfig;
  } catch (e) {
    console.warn('Failed to load ParticleConfig draft from localStorage', e);
    return null;
  }
}

export function saveActiveShapeDraft(shape: ShapeType): void {
  try {
    localStorage.setItem(SHAPE_KEY, shape);
  } catch (e) {
    console.warn('Failed to save ActiveShape draft to localStorage', e);
  }
}

export function loadActiveShapeDraft(): ShapeType | null {
  try {
    return (localStorage.getItem(SHAPE_KEY) as ShapeType) || null;
  } catch (e) {
    return null;
  }
}

export function clearAllDrafts(): void {
  try {
    localStorage.removeItem(WORD_ART_KEY);
    localStorage.removeItem(PARTICLE_CONFIG_KEY);
    localStorage.removeItem(SHAPE_KEY);
  } catch (e) {
    console.warn('Failed to clear drafts from localStorage', e);
  }
}
