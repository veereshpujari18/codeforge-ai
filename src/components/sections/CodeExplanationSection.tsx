import React, { useState } from 'react';
import { BookOpen, Layers, Sparkles, ExternalLink, Info, Code2, ArrowUpRight } from 'lucide-react';

interface CodeLineExplanation {
  line: number;
  text: string;
  summary: string;
  docLink: string;
  spec: string;
}

const EXPLANATION_DATA: CodeLineExplanation[] = [
  {
    line: 1,
    text: "import { RingBuffer } from 'atomic-ring';",
    summary: "Imports a zero-copy lockless ring buffer based on Lamport's sequential consistency algorithm.",
    docLink: "https://docs.codeforge.ai/algorithms/lockless-ring",
    spec: "Memory Ordering: Sequentially Consistent (SC)"
  },
  {
    line: 2,
    text: "const queue = new RingBuffer<Packet>(1024);",
    summary: "Allocates a contiguous aligned memory block of 1024 slots; size is a power-of-two to enable bitwise modulo (& 1023).",
    docLink: "https://docs.codeforge.ai/v8/bitwise-indexing",
    spec: "Memory Footprint: 8.2 KB contiguous slab"
  },
  {
    line: 4,
    text: "export function dispatchPacket(pkt: Packet): boolean {",
    summary: "Non-blocking dispatch function intended for real-time high-frequency telemetry loops.",
    docLink: "https://docs.codeforge.ai/patterns/zero-alloc-dispatch",
    spec: "Target: Zero allocations in hotpath"
  },
  {
    line: 5,
    text: "  return queue.tryPush(pkt);",
    summary: "Atomic compare-and-swap (CAS) without kernel context switching. Returns false if consumer has fallen behind.",
    docLink: "https://docs.codeforge.ai/asm/cas-cmpxchg",
    spec: "Hardware Primitive: CMPXCHG (x86) / LDREX/STREX (ARM)"
  }
];

export const CodeExplanationSection: React.FC = () => {
  const [activeLine, setActiveLine] = useState<number>(2);

  const currentExplanation = EXPLANATION_DATA.find(e => e.line === activeLine) || EXPLANATION_DATA[0];

  return (
    <section id="explain" className="py-24 relative overflow-hidden bg-[#090d24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono mb-3">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            SECTION 04 // DEEP CODE EXPLANATION
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            Line-by-Line Holographic Code Demystification
          </h2>
          <p className="mt-4 text-gray-400 text-base leading-relaxed">
            Hover over any complex line of code to unveil compiler bytecode mechanics, memory layout
            ramifications, and architectural documentation in a floating interactive knowledge overlay.
          </p>
        </div>

        {/* Interactive Code with Floating Docs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Code panel with hoverable lines */}
          <div className="lg:col-span-7 rounded-2xl glass-panel-elevated border border-cyan-500/25 p-5 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyan-500/15">
              <span className="text-cyan-300 font-semibold flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-cyan-400" />
                ring_buffer_dispatch.ts
              </span>
              <span className="text-[10px] text-gray-400">Hover any line to inspect docs</span>
            </div>

            <div className="space-y-1">
              {EXPLANATION_DATA.map((item) => {
                const isActive = activeLine === item.line;
                return (
                  <div
                    key={item.line}
                    onMouseEnter={() => setActiveLine(item.line)}
                    className={`p-2.5 rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                      isActive
                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-white shadow-[0_0_15px_rgba(0,217,255,0.2)]'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span className="text-gray-600 w-5 text-right font-mono select-none">{item.line}</span>
                    <span className="flex-1 font-mono">{item.text}</span>
                    {isActive && (
                      <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-cyan-400 text-black font-semibold">
                        Selected
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-cyan-500/10 flex items-center justify-between text-[11px] text-gray-500">
              <span>TypeScript 5.8 AST Verified</span>
              <span>Memory Model: C++11 Equivalency</span>
            </div>
          </div>

          {/* Floating Documentation Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl glass-panel-elevated border border-indigo-500/30">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span className="font-mono text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                    DEEP DIVE &bull; LINE {currentExplanation.line}
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-indigo-500/15 text-indigo-200 px-2 py-0.5 rounded border border-indigo-500/25">
                  AST EXPLAINED
                </span>
              </div>

              <div className="mt-4">
                <code className="text-xs font-mono text-cyan-300 bg-black/40 px-3 py-1.5 rounded block border border-white/5 mb-3">
                  {currentExplanation.text}
                </code>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {currentExplanation.summary}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 space-y-3 font-mono text-xs">
                <div className="p-2.5 rounded bg-[#13193e] border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400 text-[11px]">Hardware / Spec:</span>
                  <span className="text-emerald-300 text-[11px] font-semibold">{currentExplanation.spec}</span>
                </div>

                <a
                  href="#workspace"
                  className="flex items-center justify-between p-2.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 transition-colors"
                >
                  <span className="flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    Read complete documentation & benchmarks
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
