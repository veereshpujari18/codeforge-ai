import React from 'react';
import { DebugVisualizer3D } from '../3d/DebugVisualizer3D';
import { Bug, Activity, ShieldAlert, Cpu, Eye, CheckCircle2 } from 'lucide-react';

export const AdvancedDebuggingSection: React.FC = () => {
  return (
    <section id="debugger" className="py-24 relative overflow-hidden bg-[#090d24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-mono mb-3">
            <Bug className="w-3.5 h-3.5 text-pink-400" />
            SECTION 02 // TIME-TRAVEL DEBUGGER
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            3D Call Stack & Anomaly Isolation
          </h2>
          <p className="mt-4 text-gray-400 text-base leading-relaxed">
            Diagnose heisenbugs, thread race conditions, and insidious memory leaks in true 3D spatial space.
            Inspect active stack frames, step backwards through instruction memory, and verify automated patches.
          </p>
        </div>

        {/* 3D Visualizer & Scenario Stepper */}
        <DebugVisualizer3D />

        {/* Supporting Feature Highlights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl glass-card border border-white/10">
            <div className="flex items-center gap-2.5 mb-2 text-pink-400">
              <Activity className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-white">Deterministic Time-Travel</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Step backwards and forwards through microsecond register states without restarting test executions or losing cache context.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-white/10">
            <div className="flex items-center gap-2.5 mb-2 text-cyan-400">
              <Eye className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-white">Holographic Variable Watches</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Pin complex nested graphs and heap pointers into floating spatial overlays that highlight mutations in real-time.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-white/10">
            <div className="flex items-center gap-2.5 mb-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-white">1-Click Automated Patches</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              CodeForge AI writes the exact atomic fence or mutex lock diff to resolve the anomaly with zero manual guessing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
