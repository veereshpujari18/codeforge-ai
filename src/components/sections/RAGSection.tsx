import React from 'react';
import { RAGKnowledgeGraph3D } from '../3d/RAGKnowledgeGraph3D';
import { Network, Database, Layers, Sparkles, Cpu } from 'lucide-react';

export const RAGSection: React.FC = () => {
  return (
    <section id="rag" className="py-24 relative overflow-hidden bg-[#090d24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-3">
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            SECTION 06 // PROJECT-SCALE RAG GRAPH
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            Whole-Repository Semantic Intelligence
          </h2>
          <p className="mt-4 text-gray-400 text-base leading-relaxed">
            Never paste code snippets into a disconnected chat box again. CodeForge indexes your entire
            dependency hierarchy, symbol signatures, and type definitions into a high-dimensional vector space.
          </p>
        </div>

        {/* 3D Knowledge Graph Component */}
        <RAGKnowledgeGraph3D />

        {/* Three Value Pillars */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl glass-card border border-white/10">
            <div className="flex items-center gap-2.5 mb-2 text-cyan-400">
              <Database className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-white">Zero-Latency Vector Store</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Embeddings reside in local shared memory via WebAssembly SIMD kernels, guaranteeing &lt;2ms retrieval.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-white/10">
            <div className="flex items-center gap-2.5 mb-2 text-purple-400">
              <Layers className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-white">Cross-Language Call Graphs</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Trace execution paths seamlessly from a React frontend through Go microservices into C++ shared libraries.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-white/10">
            <div className="flex items-center gap-2.5 mb-2 text-emerald-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-white">Incremental Delta Re-indexing</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Only mutated AST nodes are re-embedded on save, consuming negligible battery and CPU resources.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
