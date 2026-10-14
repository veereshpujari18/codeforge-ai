import React, { useState, useEffect } from 'react';
import { AICoreOrb } from '../3d/AICoreOrb';
import { Sparkles, Terminal, Copy, Check, Play, RefreshCw, Cpu, CheckCircle2, Zap } from 'lucide-react';

interface GenDemo {
  id: string;
  label: string;
  lang: string;
  code: string;
  tokensPerSec: number;
  complexity: string;
}

const GENERATION_DEMOS: GenDemo[] = [
  {
    id: 'raft',
    label: 'Distributed Raft Consensus',
    lang: 'rust',
    tokensPerSec: 184,
    complexity: 'O(log N)',
    code: `pub struct RaftNode<M: MessageStore> {
    state: NodeRole,
    current_term: u64,
    voted_for: Option<NodeId>,
    log: Arc<RaftLog<M>>,
}

impl<M: MessageStore> RaftNode<M> {
    pub async fn handle_append_entries(
        &mut self,
        req: AppendEntriesRequest,
    ) -> Result<AppendEntriesResponse, RaftError> {
        if req.term < self.current_term {
            return Ok(AppendEntriesResponse::Reject { term: self.current_term });
        }
        
        self.step_down_to_follower(req.term);
        self.log.commit_indexed_entries(req.leader_commit).await?;
        Ok(AppendEntriesResponse::Success { match_index: self.log.last_index() })
    }
}`
  },
  {
    id: 'simd',
    label: 'SIMD Vectorized Matrix Math',
    lang: 'typescript',
    tokensPerSec: 210,
    complexity: 'O(N² / 4)',
    code: `export class VectorizedTensor {
  private buffer: Float32Array;

  constructor(public readonly rows: number, public readonly cols: number) {
    this.buffer = new Float32Array(rows * cols);
  }

  // 128-bit SIMD accelerated dot product
  public multiplySIMD(other: VectorizedTensor): VectorizedTensor {
    const result = new VectorizedTensor(this.rows, other.cols);
    // Auto-vectorized loop unrolling by CodeForge compiler
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < other.cols; c += 4) {
        result.accumulateQuad(this, other, r, c);
      }
    }
    return result;
  }
}`
  },
  {
    id: 'stream',
    label: 'Async WebSocket Multiplexer',
    lang: 'go',
    tokensPerSec: 195,
    complexity: 'O(1) Dispatch',
    code: `type StreamHub struct {
    clients    map[*Client]bool
    broadcast  chan []byte
    register   chan *Client
    unregister chan *Client
    mu         sync.RWMutex
}

func (h *StreamHub) RunEventLoop(ctx context.Context) {
    for {
        select {
        case client := <-h.register:
            h.mu.Lock()
            h.clients[client] = true
            h.mu.Unlock()
        case msg := <-h.broadcast:
            h.mu.RLock()
            for client := range h.clients {
                select {
                case client.send <- msg:
                default:
                    close(client.send)
                    delete(h.clients, client)
                }
            }
            h.mu.RUnlock()
        case <-ctx.Done():
            return
        }
    }
}`
  }
];

export const CodeGenerationSection: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<GenDemo>(GENERATION_DEMOS[0]);
  const [displayedCode, setDisplayedCode] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);

  // Stream code effect
  useEffect(() => {
    setIsStreaming(true);
    setDisplayedCode('');
    let idx = 0;
    const target = selectedDemo.code;
    const chunkLength = 6;

    const interval = setInterval(() => {
      idx += chunkLength;
      if (idx >= target.length) {
        setDisplayedCode(target);
        setIsStreaming(false);
        clearInterval(interval);
      } else {
        setDisplayedCode(target.slice(0, idx));
      }
    }, 25);

    return () => clearInterval(interval);
  }, [selectedDemo]);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedDemo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="codegen" className="py-24 relative overflow-hidden bg-[#0c102c]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-3">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            SECTION 01 // SYNTHESIS ENGINE
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            Autonomous Multi-Language Code Generation
          </h2>
          <p className="mt-4 text-gray-400 text-base leading-relaxed">
            From single-line function intents to entire distributed backends, CodeForge synthesizes
            idiomatic, type-safe, and zero-overhead code with real-time streaming compilation.
          </p>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT: 3D Visualization & Streaming Preview */}
          <div className="lg:col-span-7 relative">
            <div className="rounded-2xl glass-panel-elevated border border-cyan-500/30 overflow-hidden shadow-2xl">
              
              {/* Header Toolbar */}
              <div className="px-4 py-3 bg-[#121738] border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {GENERATION_DEMOS.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDemo(d)}
                      className={`text-xs font-mono px-3 py-1 rounded-lg transition-all ${
                        selectedDemo.id === d.id
                          ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,217,255,0.4)]'
                          : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs font-mono text-gray-300 hover:text-cyan-300 bg-white/5 px-2.5 py-1 rounded border border-white/10 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Streaming Code View */}
              <div className="p-4 bg-[#080c24] relative min-h-[340px] font-mono text-xs">
                {/* 3D Orb Watermark in background */}
                <div className="absolute right-4 bottom-4 opacity-35 pointer-events-none">
                  <AICoreOrb size={140} themeColor="cyan" />
                </div>

                <pre className="text-gray-300 leading-relaxed overflow-x-auto relative z-10 select-text">
                  <code>{displayedCode}</code>
                  {isStreaming && (
                    <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1 align-middle" />
                  )}
                </pre>
              </div>

              {/* Real-time stats footer */}
              <div className="px-4 py-2.5 bg-[#101538] border-t border-cyan-500/15 flex flex-wrap items-center justify-between text-xs font-mono text-gray-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {isStreaming ? 'Streaming Tokens...' : 'Generation Complete'}
                  </span>
                  <span>&bull;</span>
                  <span>Throughput: <strong className="text-cyan-300">{selectedDemo.tokensPerSec} tps</strong></span>
                </div>
                <div>
                  Complexity: <strong className="text-purple-300">{selectedDemo.complexity}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Feature Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl glass-card border border-white/10 hover:border-cyan-500/40 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-white">Context-Aware AST Synthesis</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                CodeForge understands your entire codebase topology. It imports exactly the right internal modules,
                respects your ESLint/Clippy conventions, and maintains strict architectural integrity.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-white/10 hover:border-purple-500/40 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-white">50+ Language Runtimes</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Seamless polyglot support across TypeScript, Rust, Go, Python, C++, Java, Kotlin, Swift, and Zig.
                Cross-compile logic between languages with full semantic fidelity.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-white/10 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-white">Zero Hallucination Guarantee</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Every generated snippet passes automated in-memory dry compilation before reaching your editor.
                No phantom package imports or nonexistent method calls.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
