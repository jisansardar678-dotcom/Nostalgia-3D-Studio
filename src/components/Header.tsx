import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Share2,
  Box,
  PlusCircle,
  CloudCheck,
  CloudUpload,
  Moon,
  Sun,
  Music,
  Upload,
  Headphones,
  Check,
  X,
} from 'lucide-react';
import { MusicTrackId, ThemeMode } from '../types';

interface HeaderProps {
  onOpenWordArtCreator: () => void;
  onOpenGiftModal: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  isCloudSynced?: boolean;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  currentMusicTrack?: MusicTrackId;
  onSelectMusicTrack?: (track: MusicTrackId) => void;
  customAudioName?: string;
  onUploadCustomAudio?: (file: File) => void;
  onClearCustomAudio?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenWordArtCreator,
  onOpenGiftModal,
  isMuted,
  onToggleSound,
  isCloudSynced = true,
  themeMode,
  onToggleTheme,
  currentMusicTrack = 'none',
  onSelectMusicTrack,
  customAudioName,
  onUploadCustomAudio,
  onClearCustomAudio,
}) => {
  const isLight = themeMode === 'light' || themeMode === 'sunset';
  const [isMusicPopoverOpen, setIsMusicPopoverOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadCustomAudio) {
      onUploadCustomAudio(file);
    }
  };

  return (
    <header className={`relative z-30 w-full px-3 sm:px-4 py-3 flex items-center justify-between backdrop-blur-md border-b transition-colors duration-500 ${
      isLight ? 'bg-white/70 border-pink-200/60 shadow-sm' : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent border-white/5'
    }`}>
      {/* Left: Create Custom 3D Word Art Button & Cloud Status */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenWordArtCreator}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-full border text-xs sm:text-sm font-bold shadow-lg transition-all duration-300 group active:scale-95 ${
            isLight
              ? 'bg-white/90 hover:bg-white border-pink-300 text-slate-800 shadow-pink-500/10'
              : 'bg-[#1e0f2d]/90 hover:bg-[#2e1845] border-[#ff2d75]/40 text-white shadow-[#ff2d75]/10 hover:shadow-[#ff2d75]/25'
          }`}
        >
          <PlusCircle className={`w-4 h-4 group-hover:rotate-90 transition-transform ${isLight ? 'text-pink-500' : 'text-[#ff2d75]'}`} />
          <span>Create 3D Word Art</span>
        </button>

        {/* Firebase Cloud Sync Badge */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] ${
            isLight ? 'bg-white/80 border-pink-200 text-pink-700' : 'bg-white/5 border-white/10 text-pink-200'
          }`}
          title="Synced across all your devices with Firebase Firestore"
        >
          {isCloudSynced ? (
            <>
              <CloudCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Cloud Synced</span>
            </>
          ) : (
            <>
              <CloudUpload className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Syncing...</span>
            </>
          )}
        </div>
      </div>

      {/* Center: Title */}
      <div className="flex flex-col items-center text-center mx-1 sm:mx-2">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <Sparkles className={`w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse ${isLight ? 'text-amber-500' : 'text-[#ff2d75]'}`} />
          <h1 className={`text-xs sm:text-lg font-extrabold tracking-wide bg-clip-text text-transparent ${
            isLight
              ? 'bg-gradient-to-r from-pink-600 via-rose-500 to-amber-600'
              : 'bg-gradient-to-r from-white via-pink-100 to-[#ff2d75]'
          }`}>
            Nostalgia 3D Studio
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 relative">
        {/* Theme Switcher Toggle Button */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-full border transition-all active:scale-90 flex items-center justify-center ${
            isLight
              ? 'bg-amber-100/90 hover:bg-amber-200/90 border-amber-300 text-amber-600 shadow-sm'
              : 'bg-[#1e0f2d]/80 hover:bg-[#2e1845] border-white/10 text-white hover:text-[#ff2d75]'
          }`}
          title={isLight ? 'Switch to Dark Galaxy Mode 🌌' : 'Switch to Bright Light Mode ☀️'}
        >
          {isLight ? (
            <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-purple-300 hover:text-purple-200" />
          )}
        </button>

        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wider ${
          isLight
            ? 'bg-pink-100/80 border-pink-300 text-pink-700'
            : 'bg-[#ff2d75]/20 border-[#ff2d75]/50 text-white'
        }`}>
          <Box className={`w-3.5 h-3.5 ${isLight ? 'text-pink-600' : 'text-[#ff2d75]'}`} />
          <span className={`bg-clip-text text-transparent ${
            isLight
              ? 'bg-gradient-to-r from-pink-600 to-rose-600'
              : 'bg-gradient-to-r from-pink-200 to-white'
          }`}>
            {isLight ? 'LIGHT 3D' : '3D MODE'}
          </span>
        </div>

        {/* Music Note Icon Button */}
        <button
          onClick={() => setIsMusicPopoverOpen(!isMusicPopoverOpen)}
          className={`p-2 rounded-full border transition-all active:scale-90 relative ${
            currentMusicTrack !== 'none'
              ? isLight
                ? 'bg-pink-100 border-pink-400 text-rose-600 ring-2 ring-pink-300 shadow-sm'
                : 'bg-[#ff2d75]/30 border-[#ff2d75] text-[#ff2d75] ring-2 ring-[#ff2d75]/40 shadow-lg shadow-[#ff2d75]/30'
              : isLight
              ? 'bg-white/80 hover:bg-white border-pink-200 text-slate-700 hover:text-pink-600'
              : 'bg-[#1e0f2d]/80 hover:bg-[#2e1845] border-white/10 text-white hover:text-[#ff2d75]'
          }`}
          title="Background Music & Audio (.mp3)"
        >
          <Music className="w-4 h-4" />
        </button>

        {/* Music Control Popover */}
        {isMusicPopoverOpen && (
          <div className={`absolute top-12 right-0 z-50 w-72 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl animate-scale-up ${
            isLight
              ? 'bg-white/95 border-pink-200 text-slate-800 shadow-pink-500/15'
              : 'bg-[#180b28]/95 border-[#ff2d75]/40 text-white shadow-[#ff2d75]/20'
          }`}>
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
              <div className="flex items-center gap-1.5 font-extrabold text-xs">
                <Headphones className={`w-4 h-4 ${isLight ? 'text-pink-600' : 'text-[#ff2d75]'}`} />
                <span>Background Music 🎵</span>
              </div>
              <button
                onClick={() => setIsMusicPopoverOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Track Selector Options */}
            <div className="space-y-1.5 mb-3">
              {[
                { id: 'none', label: '🔇 Off / Mute', desc: 'No background audio' },
                { id: 'lofi', label: '🎧 Lo-Fi Beats', desc: 'Warm minor chords & vinyl crackle' },
                { id: 'ambient', label: '🌌 Ambient Space', desc: 'Ethereal cosmic pads' },
                { id: 'violin', label: '🎻 Melancholy Violin', desc: 'Emotional & soothing acoustic violin strings' },
                { id: 'piano', label: '🎹 Calm Piano', desc: 'Peaceful acoustic piano' },
                ...(customAudioName
                  ? [{ id: 'custom', label: `🎵 ${customAudioName}`, desc: 'Your uploaded MP3 track' }]
                  : []),
              ].map((tr) => {
                const isSelected = currentMusicTrack === tr.id;
                
                if (tr.id === 'custom') {
                  return (
                    <div
                      key={tr.id}
                      className={`w-full p-2 rounded-xl border flex items-center justify-between transition-all ${
                        isSelected
                          ? isLight
                            ? 'bg-pink-100/90 border-pink-400 text-pink-900 font-bold shadow-sm'
                            : 'bg-[#2b103c] border-[#ff2d75] text-white font-bold shadow-md shadow-[#ff2d75]/20'
                          : isLight
                          ? 'bg-white/80 border-pink-100 hover:bg-pink-50 text-slate-700'
                          : 'bg-[#12071f]/80 border-white/5 hover:bg-[#200f33] text-white/70'
                      }`}
                    >
                      <button
                        onClick={() => {
                          if (onSelectMusicTrack) {
                            onSelectMusicTrack('custom');
                          }
                        }}
                        className="flex-1 text-left flex items-center justify-between min-w-0 mr-1.5"
                      >
                        <div className="min-w-0 pr-1">
                          <div className="text-xs font-bold truncate">{tr.label}</div>
                          <div className="text-[10px] opacity-70 font-normal truncate">{tr.desc}</div>
                        </div>
                        {isSelected && <Check className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-rose-600' : 'text-[#ff2d75]'}`} />}
                      </button>

                      {/* Delete Custom Track Cross Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onClearCustomAudio) {
                            onClearCustomAudio();
                          }
                        }}
                        className="p-1 rounded-full hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                        title="Delete custom uploaded track"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                return (
                  <button
                    key={tr.id}
                    onClick={() => {
                      if (onSelectMusicTrack) {
                        onSelectMusicTrack(tr.id as MusicTrackId);
                      }
                    }}
                    className={`w-full p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? isLight
                          ? 'bg-pink-100/90 border-pink-400 text-pink-900 font-bold shadow-sm'
                          : 'bg-[#2b103c] border-[#ff2d75] text-white font-bold shadow-md shadow-[#ff2d75]/20'
                        : isLight
                        ? 'bg-white/80 border-pink-100 hover:bg-pink-50 text-slate-700'
                        : 'bg-[#12071f]/80 border-white/5 hover:bg-[#200f33] text-white/70'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{tr.label}</div>
                      <div className="text-[10px] opacity-70 font-normal truncate max-w-[190px]">{tr.desc}</div>
                    </div>
                    {isSelected && <Check className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-rose-600' : 'text-[#ff2d75]'}`} />}
                  </button>
                );
              })}
            </div>

            {/* Upload Custom Audio File (.mp3) */}
            <div className={`p-2.5 rounded-xl border ${
              isLight ? 'bg-pink-50/80 border-pink-200' : 'bg-[#12071f] border-white/10'
            }`}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                  isLight
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-500/20 hover:opacity-95'
                    : 'bg-gradient-to-r from-[#ff2d75] to-[#b812ff] text-white shadow-[#ff2d75]/25 hover:opacity-95'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom MP3 📱</span>
              </button>
              <p className="text-[9px] text-center opacity-70 mt-1">
                Upload .mp3 from phone. Plays along with shared 3D wish!
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onToggleSound}
          className={`p-2 rounded-full border transition-all active:scale-90 ${
            isLight
              ? 'bg-white/80 hover:bg-white border-pink-200 text-slate-700 hover:text-pink-600'
              : 'bg-[#1e0f2d]/80 hover:bg-[#2e1845] border-white/10 text-white hover:text-[#ff2d75]'
          }`}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? (
            <VolumeX className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-white/60'}`} />
          ) : (
            <Volume2 className={`w-4 h-4 ${isLight ? 'text-pink-600' : 'text-[#ff2d75]'} animate-pulse`} />
          )}
        </button>

        <button
          onClick={onOpenGiftModal}
          className={`p-2 sm:px-3 sm:py-2 rounded-full text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 ${
            isLight
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 shadow-pink-500/20'
              : 'bg-gradient-to-r from-[#ff2d75] to-[#b812ff] shadow-[#ff2d75]/30'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share 3D Link</span>
        </button>
      </div>
    </header>
  );
};
