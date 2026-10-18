import React, { useEffect, useState, useRef } from 'react';
import { MusicTrackId, ParticleConfig, ShapeType, ThemeMode, WordArtData } from './types';
import { ThreeCanvas } from './components/ThreeCanvas';
import { Header } from './components/Header';
import { ControlSheet } from './components/ControlSheet';
import { WordArtCreatorModal, APOLOGY_FORGIVENESS_WORDS } from './components/WordArtCreatorModal';
import { ShareDemoModal } from './components/ShareDemoModal';
import { RecipientDemoView } from './components/RecipientDemoView';
import { GiftModal } from './components/GiftModal';
import { soundEngine } from './utils/audio';
import {
  loadActiveShapeDraft,
  loadParticleConfigDraft,
  loadWordArtDraft,
  saveActiveShapeDraft,
  saveParticleConfigDraft,
  saveWordArtDraft,
} from './utils/draftStorage';
import {
  syncDraftToFirestore,
  loadDraftFromFirestore,
  subscribeToDraft,
  getSharedWishFromFirestore,
} from './utils/firebase';

export default function App() {
  // Dark Mode Shape State (100% original galaxy state preserved)
  const [darkShape, setDarkShape] = useState<ShapeType>(() => {
    return loadActiveShapeDraft() || 'spiral';
  });

  // Light Mode Shape State (Separate daytime shape state)
  const [lightShape, setLightShape] = useState<ShapeType>(() => {
    const saved = localStorage.getItem('nostalgia_light_shape');
    return (saved as ShapeType) || 'sun';
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);

  // Theme Switcher State: Always opens directly into Dark Mode Galaxy page on app launch
  const [themeMode, setThemeMode] = useState<ThemeMode>('galaxy');

  const isLight = themeMode === 'light' || themeMode === 'sunset';
  const currentShape = isLight ? lightShape : darkShape;

  const handleSelectShape = (newShape: ShapeType) => {
    if (isLight) {
      setLightShape(newShape);
      localStorage.setItem('nostalgia_light_shape', newShape);
    } else {
      setDarkShape(newShape);
      saveActiveShapeDraft(newShape);
    }
  };

  // Modals & View Modes - default Create 3D Wish Creator open on app launch
  const [isWordArtCreatorOpen, setIsWordArtCreatorOpen] = useState<boolean>(true);
  const [isShareDemoOpen, setIsShareDemoOpen] = useState<boolean>(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState<boolean>(false);
  const [isFullDemoView, setIsFullDemoView] = useState<boolean>(false);

  // Active Word Art Data - restored from localStorage draft initially if available
  const [activeWordArt, setActiveWordArt] = useState<WordArtData>(() => {
    const savedDraft = loadWordArtDraft();
    if (savedDraft) return savedDraft;
    return {
      title: 'My Custom 3D Wish ✨',
      heading: 'Sorry Choroi Pakhi 🥺',
      description: 'Amar bhul hoyeche, maaf kore dao please...',
      responseButtonText: 'Will You Forgive Me? 🤍',
      layout: 'heart',
      colorMode: 'multi_auto',
      words: APOLOGY_FORGIVENESS_WORDS,
    };
  });

  // Particle Config for Main Studio Canvas
  const [config, setConfig] = useState<ParticleConfig>(() => {
    const savedConfig = loadParticleConfigDraft();
    if (savedConfig) return savedConfig;
    return {
      speed: 1.0,
      particleSize: 1.8,
      particleCount: 12000,
      trailEffect: 0.5,
      pulseFrequency: 1.0,
      attraction: true,
      colorPresetId: 'pink_neon',
      customText: 'NOSTALGIA',
    };
  });

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save draft to localStorage + sync to Firebase Firestore
  useEffect(() => {
    saveWordArtDraft(activeWordArt);
    setIsCloudSynced(false);

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      const success = await syncDraftToFirestore(activeWordArt);
      if (success) {
        setIsCloudSynced(true);
      }
    }, 600);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [activeWordArt]);

  useEffect(() => {
    saveParticleConfigDraft(config);
  }, [config]);

  useEffect(() => {
    saveActiveShapeDraft(darkShape);
  }, [darkShape]);

  // Load cloud draft from Firestore and subscribe to real-time changes
  useEffect(() => {
    // 1. Initial Firestore draft fetch
    loadDraftFromFirestore().then((cloudDraft) => {
      if (cloudDraft && cloudDraft.words && cloudDraft.words.length > 0) {
        setActiveWordArt(cloudDraft);
      }
    });

    // 2. Real-time Firestore subscription across tabs/devices
    const unsubscribe = subscribeToDraft((cloudDraft) => {
      if (cloudDraft && cloudDraft.words && cloudDraft.words.length > 0) {
        setActiveWordArt(cloudDraft);
        setIsCloudSynced(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Parse URL query parameters on load (for recipient shared links or Firestore wishId)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wishIdParam = params.get('wishId');
    const wordsParam = params.get('words');
    const headingParam = params.get('heading');
    const descParam = params.get('desc');
    const respParam = params.get('resp');
    const layoutParam = params.get('layout') as WordArtData['layout'];
    const cmodeParam = params.get('cmode') as WordArtData['colorMode'];

    if (wishIdParam) {
      getSharedWishFromFirestore(wishIdParam).then((sharedWish) => {
        if (sharedWish) {
          setActiveWordArt(sharedWish);
          setIsFullDemoView(true);
        }
      });
    } else if (wordsParam) {
      try {
        const parsedWords = JSON.parse(decodeURIComponent(wordsParam));
        if (Array.isArray(parsedWords) && parsedWords.length > 0) {
          setActiveWordArt({
            title: '3D Wish Card ✨',
            heading: headingParam ? decodeURIComponent(headingParam) : 'Sorry Choroi Pakhi ❤️',
            description: descParam ? decodeURIComponent(descParam) : 'Amar bhul hoyeche, maaf kore dao please...',
            responseButtonText: respParam ? decodeURIComponent(respParam) : 'Will You Forgive Me? 🥺',
            layout: layoutParam || 'heart',
            colorMode: cmodeParam || 'multi_auto',
            words: parsedWords,
          });
          setIsFullDemoView(true);
        }
      } catch (e) {
        console.error('Failed to parse 3D words from URL', e);
      }
    }
  }, []);

  // Background Music & Custom Audio File State
  const [currentMusicTrack, setCurrentMusicTrack] = useState<MusicTrackId>('none');
  const [customAudioName, setCustomAudioName] = useState<string>(() => {
    return localStorage.getItem('nostalgia_custom_audio_name') || '';
  });

  const handleSelectMusicTrack = (track: MusicTrackId) => {
    soundEngine.playChime();
    setCurrentMusicTrack(track);
    soundEngine.setMusicTrack(track, activeWordArt.customAudioUrl);
    setActiveWordArt((prev) => ({ ...prev, musicTrack: track }));
  };

  const handleUploadCustomAudio = (file: File) => {
    soundEngine.playSparkleSound();
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setCustomAudioName(file.name);
        localStorage.setItem('nostalgia_custom_audio_name', file.name);
        setCurrentMusicTrack('custom');
        soundEngine.setMusicTrack('custom', dataUrl);
        setActiveWordArt((prev) => ({
          ...prev,
          musicTrack: 'custom',
          customAudioUrl: dataUrl,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearCustomAudio = () => {
    soundEngine.playChime();
    setCustomAudioName('');
    localStorage.removeItem('nostalgia_custom_audio_name');
    setCurrentMusicTrack('none');
    soundEngine.setCustomAudioUrl(null);
    soundEngine.setMusicTrack('none');
    setActiveWordArt((prev) => ({
      ...prev,
      musicTrack: 'none',
      customAudioUrl: undefined,
    }));
  };

  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(!muted);
  };

  const handleToggleTheme = () => {
    soundEngine.playChime();
    const nextTheme: ThemeMode = themeMode === 'galaxy' ? 'sunset' : 'galaxy';
    setThemeMode(nextTheme);
    localStorage.setItem('nostalgia_theme_mode', nextTheme);
  };

  const handleSendWordArt = (data: WordArtData) => {
    setActiveWordArt(data);
    saveWordArtDraft(data);
    setIsWordArtCreatorOpen(false);
    setIsShareDemoOpen(true);
  };

  const handleLaunchFullScreenDemo = (data: WordArtData) => {
    setActiveWordArt(data);
    saveWordArtDraft(data);
    setIsWordArtCreatorOpen(false);
    setIsShareDemoOpen(false);
    setIsFullDemoView(true);
  };

  if (isFullDemoView) {
    return (
      <RecipientDemoView
        wordArtData={activeWordArt}
        onExitDemo={() => setIsFullDemoView(false)}
        onCreateNew={() => {
          setIsFullDemoView(false);
          setIsWordArtCreatorOpen(true);
        }}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
      />
    );
  }

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden font-sans select-none transition-colors duration-700 ${
        themeMode === 'light' || themeMode === 'sunset'
          ? 'bg-gradient-to-br from-[#fff5f7] via-[#ffe4e1] to-[#fbcfe8]'
          : 'bg-[#0a0412]'
      }`}
    >
      {/* 1. Main Background 3D Canvas */}
      <ThreeCanvas currentShape={currentShape} config={config} themeMode={themeMode} />

      {/* 2. Top Header */}
      <Header
        onOpenWordArtCreator={() => setIsWordArtCreatorOpen(true)}
        onOpenGiftModal={() => setIsGiftModalOpen(true)}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        isCloudSynced={isCloudSynced}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        currentMusicTrack={currentMusicTrack}
        onSelectMusicTrack={handleSelectMusicTrack}
        customAudioName={customAudioName}
        onUploadCustomAudio={handleUploadCustomAudio}
        onClearCustomAudio={handleClearCustomAudio}
      />

      {/* 3. Bottom Control Sheet */}
      <ControlSheet
        currentShape={currentShape}
        onSelectShape={handleSelectShape}
        config={config}
        onUpdateConfig={(newConf: Partial<ParticleConfig>) => setConfig((prev) => ({ ...prev, ...newConf }))}
        onOpenWordArtCreator={() => setIsWordArtCreatorOpen(true)}
        onOpenGiftModal={() => setIsGiftModalOpen(true)}
        themeMode={themeMode}
      />

      {/* 4. Creator Modal */}
      <WordArtCreatorModal
        isOpen={isWordArtCreatorOpen}
        onClose={() => setIsWordArtCreatorOpen(false)}
        onSendWordArt={handleSendWordArt}
        onLaunchFullScreenDemo={handleLaunchFullScreenDemo}
      />

      {/* 5. Share & Demo Link Modal */}
      <ShareDemoModal
        isOpen={isShareDemoOpen}
        onClose={() => setIsShareDemoOpen(false)}
        wordArtData={activeWordArt}
        onLaunchDemo={() => {
          setIsShareDemoOpen(false);
          setIsFullDemoView(true);
        }}
      />

      {/* 6. Gift Modal */}
      <GiftModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        currentShape={currentShape}
      />
    </div>
  );
}
