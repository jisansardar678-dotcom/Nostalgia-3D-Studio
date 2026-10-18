import React, { useState } from 'react';
import {
  Layers,
  Palette,
  Sparkles,
  Send,
  Orbit,
  Dna,
  Heart,
  Flower2,
  Globe,
  Compass,
  Zap,
  Flame,
  Infinity as InfinityIcon,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Sun,
  Cloud,
} from 'lucide-react';
import { CategoryTab, ParticleConfig, ShapeOption, ShapeType, ThemeMode } from '../types';
import { COLOR_PRESETS } from '../utils/particleGenerators';
import { soundEngine } from '../utils/audio';

interface ControlSheetProps {
  currentShape: ShapeType;
  onSelectShape: (shape: ShapeType) => void;
  config: ParticleConfig;
  onUpdateConfig: (newConfig: Partial<ParticleConfig>) => void;
  onOpenWordArtCreator: () => void;
  onOpenGiftModal: () => void;
  themeMode?: ThemeMode;
}

const SHAPE_OPTIONS_DARK: ShapeOption[] = [
  { id: 'spiral', name: 'Spiral Galaxy', iconName: 'Orbit', description: 'Swirling dual spiral stardust' },
  { id: 'dna', name: 'DNA Helix', iconName: 'Dna', description: 'Twisting genetic double strand' },
  { id: 'heart', name: '3D Heart Mesh', iconName: 'Heart', description: 'Pulsating volumetric heart' },
  { id: 'lotus', name: 'Lotus Nebula', iconName: 'Flower2', description: 'Multi-petal cosmic flower' },
  { id: 'saturn', name: 'Saturn Ring', iconName: 'Globe', description: 'Planet core with celestial ring' },
  { id: 'constellation', name: 'Constellation', iconName: 'Compass', description: 'Interconnected glowing stars' },
  { id: 'wormhole', name: 'Wormhole Tunnel', iconName: 'Zap', description: 'Hyperspace tunnel acceleration' },
  { id: 'fireworks', name: 'Fireworks Show', iconName: 'Flame', description: 'Explosive particle bursts' },
  { id: 'rose', name: 'Rose Flower', iconName: 'Flower2', description: 'Mathematical 3D rose bloom' },
  { id: 'infinity', name: 'Infinity Loop', iconName: 'InfinityIcon', description: 'Flowing continuous loop' },
];

const SHAPE_OPTIONS_LIGHT: ShapeOption[] = [
  { id: 'sun', name: 'Glowing Sun ☀️', iconName: 'Sun', description: 'Radiant golden solar core & rays' },
  { id: 'butterfly', name: 'Butterfly Bloom 🦋', iconName: 'Sparkles', description: 'Twin wing daytime flutter' },
  { id: 'cloud', name: 'Fluffy Cloud ☁️', iconName: 'Cloud', description: 'Soft daytime cloud cluster' },
  { id: 'lotus', name: 'Lotus Flower 🪷', iconName: 'Flower2', description: 'Multi-petal radiant bloom' },
  { id: 'heart', name: 'Warm Heart ❤️', iconName: 'Heart', description: 'Radiant volumetric heart' },
  { id: 'rose', name: 'Rose Bloom 🌹', iconName: 'Flower2', description: 'Golden rose bloom' },
  { id: 'saturn', name: 'Golden Ring 🪐', iconName: 'Globe', description: 'Golden celestial ring & sun core' },
  { id: 'rainbow', name: 'Rainbow Arc 🌈', iconName: 'Sparkles', description: 'Prism sunlight arc' },
  { id: 'infinity', name: 'Infinite Loop ♾️', iconName: 'InfinityIcon', description: 'Golden continuous loop' },
];

export const ControlSheet: React.FC<ControlSheetProps> = ({
  currentShape,
  onSelectShape,
  config,
  onUpdateConfig,
  onOpenWordArtCreator,
  onOpenGiftModal,
  themeMode = 'galaxy',
}) => {
  const [activeTab, setActiveTab] = useState<CategoryTab>('shape');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const isLight = themeMode === 'light' || themeMode === 'sunset';
  const shapeOptions = isLight ? SHAPE_OPTIONS_LIGHT : SHAPE_OPTIONS_DARK;

  const renderShapeIcon = (id: ShapeType) => {
    switch (id) {
      case 'spiral': return <Orbit className="w-5 h-5 text-[#ff2d75]" />;
      case 'dna': return <Dna className="w-5 h-5 text-blue-400" />;
      case 'heart': return <Heart className={`w-5 h-5 ${isLight ? 'text-rose-500 fill-rose-500/30' : 'text-red-500 fill-red-500/20'}`} />;
      case 'lotus': return <Flower2 className={`w-5 h-5 ${isLight ? 'text-pink-600' : 'text-pink-400'}`} />;
      case 'saturn': return <Globe className="w-5 h-5 text-amber-500" />;
      case 'constellation': return <Compass className="w-5 h-5 text-purple-400" />;
      case 'wormhole': return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'fireworks': return <Flame className="w-5 h-5 text-orange-400" />;
      case 'rose': return <Flower2 className="w-5 h-5 text-rose-500" />;
      case 'infinity': return <InfinityIcon className="w-5 h-5 text-teal-400" />;
      case 'sun': return <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" />;
      case 'butterfly': return <Sparkles className="w-5 h-5 text-pink-500" />;
      case 'cloud': return <Cloud className="w-5 h-5 text-sky-400" />;
      case 'rainbow': return <Sparkles className="w-5 h-5 text-orange-400" />;
      default: return <Orbit className="w-5 h-5 text-[#ff2d75]" />;
    }
  };

  const handleShapeClick = (id: ShapeType) => {
    soundEngine.playSparkleSound();
    if (id === 'heart') {
      soundEngine.playHeartbeatSound();
    }
    onSelectShape(id);
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-[540px] transition-all duration-300">
      {/* Collapse Handle */}
      <div className="flex justify-center -mb-2 relative z-30">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`px-4 py-1 rounded-t-xl border border-b-0 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-lg ${
            isLight
              ? 'bg-white/90 border-pink-200 text-pink-700 hover:text-pink-900'
              : 'bg-[#1d0e2e]/90 border-t-white/10 border-x-white/10 text-white/70 hover:text-white'
          }`}
        >
          {isCollapsed ? (
            <>
              <ChevronUp className={`w-3.5 h-3.5 ${isLight ? 'text-rose-500' : 'text-[#ff2d75]'}`} />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className={`w-3.5 h-3.5 ${isLight ? 'text-rose-500' : 'text-[#ff2d75]'}`} />
              <span>Hide Controls</span>
            </>
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className={`rounded-2xl p-4 shadow-2xl backdrop-blur-xl transition-all border ${
          isLight
            ? 'bg-white/95 border-pink-200/90 shadow-pink-500/10 text-slate-800'
            : 'bg-[#12081f]/95 border-[#ff2d75]/30 shadow-[#ff2d75]/10 text-white'
        }`}>
          {/* Top Category Nav Pills */}
          <div className={`flex items-center justify-between gap-1 p-1.5 rounded-full border mb-4 overflow-x-auto no-scrollbar ${
            isLight ? 'bg-pink-50/80 border-pink-200/80' : 'bg-[#1c0d2e]/80 border-white/5'
          }`}>
            <button
              onClick={() => {
                setActiveTab('shape');
                soundEngine.playChime();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'shape'
                  ? isLight
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'bg-[#ff2d75] text-white shadow-md shadow-[#ff2d75]/40'
                  : isLight
                  ? 'text-pink-900/80 hover:text-pink-950 hover:bg-pink-100/60'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3D Shape</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('color');
                soundEngine.playChime();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'color'
                  ? isLight
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'bg-[#ff2d75] text-white shadow-md shadow-[#ff2d75]/40'
                  : isLight
                  ? 'text-pink-900/80 hover:text-pink-950 hover:bg-pink-100/60'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Color & Speed</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('words');
                soundEngine.playChime();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'words'
                  ? isLight
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'bg-[#ff2d75] text-white shadow-md shadow-[#ff2d75]/40'
                  : isLight
                  ? 'text-pink-900/80 hover:text-pink-950 hover:bg-pink-100/60'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D Words</span>
            </button>

            <button
              onClick={() => {
                onOpenGiftModal();
                soundEngine.playChime();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                isLight ? 'text-pink-900/80 hover:text-pink-950 hover:bg-pink-100/60' : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Send className={`w-3.5 h-3.5 ${isLight ? 'text-rose-500' : 'text-[#ff2d75]'}`} />
              <span>Send Gift</span>
            </button>
          </div>

          {/* TAB 1: SHAPES */}
          {activeTab === 'shape' && (
            <div className="grid grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {shapeOptions.map((shape) => {
                const isActive = currentShape === shape.id;
                return (
                  <button
                    key={shape.id}
                    onClick={() => handleShapeClick(shape.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 relative group active:scale-95 ${
                      isActive
                        ? isLight
                          ? 'bg-amber-100/90 border-amber-500 shadow-md shadow-amber-500/20 ring-1 ring-amber-500 text-slate-900 font-bold'
                          : 'bg-[#2b103c]/90 border-[#ff2d75] shadow-lg shadow-[#ff2d75]/25 ring-1 ring-[#ff2d75] text-white font-bold'
                        : isLight
                        ? 'bg-white/80 border-pink-200/80 hover:border-pink-400 hover:bg-white text-slate-700'
                        : 'bg-[#1b0c2a]/60 border-white/10 hover:border-[#ff2d75]/50 hover:bg-[#231038]/80 text-white/80'
                    }`}
                  >
                    <div className={`p-2 rounded-full mb-1.5 group-hover:scale-110 transition-transform ${
                      isLight ? 'bg-pink-100/80' : 'bg-white/5'
                    }`}>
                      {renderShapeIcon(shape.id)}
                    </div>
                    <span
                      className={`text-xs font-semibold truncate w-full ${
                        isActive ? (isLight ? 'text-slate-900 font-bold' : 'text-white font-bold') : (isLight ? 'text-slate-700' : 'text-white/80')
                      }`}
                    >
                      {shape.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: COLOR & SPEED */}
          {activeTab === 'color' && (
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              <div>
                <label className={`text-xs font-bold block mb-2 ${isLight ? 'text-slate-800' : 'text-white/80'}`}>
                  Color Palette & Multi-Color Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COLOR_PRESETS.map((p) => {
                    const isSelected = config.colorPresetId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          soundEngine.playChime();
                          onUpdateConfig({ colorPresetId: p.id });
                        }}
                        className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-medium transition-all ${
                          isSelected
                            ? isLight
                              ? 'bg-pink-100/90 border-rose-500 text-slate-900 shadow-sm ring-1 ring-rose-500 font-bold'
                              : 'bg-[#2b103c] border-[#ff2d75] text-white shadow-md shadow-[#ff2d75]/20 ring-1 ring-[#ff2d75]'
                            : isLight
                            ? 'bg-white/80 border-pink-200 text-slate-700 hover:bg-pink-50/80'
                            : 'bg-[#1b0c2a]/60 border-white/10 text-white/70 hover:bg-[#231038]'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                          style={{
                            background:
                              p.primary === 'multi'
                                ? 'linear-gradient(135deg, #ff0055, #00f0ff, #ffc700, #a855f7)'
                                : `linear-gradient(135deg, ${p.primary}, ${p.secondary})`,
                          }}
                        />
                        <span className="truncate">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className={`flex justify-between text-xs mb-1 ${isLight ? 'text-slate-800 font-medium' : 'text-white/80'}`}>
                    <span>Rotation Speed</span>
                    <span className={`${isLight ? 'text-rose-600' : 'text-[#ff2d75]'} font-bold`}>{config.speed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={config.speed}
                    onChange={(e) => onUpdateConfig({ speed: parseFloat(e.target.value) })}
                    className={`w-full rounded-lg cursor-pointer h-1.5 ${isLight ? 'accent-rose-500 bg-pink-100' : 'accent-[#ff2d75] bg-white/10'}`}
                  />
                </div>

                <div>
                  <div className={`flex justify-between text-xs mb-1 ${isLight ? 'text-slate-800 font-medium' : 'text-white/80'}`}>
                    <span>Particle Glow Size</span>
                    <span className={`${isLight ? 'text-rose-600' : 'text-[#ff2d75]'} font-bold`}>{config.particleSize.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.5"
                    step="0.1"
                    value={config.particleSize}
                    onChange={(e) => onUpdateConfig({ particleSize: parseFloat(e.target.value) })}
                    className={`w-full rounded-lg cursor-pointer h-1.5 ${isLight ? 'accent-rose-500 bg-pink-100' : 'accent-[#ff2d75] bg-white/10'}`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 3D WORDS */}
          {activeTab === 'words' && (
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {/* Creator Launcher Banner */}
              <button
                onClick={() => {
                  soundEngine.playSparkleSound();
                  onOpenWordArtCreator();
                }}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#2563eb] via-[#7c3aed] to-[#ff2d75] text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-lg shadow-blue-500/25 hover:opacity-95 transition-all active:scale-95"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className="w-5 h-5 text-white" />
                  <div className="text-left">
                    <div className="text-white font-extrabold">Open 3D Word Art Creator</div>
                    <div className="text-[10px] text-pink-100 font-normal">
                      Layouts, floating words, color glow & shareable demo link
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/20 text-[10px]">Create</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
