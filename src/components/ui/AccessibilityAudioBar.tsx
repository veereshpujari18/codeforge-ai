import React, { useState } from 'react';
import { Volume2, VolumeX, Eye, Glasses, Sparkles, Check, Hand } from 'lucide-react';
import { soundFx } from '../../utils/audioSonification';

interface AccessibilityProps {
  onThemeChange?: (theme: string) => void;
}

export const AccessibilityAudioBar: React.FC<AccessibilityProps> = ({ onThemeChange }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [activePalette, setActivePalette] = useState<'default' | 'high_contrast' | 'deuteranopia' | 'protanopia'>('default');
  const [xrModeActive, setXrModeActive] = useState(false);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundFx.setMuted(nextState);
    if (!nextState) {
      soundFx.playMetricPitch(75);
    }
  };

  const handleSelectPalette = (p: 'default' | 'high_contrast' | 'deuteranopia' | 'protanopia') => {
    setActivePalette(p);
    if (onThemeChange) onThemeChange(p);
    soundFx.playSonarPing();
  };

  const toggleXrMode = () => {
    setXrModeActive(!xrModeActive);
    soundFx.playQuantumCollapse();
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl glass-panel border border-purple-500/20 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-md select-none mt-3">
      {/* Sound / Sonification Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSound}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
            !isMuted
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
              : 'bg-white/5 text-gray-500 border-white/10'
          }`}
          title="Toggle Procedural Web Audio Sonification"
        >
          {!isMuted ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>Audio Sonification: {!isMuted ? 'ON' : 'MUTED'}</span>
        </button>
      </div>

      {/* Colorblindness / High Contrast Palettes */}
      <div className="flex items-center gap-1.5">
        <span className="text-gray-400 text-[11px] hidden sm:inline flex items-center gap-1">
          <Eye className="w-3 h-3 text-purple-400" />
          Color Filter:
        </span>
        {(['default', 'high_contrast', 'deuteranopia', 'protanopia'] as const).map((p) => (
          <button
            key={p}
            onClick={() => handleSelectPalette(p)}
            className={`text-[10px] uppercase px-2 py-0.5 rounded transition-all ${
              activePalette === p
                ? 'bg-purple-500/30 text-purple-200 border border-purple-400 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {p.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* WebXR / Spatial Mode Toggle */}
      <button
        onClick={toggleXrMode}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
          xrModeActive
            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-400 font-bold shadow-[0_0_15px_rgba(255,0,110,0.4)]'
            : 'bg-white/5 text-gray-300 hover:text-white border-white/10'
        }`}
        title="Toggle WebXR Spatial Tracking Mode"
      >
        <Glasses className="w-3.5 h-3.5" />
        <span>WebXR Spatial Mode: {xrModeActive ? 'ACTIVE' : 'READY'}</span>
      </button>
    </div>
  );
};
