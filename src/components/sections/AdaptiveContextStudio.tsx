import React, { useState } from 'react';
import { PerformanceObservatory3D } from '../3d/PerformanceObservatory3D';
import { LivingASTTree3D } from '../3d/LivingASTTree3D';
import { ExecutionHelixTimeline3D } from '../3d/ExecutionHelixTimeline3D';
import { QuantumCodeSuperposition3D } from '../3d/QuantumCodeSuperposition3D';
import { HolographicTerminal3D } from '../3d/HolographicTerminal3D';
import { SessionReplayBar } from '../ui/SessionReplayBar';
import { AccessibilityAudioBar } from '../ui/AccessibilityAudioBar';
import { MultiplayerCollaborationOverlay } from '../multiplayer/MultiplayerCollaborationOverlay';
import { 
  Activity, 
  GitFork, 
  History, 
  Atom, 
  Terminal, 
  Compass, 
  Sparkles, 
  Layers, 
  Radio,
  Eye
} from 'lucide-react';
import { soundFx } from '../../utils/audioSonification';

export type AdaptiveMode = 
  | 'observatory' 
  | 'living_ast' 
  | 'helix_timeline' 
  | 'quantum_superposition' 
  | 'holographic_terminal';

export const AdaptiveContextStudio: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AdaptiveMode>('observatory');

  const handleModeChange = (mode: AdaptiveMode) => {
    setActiveMode(mode);
    soundFx.playSonarPing();
  };

  const modeButtons = [
    { id: 'observatory' as const, label: '3D Performance Space', icon: Activity, badge: 'Real-Time' },
    { id: 'living_ast' as const, label: 'Living AST Tree', icon: GitFork, badge: 'Auto-Healing' },
    { id: 'helix_timeline' as const, label: 'DNA Execution Helix', icon: History, badge: '4D Temporal' },
    { id: 'quantum_superposition' as const, label: 'Quantum Superposition', icon: Atom, badge: 'Experimental' },
    { id: 'holographic_terminal' as const, label: 'Holographic Terminal', icon: Terminal, badge: 'Voice / XR' },
  ];

  return (
    <section id="observatory" className="py-20 relative overflow-hidden bg-[#090d24] border-t border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-3">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            NEXT-GEN 3D VISUALIZATION ENGINE
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            Adaptive Context & Quantum Spatial Studio
          </h2>
          <p className="mt-4 text-gray-400 text-base leading-relaxed">
            Move beyond static panels into living, data-driven 3D environments that adapt to your exact engineering task:
            telemetry observatories, living AST trees, 4D DNA execution helices, and quantum probability superposition.
          </p>
        </div>

        {/* Adaptive Mode Switcher Tab Bar */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex flex-wrap p-1.5 rounded-2xl bg-[#11173d] border border-cyan-500/30 shadow-[0_0_30px_rgba(0,217,255,0.15)] gap-1">
            {modeButtons.map((btn) => {
              const Icon = btn.icon;
              const isActive = activeMode === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => handleModeChange(btn.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-300 text-black font-bold shadow-[0_0_15px_rgba(0,217,255,0.4)] scale-[1.02]'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-cyan-400'}`} />
                  <span>{btn.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded uppercase ${
                    isActive ? 'bg-black/20 text-black font-semibold' : 'bg-white/10 text-gray-400'
                  }`}>
                    {btn.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active 3D Environment Rendering */}
        <div className="transition-all duration-500 ease-out">
          {activeMode === 'observatory' && <PerformanceObservatory3D />}
          {activeMode === 'living_ast' && <LivingASTTree3D />}
          {activeMode === 'helix_timeline' && <ExecutionHelixTimeline3D />}
          {activeMode === 'quantum_superposition' && <QuantumCodeSuperposition3D />}
          {activeMode === 'holographic_terminal' && <HolographicTerminal3D />}
        </div>

        {/* Real-time Collaborative Multiplayer Presence */}
        <MultiplayerCollaborationOverlay />

        {/* Session Replay Scrubber Bar */}
        <SessionReplayBar />

        {/* Audio Sonification & Accessibility Bar */}
        <AccessibilityAudioBar />
      </div>
    </section>
  );
};
