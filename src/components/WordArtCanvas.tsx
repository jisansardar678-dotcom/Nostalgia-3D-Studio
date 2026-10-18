import React, { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { WordArtData } from '../types';
import { MULTI_COLOR_SPECTRUM, calculateWordPositions } from '../utils/particleGenerators';
import { soundEngine } from '../utils/audio';
import { Sparkles, Zap, Maximize2 } from 'lucide-react';

export interface WordArtCanvasRef {
  triggerExplosion: () => void;
}

interface WordArtCanvasProps {
  wordArtData: WordArtData;
  isInteractive?: boolean;
  onLaunchFullScreen?: () => void;
  showExplodeButton?: boolean;
}

const PARTICLE_EXPLOSION_COUNT = 1000;
const PALETTE_COLORS = [
  '#ff2d75',
  '#00f0ff',
  '#ffc700',
  '#a855f7',
  '#38bdf8',
  '#10b981',
  '#ff4757',
  '#ffffff',
  '#ff7675',
  '#feca57',
];

export const WordArtCanvas = forwardRef<WordArtCanvasRef, WordArtCanvasProps>(({
  wordArtData,
  isInteractive = true,
  onLaunchFullScreen,
  showExplodeButton = true,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const wordGroupRef = useRef<THREE.Group | null>(null);

  // Explosion Effect References
  const explosionPointsRef = useRef<THREE.Points | null>(null);
  const explosionGeometryRef = useRef<THREE.BufferGeometry | null>(null);
  const explosionDataRef = useRef<{
    velocities: Float32Array;
    lifetimes: Float32Array;
    ages: Float32Array;
    baseColors: Float32Array;
  } | null>(null);

  const shockwaveMeshRef = useRef<THREE.Mesh | null>(null);

  const clockRef = useRef<THREE.Clock | null>(null);
  const explosionStartTimeRef = useRef<number>(0);
  const isExplodingRef = useRef<boolean>(false);

  // Drag & Zoom state
  const isDraggingRef = useRef<boolean>(false);
  const previousPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const zoomRef = useRef<number>(1.0);

  // Trigger Explosion Function
  const triggerExplosion = useCallback(() => {
    if (!explosionGeometryRef.current || !explosionDataRef.current) return;

    const currentTime = clockRef.current ? clockRef.current.getElapsedTime() : 0;
    explosionStartTimeRef.current = currentTime;
    isExplodingRef.current = true;

    // Reset Particle Explosions
    const posAttr = explosionGeometryRef.current.attributes.position as THREE.BufferAttribute;
    const colorAttr = explosionGeometryRef.current.attributes.color as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const colorArr = colorAttr.array as Float32Array;

    const { velocities, lifetimes, ages, baseColors } = explosionDataRef.current;

    for (let i = 0; i < PARTICLE_EXPLOSION_COUNT; i++) {
      const idx = i * 3;

      // Start position near center (0,0,0)
      posArr[idx] = (Math.random() - 0.5) * 0.25;
      posArr[idx + 1] = (Math.random() - 0.5) * 0.25;
      posArr[idx + 2] = (Math.random() - 0.5) * 0.25;

      // Spherical explosion velocity vector
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 4.0 + Math.random() * 14.0; // Explosion burst speed

      velocities[idx] = speed * Math.sin(phi) * Math.cos(theta);
      velocities[idx + 1] = speed * Math.sin(phi) * Math.sin(theta);
      velocities[idx + 2] = speed * Math.cos(phi);

      lifetimes[i] = 0.9 + Math.random() * 1.0; // 0.9s - 1.9s lifetime
      ages[i] = 0;

      // Color from palette
      colorArr[idx] = baseColors[idx];
      colorArr[idx + 1] = baseColors[idx + 1];
      colorArr[idx + 2] = baseColors[idx + 2];
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;

    // Reset Shockwave Ring
    if (shockwaveMeshRef.current) {
      shockwaveMeshRef.current.scale.set(0.01, 0.01, 1);
      (shockwaveMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.9;
      shockwaveMeshRef.current.visible = true;
    }
  }, []);

  // Expose triggerExplosion via imperative ref
  useImperativeHandle(ref, () => ({
    triggerExplosion,
  }), [triggerExplosion]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const aspect = width / height;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0412, 0.025);
    sceneRef.current = scene;

    // 2. Camera - Balanced initial camera distance
    const camera = new THREE.PerspectiveCamera(48, aspect, 0.1, 1000);
    const cameraDist = aspect < 1.0 ? 9.2 : 8.0;
    camera.position.set(0, 0, cameraDist);
    cameraRef.current = camera;

    // 3. Renderer
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Background Starfield
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 35;
      starPos[i + 1] = (Math.random() - 0.5) * 35;
      starPos[i + 2] = (Math.random() - 0.5) * 35;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffaae5,
      size: 0.045,
      transparent: true,
      opacity: 0.5,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 5. Word Group Container
    const wordGroup = new THREE.Group();
    scene.add(wordGroup);
    wordGroupRef.current = wordGroup;

    // 6. Particle Explosion System Setup
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
      grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.25)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 64, 64);
    }
    const particleTex = new THREE.CanvasTexture(pCanvas);

    const expPositions = new Float32Array(PARTICLE_EXPLOSION_COUNT * 3);
    const expColors = new Float32Array(PARTICLE_EXPLOSION_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_EXPLOSION_COUNT * 3);
    const lifetimes = new Float32Array(PARTICLE_EXPLOSION_COUNT);
    const ages = new Float32Array(PARTICLE_EXPLOSION_COUNT);
    const baseColors = new Float32Array(PARTICLE_EXPLOSION_COUNT * 3);

    for (let i = 0; i < PARTICLE_EXPLOSION_COUNT; i++) {
      const idx = i * 3;
      expPositions[idx] = 9999;
      expPositions[idx + 1] = 9999;
      expPositions[idx + 2] = 9999;

      const colHex = PALETTE_COLORS[i % PALETTE_COLORS.length];
      const threeCol = new THREE.Color(colHex);
      expColors[idx] = threeCol.r;
      expColors[idx + 1] = threeCol.g;
      expColors[idx + 2] = threeCol.b;

      baseColors[idx] = threeCol.r;
      baseColors[idx + 1] = threeCol.g;
      baseColors[idx + 2] = threeCol.b;
    }

    const expGeometry = new THREE.BufferGeometry();
    expGeometry.setAttribute('position', new THREE.BufferAttribute(expPositions, 3));
    expGeometry.setAttribute('color', new THREE.BufferAttribute(expColors, 3));
    explosionGeometryRef.current = expGeometry;

    explosionDataRef.current = { velocities, lifetimes, ages, baseColors };

    const expMaterial = new THREE.PointsMaterial({
      size: 0.16,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const expPoints = new THREE.Points(expGeometry, expMaterial);
    scene.add(expPoints);
    explosionPointsRef.current = expPoints;

    // 7. Shockwave Ring Mesh
    const ringCanvas = document.createElement('canvas');
    ringCanvas.width = 128;
    ringCanvas.height = 128;
    const ringCtx = ringCanvas.getContext('2d');
    if (ringCtx) {
      const rGrad = ringCtx.createRadialGradient(64, 64, 20, 64, 64, 64);
      rGrad.addColorStop(0, 'rgba(255, 45, 117, 0)');
      rGrad.addColorStop(0.5, 'rgba(255, 45, 117, 0.9)');
      rGrad.addColorStop(0.8, 'rgba(0, 240, 255, 0.7)');
      rGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ringCtx.fillStyle = rGrad;
      ringCtx.fillRect(0, 0, 128, 128);
    }
    const ringTex = new THREE.CanvasTexture(ringCanvas);

    const ringGeo = new THREE.PlaneGeometry(1, 1);
    const ringMat = new THREE.MeshBasicMaterial({
      map: ringTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const shockwaveMesh = new THREE.Mesh(ringGeo, ringMat);
    shockwaveMesh.visible = false;
    scene.add(shockwaveMesh);
    shockwaveMeshRef.current = shockwaveMesh;

    // 8. Native Touch Controls
    let initialTouchDist: number | null = null;
    let initialZoom = zoomRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      if (!isInteractive) return;
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        initialTouchDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        initialZoom = zoomRef.current;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isInteractive) return;
      if (e.touches.length === 2 && initialTouchDist) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const scaleRatio = currentDist / initialTouchDist;
        zoomRef.current = Math.max(0.25, Math.min(3.5, initialZoom * scaleRatio));
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialTouchDist = null;
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    // 9. Main Animation Loop
    let animationId: number;
    const clock = new THREE.Clock();
    clockRef.current = clock;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const clockTime = clock.getElapsedTime();

      // Continuous rotation & ambient float
      if (wordGroupRef.current) {
        if (!isDraggingRef.current) {
          rotationRef.current.y += 0.005;
        }
        wordGroupRef.current.rotation.x = rotationRef.current.x;
        wordGroupRef.current.rotation.y = rotationRef.current.y;

        const totalScale = zoomRef.current;
        wordGroupRef.current.scale.set(totalScale, totalScale, totalScale);

        // Word Outward Burst & Float Animation
        const elapsedSinceExplosion = clockTime - explosionStartTimeRef.current;

        wordGroupRef.current.children.forEach((child) => {
          if (child instanceof THREE.Sprite && child.userData.targetX !== undefined) {
            const u = child.userData;
            const burstDelay = u.burstDelay || 0;
            const wordElapsed = Math.max(0, elapsedSinceExplosion - burstDelay);
            const wordProgress = Math.min(1.0, wordElapsed / 1.1); // 1.1 seconds explosion duration

            if (wordProgress < 1.0) {
              // Smooth elastic overshoot curve for explosion burst
              const t = wordProgress;
              const ease = Math.sin(t * Math.PI * 0.5);
              const overshoot = Math.sin(t * Math.PI) * 0.35 * Math.exp(-t * 2.2);
              const factor = ease + overshoot;

              child.position.x = THREE.MathUtils.lerp(u.startX, u.targetX, factor);
              child.position.y = THREE.MathUtils.lerp(u.startY, u.targetY, factor);
              child.position.z = THREE.MathUtils.lerp(u.startZ, u.targetZ, factor);

              // Scale & Opacity pop
              const scalePop = Math.min(1.0, t * 2.5) * (1.0 + Math.sin(t * Math.PI) * 0.25);
              child.scale.set(u.baseScaleX * scalePop, u.baseScaleY * scalePop, 1);
              (child.material as THREE.SpriteMaterial).opacity = Math.min(1.0, t * 4.0);
            } else {
              // Post-explosion idle floating sine wave
              child.position.x = u.targetX + Math.sin(clockTime * 1.5 + u.targetX * 2) * 0.04;
              child.position.y = u.targetY + Math.cos(clockTime * 1.8 + u.targetY * 2) * 0.05;
              child.position.z = u.targetZ + Math.sin(clockTime * 1.2 + u.targetZ) * 0.03;

              child.scale.set(u.baseScaleX, u.baseScaleY, 1);
              (child.material as THREE.SpriteMaterial).opacity = 1.0;
            }
          }
        });
      }

      // Explosion Particles Outward Motion Loop
      if (
        isExplodingRef.current &&
        explosionGeometryRef.current &&
        explosionDataRef.current
      ) {
        const elapsed = clockTime - explosionStartTimeRef.current;
        const posAttr = explosionGeometryRef.current.attributes.position as THREE.BufferAttribute;
        const colorAttr = explosionGeometryRef.current.attributes.color as THREE.BufferAttribute;
        const posArr = posAttr.array as Float32Array;
        const colorArr = colorAttr.array as Float32Array;

        const { velocities, lifetimes, ages, baseColors } = explosionDataRef.current;

        let activeCount = 0;

        for (let i = 0; i < PARTICLE_EXPLOSION_COUNT; i++) {
          const idx = i * 3;
          ages[i] += delta;

          if (ages[i] < lifetimes[i]) {
            activeCount++;

            // Position update with velocity
            posArr[idx] += velocities[idx] * delta;
            posArr[idx + 1] += velocities[idx + 1] * delta;
            posArr[idx + 2] += velocities[idx + 2] * delta;

            // Velocity drag/friction decay
            const dragFactor = Math.pow(0.92, delta * 60);
            velocities[idx] *= dragFactor;
            velocities[idx + 1] *= dragFactor;
            velocities[idx + 2] *= dragFactor;

            // Fade opacity towards end of particle life
            const alpha = Math.max(0, 1.0 - ages[i] / lifetimes[i]);
            colorArr[idx] = baseColors[idx] * alpha;
            colorArr[idx + 1] = baseColors[idx + 1] * alpha;
            colorArr[idx + 2] = baseColors[idx + 2] * alpha;
          } else {
            posArr[idx] = 9999;
            posArr[idx + 1] = 9999;
            posArr[idx + 2] = 9999;
          }
        }

        posAttr.needsUpdate = true;
        colorAttr.needsUpdate = true;

        // Animate Shockwave Ring
        if (shockwaveMeshRef.current) {
          const ringProgress = Math.min(1.0, elapsed / 0.75);
          if (ringProgress < 1.0) {
            const ringScale = THREE.MathUtils.lerp(0.1, 14.0, Math.pow(ringProgress, 0.45));
            const ringOpacity = (1.0 - ringProgress) * 0.85;
            shockwaveMeshRef.current.scale.set(ringScale, ringScale, 1);
            (shockwaveMeshRef.current.material as THREE.MeshBasicMaterial).opacity = ringOpacity;
            shockwaveMeshRef.current.visible = true;
          } else {
            shockwaveMeshRef.current.visible = false;
          }
        }

        if (activeCount === 0 && elapsed > 2.0) {
          isExplodingRef.current = false;
        }
      }

      starField.rotation.y = clockTime * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const newAspect = w / h;

      cameraRef.current.aspect = newAspect;
      const dist = newAspect < 1.0 ? 9.2 : 8.0;
      cameraRef.current.position.set(0, 0, dist);
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      cancelAnimationFrame(animationId);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
      starGeo.dispose();
      starMat.dispose();
      expGeometry.dispose();
      expMaterial.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, [isInteractive]);

  // Update 3D Word Sprites & Trigger Burst Explosion on Data Change
  useEffect(() => {
    if (!wordGroupRef.current) return;

    // Clear old word sprites
    while (wordGroupRef.current.children.length > 0) {
      const child = wordGroupRef.current.children[0];
      if (child instanceof THREE.Sprite) {
        child.geometry.dispose();
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
      wordGroupRef.current.remove(child);
    }

    const { words, layout, colorMode } = wordArtData;
    if (!words || words.length === 0) return;

    const positions = calculateWordPositions(words, layout);

    words.forEach((wordItem, i) => {
      const pos = positions[i] || { x: 0, y: 0, z: 0 };

      let primaryHex = '#ff2d75';
      if (wordItem.color) {
        primaryHex = wordItem.color;
      } else if (colorMode === 'multi_auto') {
        primaryHex = MULTI_COLOR_SPECTRUM[i % MULTI_COLOR_SPECTRUM.length];
      } else if (colorMode === 'cyber_neon') {
        primaryHex = '#00f0ff';
      } else if (colorMode === 'golden_star') {
        primaryHex = '#ffc700';
      } else if (colorMode === 'aurora_violet') {
        primaryHex = '#a855f7';
      } else {
        primaryHex = '#ff3377';
      }

      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.clearRect(0, 0, 512, 128);

        ctx.shadowColor = primaryHex;
        ctx.shadowBlur = 24;

        ctx.fillStyle = primaryHex;
        const fontSize = wordItem.size === 'large' ? 42 : wordItem.size === 'small' ? 30 : 36;
        ctx.font = `bold ${fontSize}px "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillText(wordItem.text, 256, 64);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;

      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0, // start transparent during initial burst
      });

      const sprite = new THREE.Sprite(spriteMat);

      const baseScaleY = wordItem.size === 'large' ? 0.7 : wordItem.size === 'small' ? 0.5 : 0.6;
      const baseScaleX = baseScaleY * 3.8;

      // Assign custom userData for burst trajectory
      sprite.userData = {
        targetX: pos.x,
        targetY: pos.y,
        targetZ: pos.z,
        startX: pos.x * 0.05 + (Math.random() - 0.5) * 0.2,
        startY: pos.y * 0.05 + (Math.random() - 0.5) * 0.2,
        startZ: pos.z * 0.05 + (Math.random() - 0.5) * 0.2,
        baseScaleX,
        baseScaleY,
        burstDelay: i * 0.018,
      };

      sprite.position.set(sprite.userData.startX, sprite.userData.startY, sprite.userData.startZ);
      sprite.scale.set(0.01, 0.01, 1);

      if (wordGroupRef.current) {
        wordGroupRef.current.add(sprite);
      }
    });

    // Automatically trigger explosion with precise entry delay (~350ms) as full screen view settles
    const timer = setTimeout(() => {
      triggerExplosion();
    }, 350);

    return () => clearTimeout(timer);
  }, [wordArtData, triggerExplosion]);

  const handleWheel = (e: React.WheelEvent) => {
    if (!isInteractive) return;
    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
    zoomRef.current = Math.max(0.25, Math.min(3.5, zoomRef.current + zoomDelta));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isInteractive) return;
    isDraggingRef.current = true;
    previousPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isInteractive || !isDraggingRef.current) return;
    const deltaX = e.clientX - previousPointerRef.current.x;
    const deltaY = e.clientY - previousPointerRef.current.y;

    rotationRef.current.x += deltaY * 0.005;
    rotationRef.current.y += deltaX * 0.005;

    previousPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="relative w-full h-full">
      {/* Three.js WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing touch-none select-none"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Floating Action Buttons Container (Side-By-Side Top-Right) */}
      {isInteractive && (showExplodeButton || onLaunchFullScreen) && (
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-30 flex items-center gap-1.5 flex-wrap justify-end pointer-events-auto max-w-[42%] sm:max-w-[40%]">
          {showExplodeButton && (
            <button
              onClick={triggerExplosion}
              title="Trigger 3D Burst Explosion Effect"
              className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-gradient-to-r from-pink-600/90 to-purple-600/90 hover:from-pink-500 hover:to-purple-500 border border-pink-400/40 text-white font-bold text-[10px] sm:text-[11px] backdrop-blur-md shadow-md shadow-pink-500/20 transition-all active:scale-95 flex items-center gap-1 shrink-0"
            >
              <Zap className="w-3 h-3 text-amber-300 animate-pulse" />
              <Sparkles className="w-3 h-3 text-pink-200" />
              <span>Explode 💥</span>
            </button>
          )}

          {onLaunchFullScreen && (
            <button
              onClick={onLaunchFullScreen}
              title="Launch Full Screen 3D View"
              className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] border border-blue-400/40 text-white font-bold text-[10px] sm:text-[11px] shadow-md shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-1 shrink-0"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="truncate">Full Screen 3D</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
});

WordArtCanvas.displayName = 'WordArtCanvas';
