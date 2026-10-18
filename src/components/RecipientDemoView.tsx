import React, { useState, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX, Heart, Sparkles, Zap } from 'lucide-react';
import { WordArtData, WordArtLayout } from '../types';
import { WordArtCanvas, WordArtCanvasRef } from './WordArtCanvas';
import { soundEngine } from '../utils/audio';

interface RecipientDemoViewProps {
  wordArtData: WordArtData;
  onExitDemo: () => void;
  onCreateNew: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

const LAYOUT_CYCLE: WordArtLayout[] = ['heart', 'helix', 'globe', 'saturn', 'cloud'];

export const RecipientDemoView: React.FC<RecipientDemoViewProps> = ({
  wordArtData,
  onExitDemo,
  onCreateNew,
  isMuted,
  onToggleSound,
}) => {
  const [currentData, setCurrentData] = useState<WordArtData>(wordArtData);
  const [hasResponded, setHasResponded] = useState<boolean>(false);
  const canvasRef = useRef<WordArtCanvasRef>(null);

  React.useEffect(() => {
    if (wordArtData.musicTrack && wordArtData.musicTrack !== 'none') {
      soundEngine.setMusicTrack(wordArtData.musicTrack, wordArtData.customAudioUrl);
    }
  }, [wordArtData]);


  const handleCycleLayout = () => {
    soundEngine.playChime();
    setCurrentData((prev) => {
      const currentIndex = LAYOUT_CYCLE.indexOf(prev.layout);
      const nextIndex = (currentIndex + 1) % LAYOUT_CYCLE.length;
      return { ...prev, layout: LAYOUT_CYCLE[nextIndex] };
    });
  };

  const handleTriggerExplosion = () => {
    canvasRef.current?.triggerExplosion();
  };

  const handleResponseClick = () => {
    soundEngine.playSparkleSound();
    soundEngine.playHeartbeatSound();
    setHasResponded(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#060814] font-sans select-none">
      {/* 3D Word Art Full Screen Canvas */}
      <WordArtCanvas
        ref={canvasRef}
        wordArtData={currentData}
        isInteractive={true}
        showExplodeButton={false}
      />

      {/* Top Bar Controls */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-start justify-between pointer-events-none">
        {/* Top Left Wish Heading & Description */}
        <div className="pointer-events-auto bg-black/60 backdrop-blur-md p-2.5 sm:p-3.5 rounded-2xl border border-white/10 max-w-[68vw] sm:max-w-md shadow-xl">
          <h1 className="text-sm sm:text-2xl font-black text-[#ff2d75] tracking-tight drop-shadow-md truncate">
            {currentData.heading || 'Sorry Choroi Pakhi ❤️'}
          </h1>
          <p className="text-[11px] sm:text-sm text-white/80 font-medium mt-0.5 leading-snug line-clamp-2">
            {currentData.description || 'Amar bhul hoyeche, maaf kore dao please...'}
          </p>
        </div>

        {/* Top Right Audio Toggle & Exit Button */}
        <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
          <button
            onClick={onToggleSound}
            className="p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-white hover:text-[#ff2d75] backdrop-blur-md transition-all active:scale-90 shadow-lg"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/50" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff2d75] animate-pulse" />
            )}
          </button>

          <button
            onClick={onExitDemo}
            className="p-2 sm:px-3.5 sm:py-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-white text-xs font-bold backdrop-blur-md transition-all active:scale-95 shadow-lg flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#ff2d75]" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </div>

      {/* Bottom Floating Bar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-lg flex flex-col items-center gap-2">
        {/* Action Pill Buttons */}
        <div className="flex items-center justify-center gap-2 w-full flex-wrap">
          {/* Left Pill: Interactive Response */}
          <button
            onClick={handleResponseClick}
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-lg shadow-[#ff2d75]/30 transition-all active:scale-95 flex items-center gap-1.5 ${
              hasResponded
                ? 'bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-[#ff2d75] to-[#e02065] text-white hover:opacity-95'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${hasResponded ? 'fill-white' : 'animate-bounce'}`} />
            <span className="truncate max-w-[180px]">
              {hasResponded ? 'Response Sent! ❤️' : currentData.responseButtonText || 'Will You Forgive Me? 🥺'}
            </span>
          </button>

          {/* Middle Pill: Replay 3D Burst Explosion */}
          <button
            onClick={handleTriggerExplosion}
            title="Replay 3D Burst Explosion Effect"
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-pink-600/90 to-purple-600/90 hover:from-pink-500 hover:to-purple-500 border border-pink-400/40 text-white font-bold text-xs sm:text-sm backdrop-blur-md shadow-lg shadow-pink-500/25 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Explode 💥</span>
          </button>

          {/* Right Pill: Switch Mode */}
          <button
            onClick={handleCycleLayout}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-[#1e102e]/90 hover:bg-[#2b1840] border border-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#38bdf8]" />
            <span>Switch Mode ({currentData.layout.toUpperCase()})</span>
          </button>
        </div>

        {/* Footer Subtitle */}
        <p className="text-[10px] sm:text-[11px] text-white/70 font-medium tracking-wide drop-shadow text-center">
          ✨ Drag to rotate in 3D • Pinch/scroll to zoom
        </p>

        {/* Create Your Own Link */}
        <button
          onClick={onCreateNew}
          className="text-[10px] sm:text-[11px] text-pink-300 hover:text-white underline font-semibold transition-colors"
        >
          Want to make one for someone? Create Your Own 3D Wish
        </button>
      </div>

      {/* Response Sent Toast Overlay */}
      {hasResponded && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-none">
          <div className="p-6 rounded-3xl bg-[#1d0e30] border border-[#ff2d75] text-center text-white shadow-2xl shadow-[#ff2d75]/40 animate-scale-up max-w-xs">
            <Heart className="w-12 h-12 text-[#ff2d75] fill-[#ff2d75] mx-auto animate-pulse mb-2" />
            <h3 className="text-lg font-extrabold text-white">Thank You! ❤️</h3>
            <p className="text-xs text-pink-200 mt-1">Your response has been delivered with love!</p>
          </div>
        </div>
      )}
    </div>
  );
};
