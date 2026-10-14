import React from 'react';
import { HeroSpaceScene } from '../3d/HeroSpaceScene';
import { Interactive3DIDE } from '../3d/Interactive3DIDE';
import { Terminal, Sparkles, ArrowRight, ShieldCheck, Zap, Layers, Play } from 'lucide-react';

interface HeroSectionProps {
  onOpenWorkspace: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenWorkspace }) => {
  return (
    <section className="relative min-h-screen pt-28 pb-16 flex flex-col justify-center items-center overflow-hidden aurora-bg tech-grid">
      {/* 3D WebGL Spacefield & Floating Wireframes */}
      <HeroSpaceScene />

      {/* Floating Aurora Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#00d9ff]/15 via-[#9d4edd]/20 to-[#ff006e]/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
        {/* Release / Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(0,217,255,0.2)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="font-semibold">ENGINEERING WORKSPACE 4.0</span>
          <span className="text-gray-400">&bull;</span>
          <span className="text-gray-300">Titan-3.8 Architecture</span>
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        </div>

        {/* Headline */}
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Your AI-Powered{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
            Engineering Workspace
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-5 text-xl sm:text-2xl md:text-3xl text-[#a0a0b8] font-light max-w-3xl mx-auto tracking-wide">
          Code faster. Debug smarter. Build better.
        </p>

        {/* Value Prop Description */}
        <p className="mt-4 text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
          The next-generation developer studio blending real-time 3D AST visualization, 
          autonomous multi-agent coding, sub-millisecond RAG project memory, and zero-hallucination JIT compilation.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onOpenWorkspace}
            className="px-8 py-4 rounded-xl font-mono text-sm font-bold text-black bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-300 shadow-[0_0_30px_rgba(0,217,255,0.5)] hover:shadow-[0_0_45px_rgba(0,217,255,0.85)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 group"
          >
            <Terminal className="w-4 h-4 text-black" />
            <span>Start Building Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <a
            href="#codegen"
            className="px-8 py-4 rounded-xl font-mono text-sm font-semibold text-white glass-card hover:bg-white/10 border border-white/20 hover:border-cyan-400/50 transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 text-cyan-400" />
            <span>Explore 3D Demos</span>
          </a>
        </div>

        {/* Metrics Row */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left font-mono">
          <div className="p-3 rounded-xl bg-[#14193b]/50 border border-white/5 backdrop-blur-md">
            <div className="text-2xl font-bold text-cyan-400">99.8%</div>
            <div className="text-xs text-gray-400 mt-0.5">Syntactic Accuracy</div>
          </div>
          <div className="p-3 rounded-xl bg-[#14193b]/50 border border-white/5 backdrop-blur-md">
            <div className="text-2xl font-bold text-purple-400">10x</div>
            <div className="text-xs text-gray-400 mt-0.5">Faster Code Reviews</div>
          </div>
          <div className="p-3 rounded-xl bg-[#14193b]/50 border border-white/5 backdrop-blur-md">
            <div className="text-2xl font-bold text-emerald-400">&lt; 1.8ms</div>
            <div className="text-xs text-gray-400 mt-0.5">AST Context Lookup</div>
          </div>
          <div className="p-3 rounded-xl bg-[#14193b]/50 border border-white/5 backdrop-blur-md">
            <div className="text-2xl font-bold text-pink-400">50+</div>
            <div className="text-xs text-gray-400 mt-0.5">Languages & Runtimes</div>
          </div>
        </div>
      </div>

      {/* 3D Interactive Centerpiece IDE */}
      <div className="relative z-20 w-full mt-10">
        <Interactive3DIDE onOpenFullWorkspace={onOpenWorkspace} />
      </div>
    </section>
  );
};
