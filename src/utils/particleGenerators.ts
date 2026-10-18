import { ColorMode, ShapeType, WordArtLayout, WordItem } from '../types';

export interface ParticleData {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
}

export const MULTI_COLOR_SPECTRUM = [
  '#ffc700', // Gold
  '#00f0ff', // Cyber Cyan
  '#ff2d75', // Neon Pink / Magenta
  '#a855f7', // Violet
  '#ff6a00', // Vibrant Orange
  '#10b981', // Emerald Green
  '#ff4d8d', // Bright Rose
  '#06b6d4', // Deep Sky Cyan
];

export const COLOR_PRESETS = [
  {
    id: 'multi_color',
    name: '🌈 Multi-Color Prism',
    primary: 'multi',
    secondary: 'multi',
    accent: '#ffffff',
    bgGlow: 'rgba(255, 0, 150, 0.3)',
  },
  {
    id: 'pink_neon',
    name: 'Neon Pink 💖',
    primary: '#ff2d75',
    secondary: '#b812ff',
    accent: '#ff94c2',
    bgGlow: 'rgba(255, 45, 117, 0.25)',
  },
  {
    id: 'cyber_cyan',
    name: 'Cyber Cyan ⚡',
    primary: '#00f0ff',
    secondary: '#0072ff',
    accent: '#70fbff',
    bgGlow: 'rgba(0, 240, 255, 0.25)',
  },
  {
    id: 'cosmic_gold',
    name: 'Cosmic Gold ✨',
    primary: '#ffb700',
    secondary: '#ff5500',
    accent: '#ffe17d',
    bgGlow: 'rgba(255, 183, 0, 0.25)',
  },
  {
    id: 'aurora_violet',
    name: 'Aurora Violet 🌌',
    primary: '#a855f7',
    secondary: '#ec4899',
    accent: '#d8b4fe',
    bgGlow: 'rgba(168, 85, 247, 0.25)',
  },
  {
    id: 'emerald_dream',
    name: 'Radiant Emerald 🌿',
    primary: '#10b981',
    secondary: '#06b6d4',
    accent: '#a7f3d0',
    bgGlow: 'rgba(16, 185, 129, 0.25)',
  },
  {
    id: 'sunset_inferno',
    name: 'Sunset Flame 🔥',
    primary: '#ff4500',
    secondary: '#ff8c00',
    accent: '#ffd700',
    bgGlow: 'rgba(255, 69, 0, 0.25)',
  },
  {
    id: 'galaxy_ice',
    name: 'Galaxy Ice ❄️',
    primary: '#38bdf8',
    secondary: '#818cf8',
    accent: '#e0f2fe',
    bgGlow: 'rgba(56, 189, 248, 0.25)',
  },
];

export function hexToRgb(hex: string): [number, number, number] {
  if (hex === 'multi') return [1, 1, 1];
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return [r, g, b];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [r, g, b];
}

export function generateShapeParticles(
  shape: ShapeType,
  count: number,
  primaryColorHex: string,
  secondaryColorHex: string,
  customTextStr: string = 'NOSTALGIA',
  isLightMode: boolean = false
): ParticleData {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  const isMultiColor = primaryColorHex === 'multi';
  const c1 = hexToRgb(primaryColorHex);
  const c2 = hexToRgb(secondaryColorHex);

  if (shape === 'word_art' && customTextStr.trim().length > 0) {
    return generateTextParticles(customTextStr, count, c1, c2);
  }

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    let x = 0, y = 0, z = 0;
    let r = c1[0], g = c1[1], b = c1[2];
    let size = 1.0;

    const t = i / count;
    const mixRatio = Math.random();

    // Multi-color rainbow calculation per particle
    if (isMultiColor) {
      const hue = (i / count + (shape === 'spiral' ? 0.2 : 0)) % 1.0;
      const rgb = hslToRgb(hue, 0.95, isLightMode ? 0.45 : 0.6);
      r = rgb[0];
      g = rgb[1];
      b = rgb[2];
    }

    switch (shape) {
      case 'spiral': {
        const arms = 4;
        const armIndex = i % arms;
        const radius = Math.pow(Math.random(), 1.7) * 5.8;
        const spin = radius * 1.6;
        const armAngle = (armIndex * (2 * Math.PI / arms)) + spin;
        const dispersion = (Math.random() - 0.5) * (0.25 + radius * 0.12);

        x = Math.cos(armAngle) * radius + dispersion;
        z = Math.sin(armAngle) * radius + dispersion;
        y = (Math.random() - 0.5) * (0.7 / (1 + radius * 0.4));

        if (!isMultiColor) {
          if (radius < 1.1) {
            r = 1.0; g = 0.95; b = 0.85;
            size = 1.8 + Math.random() * 0.8;
          } else {
            r = c1[0] * (1 - t) + c2[0] * t;
            g = c1[1] * (1 - t) + c2[1] * t;
            b = c1[2] * (1 - t) + c2[2] * t;
            size = 1.0 + Math.random() * 0.6;
          }
        } else {
          size = 1.1 + Math.random() * 0.6;
        }
        break;
      }

      case 'dna': {
        const strand = i % 2;
        const height = (t - 0.5) * 7.5;
        const angle = height * 2.5 + (strand * Math.PI);
        const radius = 1.8;

        if (i % 10 === 0) {
          const rungProgress = Math.random();
          const baseAngle = height * 2.5;
          x = Math.cos(baseAngle) * radius * (rungProgress - 0.5) * 2;
          z = Math.sin(baseAngle) * radius * (rungProgress - 0.5) * 2;
          y = height;
          if (!isMultiColor) {
            r = 1.0; g = 0.9; b = 0.4;
          }
          size = 1.1;
        } else {
          const jitter = (Math.random() - 0.5) * 0.12;
          const rawX = Math.cos(angle) * radius + jitter;
          const rawZ = Math.sin(angle) * radius + jitter;
          const rawY = height;

          const tilt = 0.4;
          x = rawX;
          y = rawY * Math.cos(tilt) - rawZ * Math.sin(tilt);
          z = rawY * Math.sin(tilt) + rawZ * Math.cos(tilt);

          if (!isMultiColor) {
            if (strand === 0) {
              r = c1[0]; g = c1[1]; b = c1[2];
            } else {
              r = c2[0]; g = c2[1]; b = c2[2];
            }
          }
          size = 1.3 + Math.random() * 0.5;
        }
        break;
      }

      case 'heart': {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI;

        const scale = 0.22;
        const rawX = 16 * Math.pow(Math.sin(u), 3);
        const rawY = 13 * Math.cos(u) - 5 * Math.cos(2*u) - 2 * Math.cos(3*u) - Math.cos(4*u);
        const rawZ = (Math.random() - 0.5) * 10 * Math.sin(v);

        x = rawX * scale;
        y = rawY * scale;
        z = rawZ * scale;

        if (!isMultiColor) {
          r = c1[0] * (0.7 + 0.3 * Math.sin(u));
          g = c1[1] * (0.6 + 0.4 * Math.cos(v));
          b = c1[2] * (0.7 + 0.3 * Math.sin(v));
        }
        size = 1.2 + Math.random() * 0.8;
        break;
      }

      case 'lotus': {
        const petalCount = 8;
        const petal = i % petalCount;
        const petalAngle = petal * (Math.PI / (petalCount / 2));
        const radius = Math.pow(Math.random(), 0.6) * 4.2;
        const petalShape = Math.sin((radius / 4.2) * Math.PI);
        const phi = petalAngle + (Math.random() - 0.5) * 0.25 * petalShape;

        x = Math.cos(phi) * radius;
        z = Math.sin(phi) * radius;
        y = Math.pow(radius / 4.2, 1.3) * 2.0 - (petalShape * 1.2);

        if (!isMultiColor) {
          r = c1[0] * (0.4 + 0.6 * petalShape) + c2[0] * (0.6 - 0.6 * petalShape);
          g = c1[1] * (0.4 + 0.6 * petalShape) + c2[1] * (0.6 - 0.6 * petalShape);
          b = c1[2] * (0.4 + 0.6 * petalShape) + c2[2] * (0.6 - 0.6 * petalShape);
        }
        size = 1.2 + Math.random() * 0.6;
        break;
      }

      case 'saturn': {
        const isRing = Math.random() > 0.35;
        if (isRing) {
          const ringRadius = 2.8 + Math.random() * 3.2;
          const ringAngle = Math.random() * Math.PI * 2;
          const rawX = Math.cos(ringAngle) * ringRadius;
          const rawZ = Math.sin(ringAngle) * ringRadius;
          const rawY = (Math.random() - 0.5) * 0.15;

          const tilt = 0.5;
          x = rawX;
          y = rawY * Math.cos(tilt) - rawZ * Math.sin(tilt);
          z = rawY * Math.sin(tilt) + rawZ * Math.cos(tilt);

          if (!isMultiColor) {
            r = c1[0]; g = c1[1]; b = c1[2];
          }
          size = 0.9 + Math.random() * 0.5;
        } else {
          const u = Math.random() * Math.PI * 2;
          const v = Math.acos(2 * Math.random() - 1);
          const radius = 1.6;
          x = radius * Math.sin(v) * Math.cos(u);
          y = radius * Math.sin(v) * Math.sin(u);
          z = radius * Math.cos(v);

          if (!isMultiColor) {
            r = c2[0]; g = c2[1]; b = c2[2];
          }
          size = 1.4 + Math.random() * 0.6;
        }
        break;
      }

      case 'constellation': {
        const u = Math.random() * Math.PI * 2;
        const v = Math.acos(2 * Math.random() - 1);
        const radius = 3.2 + (Math.random() - 0.5) * 0.3;

        x = radius * Math.sin(v) * Math.cos(u);
        y = radius * Math.sin(v) * Math.sin(u);
        z = radius * Math.cos(v);

        if (i % 15 === 0) {
          r = 1.0; g = 1.0; b = 1.0;
          size = 2.6;
        } else {
          if (!isMultiColor) {
            r = c1[0] * mixRatio + c2[0] * (1 - mixRatio);
            g = c1[1] * mixRatio + c2[1] * (1 - mixRatio);
            b = c1[2] * mixRatio + c2[2] * (1 - mixRatio);
          }
          size = 0.9 + Math.random() * 0.5;
        }
        break;
      }

      case 'wormhole': {
        const angle = Math.random() * Math.PI * 2;
        const tunnelZ = (Math.random() - 0.5) * 11;
        const radius = 2.2 + Math.random() * 0.8;

        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
        z = tunnelZ;

        if (!isMultiColor) {
          r = c1[0] * (0.5 + 0.5 * Math.sin(tunnelZ));
          g = c1[1] * (0.5 + 0.5 * Math.cos(tunnelZ));
          b = c2[2];
        }
        size = 1.1 + Math.random() * 1.0;
        break;
      }

      case 'fireworks': {
        const burstCount = 5;
        const burstIndex = i % burstCount;
        const burstCenterX = (burstIndex - 2) * 2.0;
        const burstCenterY = (burstIndex % 2 === 0 ? 1.0 : -1.0) * 1.1;
        const burstCenterZ = (Math.random() - 0.5) * 2;

        const u = Math.random() * Math.PI * 2;
        const v = Math.acos(2 * Math.random() - 1);
        const radius = Math.pow(Math.random(), 0.5) * 2.0;

        x = burstCenterX + radius * Math.sin(v) * Math.cos(u);
        y = burstCenterY + radius * Math.sin(v) * Math.sin(u);
        z = burstCenterZ + radius * Math.cos(v);

        if (!isMultiColor) {
          r = burstIndex % 2 === 0 ? c1[0] : c2[0];
          g = burstIndex % 2 === 0 ? c1[1] : c2[1];
          b = burstIndex % 2 === 0 ? c1[2] : c2[2];
        }
        size = 1.3 + Math.random() * 0.7;
        break;
      }

      case 'rose': {
        const theta = Math.random() * Math.PI * 6;
        const phi = (Math.random() - 0.5) * Math.PI;
        const k = 4;
        const rPetal = 2.8 * Math.cos(k * theta);

        x = rPetal * Math.cos(theta) * Math.cos(phi);
        y = rPetal * Math.sin(theta) * Math.cos(phi);
        z = (Math.random() - 0.5) * 1.5 + Math.sin(theta * 2) * 0.6;

        if (!isMultiColor) {
          r = c1[0]; g = c1[1] * 0.4; b = c1[2] * 0.7;
        }
        size = 1.2 + Math.random() * 0.6;
        break;
      }

      case 'infinity': {
        const theta = Math.random() * Math.PI * 2;
        const scale = 3.6;
        const denom = 1 + Math.sin(theta) * Math.sin(theta);

        x = (scale * Math.cos(theta)) / denom;
        y = (scale * Math.sin(theta) * Math.cos(theta)) / denom;
        z = Math.sin(theta * 2) * 0.9 + (Math.random() - 0.5) * 0.3;

        if (!isMultiColor) {
          r = c1[0] * (1 - t) + c2[0] * t;
          g = c1[1] * (1 - t) + c2[1] * t;
          b = c1[2] * (1 - t) + c2[2] * t;
        }
        size = 1.4 + Math.random() * 0.6;
        break;
      }

      case 'sun': {
        const isCore = Math.random() < 0.65;
        if (isCore) {
          const u = Math.random() * Math.PI * 2;
          const v = Math.acos(2 * Math.random() - 1);
          const radius = Math.pow(Math.random(), 0.5) * 2.2;
          x = radius * Math.sin(v) * Math.cos(u);
          y = radius * Math.sin(v) * Math.sin(u);
          z = radius * Math.cos(v);
          if (!isMultiColor) {
            r = 1.0; g = 0.85 + Math.random() * 0.15; b = 0.2 + Math.random() * 0.3;
          }
          size = 1.4 + Math.random() * 0.8;
        } else {
          const rayAngle = Math.random() * Math.PI * 2;
          const rayDist = 2.2 + Math.pow(Math.random(), 1.5) * 2.5;
          const zDev = (Math.random() - 0.5) * 0.6;
          x = Math.cos(rayAngle) * rayDist;
          y = Math.sin(rayAngle) * rayDist;
          z = zDev;
          if (!isMultiColor) {
            r = 1.0; g = 0.5 + Math.random() * 0.4; b = 0.1;
          }
          size = 1.1 + Math.random() * 0.6;
        }
        break;
      }

      case 'butterfly': {
        const angle = Math.random() * Math.PI * 2;
        const scale = 1.2;
        const rWing = Math.sin(angle) * (Math.exp(Math.cos(angle)) - 2 * Math.cos(4 * angle) - Math.pow(Math.sin(angle / 12), 5));
        const rawX = rWing * Math.sin(angle) * scale;
        const rawY = rWing * Math.cos(angle) * scale;
        const rawZ = (Math.random() - 0.5) * 0.8;

        x = rawX;
        y = rawY;
        z = rawZ;

        if (!isMultiColor) {
          if (Math.abs(rawX) > 1.2) {
            r = 1.0; g = 0.25; b = 0.6;
          } else {
            r = 1.0; g = 0.8; b = 0.2;
          }
        }
        size = 1.3 + Math.random() * 0.7;
        break;
      }

      case 'cloud': {
        const centers = [
          { cx: -1.4, cy: 0, cz: 0, rad: 1.4 },
          { cx: 0, cy: 0.5, cz: 0.2, rad: 1.8 },
          { cx: 1.4, cy: 0, cz: -0.1, rad: 1.3 },
          { cx: -0.7, cy: 0.8, cz: 0.1, rad: 1.2 },
          { cx: 0.8, cy: -0.3, cz: -0.2, rad: 1.2 },
        ];
        const center = centers[i % centers.length];
        const u = Math.random() * Math.PI * 2;
        const v = Math.acos(2 * Math.random() - 1);
        const radius = Math.pow(Math.random(), 0.6) * center.rad;

        x = center.cx + radius * Math.sin(v) * Math.cos(u);
        y = center.cy + radius * Math.sin(v) * Math.sin(u);
        z = center.cz + radius * Math.cos(v);

        if (!isMultiColor) {
          if (isLightMode) {
            r = 0.35 + Math.random() * 0.2;
            g = 0.5 + Math.random() * 0.35;
            b = 0.95;
          } else {
            r = 1.0; g = 0.85 + Math.random() * 0.15; b = 0.9;
          }
        }
        size = 1.5 + Math.random() * 0.8;
        break;
      }

      case 'rainbow': {
        const laneCount = 6;
        const lane = i % laneCount;
        const radius = 2.6 + lane * 0.4;
        const angle = Math.PI * (0.05 + Math.random() * 0.9);
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius - 1.2;
        z = (Math.random() - 0.5) * 0.5;

        const rainbowHues = [0, 0.08, 0.16, 0.33, 0.55, 0.78];
        const hue = rainbowHues[lane];
        const rgb = hslToRgb(hue, 0.9, 0.6);
        r = rgb[0];
        g = rgb[1];
        b = rgb[2];
        size = 1.3 + Math.random() * 0.5;
        break;
      }

      default: {
        x = (Math.random() - 0.5) * 5;
        y = (Math.random() - 0.5) * 5;
        z = (Math.random() - 0.5) * 5;
      }
    }

    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;

    colors[idx] = r;
    colors[idx + 1] = g;
    colors[idx + 2] = b;

    sizes[i] = size;
  }

  return { positions, colors, sizes };
}

function generateTextParticles(
  text: string,
  count: number,
  c1: [number, number, number],
  c2: [number, number, number]
): ParticleData {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  const canvas = document.createElement('canvas');
  const width = 600;
  const height = 200;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.toUpperCase(), width / 2, height / 2);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const validPixels: { x: number; y: number }[] = [];
    for (let py = 0; py < height; py += 2) {
      for (let px = 0; px < width; px += 2) {
        const index = (py * width + px) * 4;
        if (data[index] > 128) {
          validPixels.push({ x: px, y: py });
        }
      }
    }

    if (validPixels.length > 0) {
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        const pixel = validPixels[i % validPixels.length];

        const worldX = ((pixel.x - width / 2) / width) * 9.0;
        const worldY = -((pixel.y - height / 2) / height) * 3.0;
        const worldZ = (Math.random() - 0.5) * 0.6;

        positions[idx] = worldX + (Math.random() - 0.5) * 0.08;
        positions[idx + 1] = worldY + (Math.random() - 0.5) * 0.08;
        positions[idx + 2] = worldZ;

        const mix = i / count;
        colors[idx] = c1[0] * (1 - mix) + c2[0] * mix;
        colors[idx + 1] = c1[1] * (1 - mix) + c2[1] * mix;
        colors[idx + 2] = c1[2] * (1 - mix) + c2[2] * mix;

        sizes[i] = 1.0 + Math.random() * 0.8;
      }

      return { positions, colors, sizes };
    }
  }

  return generateShapeParticles('spiral', count, '#ff2d75', '#b812ff');
}

export function calculateWordPositions(
  words: WordItem[],
  layout: WordArtLayout
): { x: number; y: number; z: number }[] {
  const count = words.length;
  const positions: { x: number; y: number; z: number }[] = [];

  if (count === 0) return positions;

  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0.5;
    let x = 0, y = 0, z = 0;

    switch (layout) {
      case 'heart': {
        const angle = (i / count) * Math.PI * 2;
        const scale = 0.22;
        const rawX = 16 * Math.pow(Math.sin(angle), 3);
        const rawY = 13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle);
        
        const zOffset = ((i % 3) - 1) * 0.9;
        
        x = rawX * scale;
        y = rawY * scale - 0.5;
        z = zOffset;
        break;
      }

      case 'helix': {
        const height = (t - 0.5) * 5.0;
        const angle = t * Math.PI * 4;
        const radius = 2.4;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        y = height;
        break;
      }

      case 'globe': {
        const phi = Math.acos(-1 + (2 * (i + 0.5)) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        const radius = 3.0;
        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.sin(phi) * Math.sin(theta);
        z = radius * Math.cos(phi);
        break;
      }

      case 'saturn': {
        const angle = (i / count) * Math.PI * 2;
        const radius = 2.8 + (i % 2 === 0 ? 0.8 : 0);
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        y = ((i % 3) - 1) * 0.6;
        break;
      }

      case 'cloud': {
        const row = Math.floor(i / 3);
        const col = i % 3;
        x = (col - 1) * 2.8 + (Math.random() - 0.5) * 0.6;
        y = (1 - row) * 1.5 + (Math.random() - 0.5) * 0.5;
        z = ((i % 4) - 1.5) * 0.8;
        break;
      }
    }

    positions.push({ x, y, z });
  }

  return positions;
}
