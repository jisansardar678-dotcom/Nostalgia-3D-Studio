import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ParticleConfig, ShapeType, ThemeMode } from '../types';
import { COLOR_PRESETS, generateShapeParticles } from '../utils/particleGenerators';

interface ThreeCanvasProps {
  currentShape: ShapeType;
  config: ParticleConfig;
  themeMode?: ThemeMode;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ currentShape, config, themeMode = 'galaxy' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const sunSpriteRef = useRef<THREE.Sprite | null>(null);
  const starFieldRef = useRef<THREE.Points | null>(null);

  const currentPositionsRef = useRef<Float32Array | null>(null);
  const targetPositionsRef = useRef<Float32Array | null>(null);
  const currentColorsRef = useRef<Float32Array | null>(null);
  const targetColorsRef = useRef<Float32Array | null>(null);

  // Rotation & Zoom State
  const rotationRef = useRef<{ x: number; y: number; vx: number; vy: number }>({
    x: 0,
    y: 0,
    vx: 0.003,
    vy: 0.002,
  });

  const zoomRef = useRef<number>(1.0);
  const isDraggingRef = useRef<boolean>(false);
  const previousPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mousePointerRef = useRef<THREE.Vector2>(new THREE.Vector2(-999, -999));

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const aspect = width / height;

    const isLightInitial = themeMode === 'light' || themeMode === 'sunset';

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = isLightInitial ? new THREE.FogExp2(0xffe4e1, 0.015) : new THREE.FogExp2(0x0a0514, 0.03);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    const cameraDist = aspect < 1.0 ? 9.5 : 8.0;
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

    // 4. Background Starfield & Daytime Sun
    const starCount = 1000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 40;
      starPos[i + 1] = (Math.random() - 0.5) * 40;
      starPos[i + 2] = (Math.random() - 0.5) * 40;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
    });
    const starField = new THREE.Points(starGeo, starMat);
    starField.visible = !isLightInitial;
    scene.add(starField);
    starFieldRef.current = starField;

    // Daytime Sun Glow Sprite for Light Mode
    const sunCanvas = document.createElement('canvas');
    sunCanvas.width = 128;
    sunCanvas.height = 128;
    const sCtx = sunCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(255, 240, 180, 1)');
      grad.addColorStop(0.3, 'rgba(255, 180, 100, 0.8)');
      grad.addColorStop(0.6, 'rgba(255, 120, 160, 0.35)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const sunTex = new THREE.CanvasTexture(sunCanvas);
    const sunMat = new THREE.SpriteMaterial({
      map: sunTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sunSprite = new THREE.Sprite(sunMat);
    sunSprite.scale.set(12, 12, 1);
    sunSprite.position.set(0, 2, -10);
    sunSprite.visible = isLightInitial;
    scene.add(sunSprite);
    sunSpriteRef.current = sunSprite;

    // 5. Particle Texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
      grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    // 6. Particle System
    const particleCount = config.particleCount;
    const preset = COLOR_PRESETS.find((p) => p.id === config.colorPresetId) || COLOR_PRESETS[0];

    const initialData = generateShapeParticles(
      currentShape,
      particleCount,
      preset.primary,
      preset.secondary,
      config.customText,
      isLightInitial
    );

    currentPositionsRef.current = new Float32Array(initialData.positions);
    targetPositionsRef.current = new Float32Array(initialData.positions);
    currentColorsRef.current = new Float32Array(initialData.colors);
    targetColorsRef.current = new Float32Array(initialData.colors);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositionsRef.current, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(currentColorsRef.current, 3));
    geometryRef.current = geometry;

    const material = new THREE.PointsMaterial({
      size: config.particleSize * 0.07,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: isLightInitial ? 0.98 : 0.95,
      blending: isLightInitial ? THREE.NormalBlending : THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    pointsRef.current = points;

    // 7. Native 2-Finger Pinch-to-Zoom
    let initialTouchDist: number | null = null;
    let initialZoom = zoomRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        initialTouchDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        initialZoom = zoomRef.current;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
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

    // 8. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      if (pointsRef.current) {
        if (!isDraggingRef.current) {
          rotationRef.current.x += rotationRef.current.vx * config.speed;
          rotationRef.current.y += rotationRef.current.vy * config.speed;
        }
        pointsRef.current.rotation.x = rotationRef.current.x;
        pointsRef.current.rotation.y = rotationRef.current.y;

        const totalScale = zoomRef.current;

        if (currentShape === 'heart') {
          const pulse = 1.0 + Math.sin(elapsedTime * 5.0) * 0.06;
          pointsRef.current.scale.set(totalScale * pulse, totalScale * pulse, totalScale * pulse);
        } else {
          pointsRef.current.scale.set(totalScale, totalScale, totalScale);
        }
      }

      // Snappy Particle Position & Color Morphing
      if (
        geometryRef.current &&
        currentPositionsRef.current &&
        targetPositionsRef.current &&
        currentColorsRef.current &&
        targetColorsRef.current
      ) {
        const posAttr = geometryRef.current.attributes.position as THREE.BufferAttribute;
        const colorAttr = geometryRef.current.attributes.color as THREE.BufferAttribute;

        const posArr = posAttr.array as Float32Array;
        const colorArr = colorAttr.array as Float32Array;

        // Snappy transition speed
        const lerpSpeed = Math.min(delta * 9.0, 0.35);

        for (let i = 0; i < posArr.length; i++) {
          posArr[i] += (targetPositionsRef.current[i] - posArr[i]) * lerpSpeed;
          colorArr[i] += (targetColorsRef.current[i] - colorArr[i]) * lerpSpeed;
        }

        posAttr.needsUpdate = true;
        colorAttr.needsUpdate = true;
      }

      starField.rotation.y = elapsedTime * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const newAspect = w / h;

      cameraRef.current.aspect = newAspect;
      const dist = newAspect < 1.0 ? 9.5 : 8.0;
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
      cancelAnimationFrame(animationFrameId);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
      geometry.dispose();
      material.dispose();
      starGeo.dispose();
      starMat.dispose();
    };
  }, []);

  // Update target positions, colors, blending & scene elements when shape, config, or themeMode changes
  useEffect(() => {
    if (!geometryRef.current) return;

    const isLight = themeMode === 'light' || themeMode === 'sunset';
    const count = config.particleCount;
    const preset = COLOR_PRESETS.find((p) => p.id === config.colorPresetId) || COLOR_PRESETS[0];

    const newData = generateShapeParticles(
      currentShape,
      count,
      preset.primary,
      preset.secondary,
      config.customText,
      isLight
    );

    targetPositionsRef.current = new Float32Array(newData.positions);
    targetColorsRef.current = new Float32Array(newData.colors);

    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.size = config.particleSize * 0.07;
      mat.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
      mat.opacity = isLight ? 0.98 : 0.95;
      mat.needsUpdate = true;
    }

    if (sceneRef.current) {
      if (isLight) {
        sceneRef.current.fog = new THREE.FogExp2(0xffe4e1, 0.015);
      } else {
        sceneRef.current.fog = new THREE.FogExp2(0x0a0514, 0.03);
      }
    }

    if (sunSpriteRef.current) {
      sunSpriteRef.current.visible = isLight;
    }

    if (starFieldRef.current) {
      starFieldRef.current.visible = !isLight;
    }
  }, [currentShape, config.colorPresetId, config.customText, config.particleSize, config.particleCount, themeMode]);

  const handleWheel = (e: React.WheelEvent) => {
    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
    zoomRef.current = Math.max(0.25, Math.min(3.5, zoomRef.current + zoomDelta));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mousePointerRef.current.set(nx, ny);

    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousPointerRef.current.x;
      const deltaY = e.clientY - previousPointerRef.current.y;

      rotationRef.current.x += deltaY * 0.005;
      rotationRef.current.y += deltaX * 0.005;

      rotationRef.current.vx = deltaY * 0.001;
      rotationRef.current.vy = deltaX * 0.001;

      previousPointerRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing touch-none select-none"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
};
