import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Layers, Eye, Cpu, Compass, Sparkles } from 'lucide-react';

interface ZoomLevel {
  level: number;
  title: string;
  scope: string;
  representation: string;
  content: string;
}

const ZOOM_LEVELS: ZoomLevel[] = [
  {
    level: 1,
    title: 'Ecosystem Galaxy',
    scope: 'Enterprise Project Hierarchy (180,000 LOC)',
    representation: 'Orbital cluster of 4 microservices, 2 WebAssembly SIMD modules, and distributed cache.',
    content: `// Galaxy View: Multi-Repo Topology
┌─ [api-gateway.rust] ─────┬─ [vector-rag.python]
│ (Port 8080 - 12 Cores)   │ (HNSW 1536-D Graph)
└─ [ui-studio.react] ──────┴─ [simd-engine.wasm]`
  },
  {
    level: 2,
    title: 'Module Constellation',
    scope: 'Package & Cross-Module Dependency Graph',
    representation: 'DAG (Directed Acyclic Graph) showing import paths, circular dependency guards, and cache boundaries.',
    content: `@codeforge/runtime ──> @codeforge/ast-parser ──> @codeforge/simd
       │
       └──> @codeforge/memory-pool ──> jemallocator`
  },
  {
    level: 3,
    title: 'File Territory',
    scope: 'server_pipeline.ts (File Level)',
    representation: 'Exported symbol map, public interfaces, and class hierarchy with lexical scoping.',
    content: `export class PipelineOrchestrator {
  private memoryArena: MemoryArena;
  public async executePass(ast: ASTNode): Promise<BinaryOutput>;
  private inlineDeadCodePass(node: ASTNode): boolean;
}`
  },
  {
    level: 4,
    title: 'Function City',
    scope: 'executePass() (Function AST)',
    representation: '3D cyclomatic complexity blocks with loop spirals and conditional branching forks.',
    content: `function executePass(ast) {
  // Cyclomatic Complexity: 8 | Volume: 4.5 x 6.0
  const buffer = allocateSimdBuffer();
  for (const node of ast.walk()) {
    if (node.isVectorizable) vectorPass(node);
  }
}`
  },
  {
    level: 5,
    title: 'Statement Grid',
    scope: 'Single Line Statement Execution',
    representation: 'Micro-instruction pipeline, register allocation, and local stack slot assignment.',
    content: `const buffer = allocateSimdBuffer(ast.length * 4);
// Slot: [RBP - 0x18] | Type: Float32Array | Alignment: 32-byte AVX2`
  },
  {
    level: 6,
    title: 'Bytecode Vault',
    scope: 'V8 Virtual Machine Bytecode',
    representation: 'Stack-machine bytecode disassembly with accumulator register bindings.',
    content: `LdaNamedProperty a0, [0]       ; Load 'allocateSimdBuffer'
Star0                          ; Store in register r0
LdaNamedProperty a1, [1]       ; Load 'ast.length'
MulSmi [4]                     ; Multiply by 4
Star1                          ; Argument 1
CallProperty1 r0, a0, r1       ; Invoke constructor`
  },
  {
    level: 7,
    title: 'Silicon Assembly',
    scope: 'x86_64 / ARM64 Machine Code',
    representation: 'Raw hardware instruction registers, L1 cache hits, and superscalar ALU pipelines.',
    content: `vmovups ymm0, [rdi + 0x20]     ; AVX2 256-bit vector load
vmulps  ymm0, ymm0, ymm1       ; Single-cycle SIMD multiply
vmovups [rsi + 0x20], ymm0     ; Zero-copy streaming store
ret`
  }
];

export const InfiniteZoomSection: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState(4);

  const zoomInfo = ZOOM_LEVELS.find(z => z.level === currentLevel) || ZOOM_LEVELS[3];

  return (
    <section className="py-24 relative overflow-hidden bg-[#0c102c]/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-3">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            FEATURE 14 // 7-TIER INFINITE ZOOM LOD
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            Infinite Zoom: From Galaxy to Silicon
          </h2>
          <p className="mt-4 text-gray-400 text-base leading-relaxed">
            Glide seamlessly across 7 orders of magnitude: zoom from multi-repo enterprise cloud architecture
            all the way down to single-cycle machine assembly instructions.
          </p>
        </div>

        {/* Zoom Controller & Visualizer */}
        <div className="rounded-2xl glass-panel-elevated border border-cyan-500/30 p-6 shadow-2xl font-mono">
          {/* Level Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-6 border-b border-cyan-500/20">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {ZOOM_LEVELS.map((z) => (
                <button
                  key={z.level}
                  onClick={() => setCurrentLevel(z.level)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 shrink-0 ${
                    currentLevel === z.level
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold shadow-[0_0_15px_rgba(0,217,255,0.4)]'
                      : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  <span>LOD {z.level}:</span>
                  <span>{z.title}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentLevel(Math.max(1, currentLevel - 1))}
                disabled={currentLevel === 1}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 disabled:opacity-40"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentLevel(Math.min(7, currentLevel + 1))}
                disabled={currentLevel === 7}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 disabled:opacity-40"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Level Details & Disassembly Code */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-6">
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider block">
                ZOOM LEVEL {zoomInfo.level} OF 7 &bull; {zoomInfo.title}
              </span>
              <h3 className="font-display font-bold text-2xl text-white font-sans">{zoomInfo.scope}</h3>
              <p className="text-sm text-gray-300 leading-relaxed font-sans">
                {zoomInfo.representation}
              </p>
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200">
                💡 Level of Detail (LOD) maintains full contextual memory, preserving symbol backlinks at every tier.
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="p-4 rounded-xl bg-[#06091e] border border-cyan-500/20 shadow-inner">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] text-gray-400">
                  <span>DISASSEMBLY & TOPOLOGY VIEW</span>
                  <span className="text-emerald-400">Resolution: 100% Native</span>
                </div>
                <pre className="text-xs text-gray-200 overflow-x-auto leading-relaxed select-text font-mono">
                  <code>{zoomInfo.content}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
