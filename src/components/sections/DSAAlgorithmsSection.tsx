import React from 'react';
import { DSAVisualizer3D } from '../3d/DSAVisualizer3D';
import { BarChart3, Binary, Cpu, Sliders, CheckCircle2 } from 'lucide-react';

export const DSAAlgorithmsSection: React.FC = () => {
  return (
    <section id="dsa" className="py-24 relative overflow-hidden bg-[#0c102c]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-3">
            <Binary className="w-3.5 h-3.5 text-emerald-400" />
            SECTION 07 // DSA & ALGORITHMS LAB
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            Interactive 3D Algorithm Synthesizer
          </h2>
          <p className="mt-4 text-gray-400 text-base leading-relaxed">
            Master and optimize mission-critical algorithms in interactive 3D space.
            Inspect partitioning pivots, pointer swaps, and asymptotic complexity boundaries in real time.
          </p>
        </div>

        {/* 3D Visualizer & Interactive Playground */}
        <DSAVisualizer3D />
      </div>
    </section>
  );
};
