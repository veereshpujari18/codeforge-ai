import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderTree, 
  FileCode2, 
  Terminal as TerminalIcon, 
  Sparkles, 
  Play, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  Bot, 
  Send, 
  Maximize2,
  Cpu,
  Layers,
  ShieldCheck,
  Bug
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  language: string;
  code: string;
  badge?: string;
}

const SAMPLE_FILES: FileItem[] = [
  {
    id: 'agent.ts',
    name: 'agent_orchestrator.ts',
    language: 'typescript',
    badge: 'AI Core',
    code: `import { CodeForge, ModelEngine } from '@codeforge/runtime';
import { MemoryGraph, VectorStore } from '@/ai/rag';

export class AutonomousCoderAgent {
  private engine: ModelEngine;
  private graph: MemoryGraph;

  constructor(apiKey: string) {
    this.engine = new ModelEngine({ model: 'forge-titan-3.8', speed: 'ultra' });
    this.graph = new MemoryGraph({ depth: 4 });
  }

  // Synthesize optimized AST with O(1) cache lookups
  async synthesizePipeline(spec: ArchitecturalSpec): Promise<PipelineResult> {
    const context = await this.graph.retrieveSemantics(spec.domain);
    const stream = await this.engine.streamSolution({
      prompt: spec.intent,
      context,
      securityAudit: true,
      optimizations: ['vectorize', 'inlining', 'zero-copy']
    });

    return stream.compileAndVerify();
  }
}`
  },
  {
    id: 'neural_rag.py',
    name: 'neural_rag_index.py',
    language: 'python',
    badge: 'RAG',
    code: `import numpy as np
from codeforge.embeddings import FastEmbed
from codeforge.graph import SemanticProjectIndex

class CodebaseRAGIndex:
    def __init__(self, repo_path: str):
        self.encoder = FastEmbed(dimensions=1536)
        self.index = SemanticProjectIndex(repo_path)
        
    def query_context(self, natural_query: str, top_k: int = 5):
        """Perform cosine similarity lookup over AST vector space"""
        query_vector = self.encoder.embed_query(natural_query)
        matching_chunks = self.index.search(query_vector, k=top_k)
        return [chunk.to_context_payload() for chunk in matching_chunks]
        
    def cross_validate_deps(self, target_symbol: str) -> dict:
        return self.index.resolve_symbol_graph(target_symbol)`
  },
  {
    id: 'compiler.rs',
    name: 'quantum_jit.rs',
    language: 'rust',
    badge: 'Engine',
    code: `use std::sync::Arc;
use codeforge_core::ast::{AstNode, BytecodeStream};

pub struct ZeroCopyCompiler {
    opt_level: u8,
    symbol_table: Arc<dashmap::DashMap<String, usize>>,
}

impl ZeroCopyCompiler {
    #[inline(always)]
    pub fn jit_compile(&self, ast: &AstNode) -> Result<BytecodeStream, CompilerError> {
        // Parallel tree-sitter walk with SIMD vectorization
        let optimized_ir = ast.passes(&[
            dead_code_elimination,
            constant_propagation,
            simd_loop_unroll
        ])?;
        
        Ok(optimized_ir.emit_x86_64())
    }
}`
  }
];

export const Interactive3DIDE: React.FC<{ onOpenFullWorkspace?: () => void }> = ({ onOpenFullWorkspace }) => {
  const [selectedFile, setSelectedFile] = useState<FileItem>(SAMPLE_FILES[0]);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '⚡ CodeForge Core v4.2.0 initialized on WebAssembly worker #0',
    '✓ AST indexing completed in 14.2ms [1,842 symbols resolved]',
    '✓ Neural vector index loaded (1,536-dim embeddings)',
    'Type "forge run" or "help" below...'
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'ai' | 'user'; text: string; action?: string }>>([
    {
      role: 'ai',
      text: 'Hello Engineer! I have pre-indexed your repository with zero-copy AST parsing. What would you like to build or optimize today?'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  // 3D Tilt calculation on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle 3D tilt: max ~5 degrees
    const tiltX = -((y - centerY) / centerY) * 4;
    const tiltY = ((x - centerX) / centerX) * 4;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendChat = (promptOverride?: string) => {
    const query = promptOverride || chatInput.trim();
    if (!query) return;

    setChatMessages(prev => [...prev, { role: 'user', text: query }]);
    setChatInput('');
    setIsAiThinking(true);

    setTimeout(() => {
      let responseText = '';
      if (query.toLowerCase().includes('optimize') || query.toLowerCase().includes('latency')) {
        responseText = '⚡ Analyzed hot path: Replaced heap allocation with SIMD stack buffer. Latency reduced from 14.8ms to 1.1ms (92.5% throughput boost). Code patch ready to apply!';
      } else if (query.toLowerCase().includes('rag') || query.toLowerCase().includes('index')) {
        responseText = '🧠 Vector graph updated: Ingested 18 files, mapped 240 AST relationships, and linked cross-module references. Zero circular imports detected.';
      } else if (query.toLowerCase().includes('security') || query.toLowerCase().includes('bug')) {
        responseText = '🛡️ Security verification passed: Automated taint analysis checked 42 untrusted endpoints. No buffer overflows or SSRF vulnerabilities found.';
      } else {
        responseText = `✓ Synthesized optimal solution for "${query}". Automatically validated syntax against TypeScript 5.8 / Rust 2024 specifications with zero lint warnings.`;
      }

      setChatMessages(prev => [...prev, { role: 'ai', text: responseText }]);
      setIsAiThinking(false);
    }, 900);
  };

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    const newLogs = [...terminalOutput, `$ ${cmd}`];

    if (cmd === 'clear') {
      setTerminalOutput(['$ Ready.']);
      setTerminalInput('');
      return;
    } else if (cmd === 'forge run' || cmd === 'npm test') {
      newLogs.push('⚡ Compiling AST with LLVM backend...');
      newLogs.push('✓ Test Suite [PASSED]: 48/48 units, 12 integration tests');
      newLogs.push('🚀 Bench: 1,420,000 ops/sec | P99: 0.18ms');
    } else if (cmd === 'help') {
      newLogs.push('Available commands: forge run, npm test, ai audit, clear, status');
    } else if (cmd === 'ai audit') {
      newLogs.push('🛡️ Running static taint analysis...');
      newLogs.push('✓ 0 Critical, 0 High, 0 Deprecated dependencies.');
    } else {
      newLogs.push(`Executed: ${cmd} (exit status: 0)`);
    }

    setTerminalOutput(newLogs);
    setTerminalInput('');
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-6xl mx-auto px-2 sm:px-4 py-8 perspective-[1200px]"
    >
      {/* Outer ambient glow halo */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#00d9ff]/25 via-[#9d4edd]/20 to-[#ff006e]/25 blur-2xl opacity-60 pointer-events-none" />

      {/* Main 3D Floating Window */}
      <div 
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.15s ease-out'
        }}
        className="relative rounded-2xl overflow-hidden glass-panel-elevated border border-cyan-500/30 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]"
      >
        {/* Window Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#131835]/90 border-b border-cyan-500/20 select-none">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-400/40" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-400/40" />
            <div className="w-3 h-3 rounded-full bg-green-500/80 border border-green-400/40" />
            <span className="ml-3 text-xs font-mono text-cyan-300 font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              codeforge-workspace &bull; {selectedFile.name}
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              AI Coprocessor: ONLINE
            </span>
            <span className="text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
              Engine: Titan-3.8
            </span>
            {onOpenFullWorkspace && (
              <button
                onClick={onOpenFullWorkspace}
                className="flex items-center gap-1 text-cyan-300 hover:text-white bg-cyan-500/20 hover:bg-cyan-500/30 px-2.5 py-0.5 rounded border border-cyan-500/30 transition-colors"
                title="Open in full screen developer workspace"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Open Full IDE</span>
              </button>
            )}
          </div>
        </div>

        {/* IDE Main Grid: Left Tree, Center Editor, Right AI Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] bg-[#0c102c]/90">
          
          {/* LEFT PANEL: File Explorer */}
          <div className="lg:col-span-3 border-r border-cyan-500/15 p-3 bg-[#0e1333]/70 hidden md:block">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-2 pb-1 border-b border-white/5">
              <span className="flex items-center gap-1 font-semibold text-cyan-300 uppercase tracking-wider">
                <FolderTree className="w-3.5 h-3.5" />
                EXPLORER
              </span>
              <span className="text-[10px] text-gray-500">SRC/CORE</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-gray-400 px-1 py-1">
                <ChevronDown className="w-3 h-3 text-gray-500" />
                <span className="text-gray-300 font-mono text-xs">src</span>
              </div>

              <div className="pl-3 space-y-1">
                {SAMPLE_FILES.map(file => {
                  const isActive = selectedFile.id === file.id;
                  return (
                    <button
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full text-left flex items-center justify-between px-2 py-1.5 rounded text-xs font-mono transition-all ${
                        isActive 
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,217,255,0.15)]'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <FileCode2 className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-gray-500'}`} />
                        <span className="truncate">{file.name}</span>
                      </div>
                      {file.badge && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-sans uppercase ${
                          isActive ? 'bg-cyan-400 text-black font-semibold' : 'bg-white/10 text-gray-400'
                        }`}>
                          {file.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* RAG Context metrics */}
              <div className="mt-6 pt-4 border-t border-cyan-500/10">
                <div className="text-[11px] font-mono text-gray-400 mb-2 font-semibold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  RAG PROJECT CONTEXT
                </div>
                <div className="bg-[#141a3d]/60 rounded-lg p-2.5 border border-purple-500/20 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between text-gray-300">
                    <span>Index Vectors:</span>
                    <span className="text-purple-300 font-bold">14,290</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>AST Depth:</span>
                    <span className="text-cyan-300">12 Levels</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Context Window:</span>
                    <span className="text-emerald-300 font-bold">1M Tokens</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER PANEL: Code Editor */}
          <div className="lg:col-span-5 p-3 flex flex-col justify-between border-r border-cyan-500/15 bg-[#090d26]">
            <div>
              {/* Tab Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/15">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded text-xs font-mono">
                    <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{selectedFile.name}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono text-gray-500 px-2">
                    {selectedFile.language}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-cyan-300 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
                  title="Copy code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="font-mono text-[11px]">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Live Code Container */}
              <div className="font-mono text-xs leading-relaxed text-gray-300 overflow-x-auto max-h-[300px] overflow-y-auto pr-2 select-text">
                <pre className="relative">
                  {selectedFile.code.split('\n').map((line, idx) => (
                    <div key={idx} className="flex hover:bg-cyan-500/5 px-1 py-0.5 rounded transition-colors group">
                      <span className="w-7 select-none text-right pr-3 text-gray-600 font-mono text-[11px] group-hover:text-cyan-400">
                        {idx + 1}
                      </span>
                      <span className="flex-1 whitespace-pre">
                        {/* Simple syntax highlighting visualization */}
                        {line.includes('import') || line.includes('from') || line.includes('pub struct') || line.includes('class') ? (
                          <span className="text-purple-400 font-semibold">{line}</span>
                        ) : line.includes('async') || line.includes('function') || line.includes('def') || line.includes('fn') ? (
                          <span className="text-cyan-300">{line}</span>
                        ) : line.includes('//') || line.includes('#') || line.includes('"""') ? (
                          <span className="text-gray-500 italic">{line}</span>
                        ) : line.includes('return') || line.includes('const') || line.includes('let') || line.includes('impl') ? (
                          <span className="text-pink-400">{line}</span>
                        ) : line.includes('true') || line.includes('false') || line.includes('Result') ? (
                          <span className="text-emerald-300">{line}</span>
                        ) : (
                          <span>{line}</span>
                        )}
                      </span>
                    </div>
                  ))}
                  {/* Blinking Cursor Indicator */}
                  <div className="flex items-center px-1">
                    <span className="w-7 text-right pr-3 text-gray-600 text-[11px] select-none">
                      {selectedFile.code.split('\n').length + 1}
                    </span>
                    <span className="w-2 h-4 bg-cyan-400 animate-pulse inline-block" />
                  </div>
                </pre>
              </div>
            </div>

            {/* Quick action bar */}
            <div className="mt-3 pt-2 border-t border-cyan-500/10 flex items-center justify-between text-[11px] font-mono text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-semibold">UTF-8</span>
                <span>&bull;</span>
                <span>Tab Size: 2</span>
                <span>&bull;</span>
                <span className="text-emerald-400">0 Errors</span>
              </div>
              <button 
                onClick={() => handleSendChat('Optimize this file for high-throughput concurrency')}
                className="flex items-center gap-1.5 text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/25 px-2.5 py-1 rounded border border-cyan-500/20 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Auto-Optimize</span>
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: AI Chat Assistant */}
          <div className="lg:col-span-4 p-3 flex flex-col justify-between bg-[#111638]/70">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/15">
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-cyan-300">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>FORGE-AI COPILOT</span>
                </div>
                <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
                  v3.8 Flash
                </span>
              </div>

              {/* Chat messages */}
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg text-xs font-mono leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-cyan-500/15 text-cyan-100 ml-4 border border-cyan-500/25'
                        : 'bg-[#181f4a] text-gray-200 mr-2 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1">
                      {msg.role === 'ai' ? (
                        <span className="text-cyan-400 font-semibold flex items-center gap-1">
                          <Bot className="w-3 h-3" /> CodeForge AI
                        </span>
                      ) : (
                        <span className="text-purple-300 font-semibold">You</span>
                      )}
                    </div>
                    {msg.text}
                  </div>
                ))}

                {isAiThinking && (
                  <div className="flex items-center gap-2 p-2 rounded bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Generating AST optimization patch...</span>
                  </div>
                )}
              </div>

              {/* Suggestion Chips */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  'Explain AST Pipeline',
                  'Verify Thread Safety',
                  'Generate Unit Tests'
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendChat(s)}
                    className="text-[10px] font-mono text-gray-300 hover:text-cyan-200 bg-white/5 hover:bg-cyan-500/20 px-2 py-1 rounded border border-white/10 hover:border-cyan-500/30 transition-all text-left"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Chat Input */}
            <div className="mt-3 pt-2 border-t border-cyan-500/15">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Forge AI or command code gen..."
                  className="flex-1 bg-[#090d26] border border-cyan-500/20 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  disabled={isAiThinking}
                  className="p-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* BOTTOM PANEL: Interactive Terminal */}
        <div className="border-t border-cyan-500/20 bg-[#070b20] p-3 font-mono">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-emerald-400 text-xs">INTEGRATED TERMINAL (zsh &bull; codeforge-runtime)</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <span>Port: 3000</span>
              <span>&bull;</span>
              <span>PID: 8492</span>
            </div>
          </div>

          <div className="bg-[#040714] rounded-lg p-2.5 border border-cyan-500/10 text-xs max-h-24 overflow-y-auto space-y-1">
            {terminalOutput.map((log, index) => (
              <div 
                key={index} 
                className={`${
                  log.startsWith('✓') || log.includes('PASSED') 
                    ? 'text-emerald-400' 
                    : log.startsWith('⚡') || log.startsWith('🚀')
                    ? 'text-cyan-300'
                    : log.startsWith('$')
                    ? 'text-yellow-400 font-bold'
                    : 'text-gray-400'
                }`}
              >
                {log}
              </div>
            ))}
          </div>

          <form onSubmit={handleRunCommand} className="mt-2 flex items-center gap-2">
            <span className="text-cyan-400 text-xs font-bold">$</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              placeholder="Try 'forge run', 'npm test', 'ai audit', or 'help'..."
              className="flex-1 bg-transparent border-none text-xs text-emerald-300 placeholder-gray-600 focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="text-[10px] text-gray-400 hover:text-cyan-300 px-2 py-0.5 rounded bg-white/5 border border-white/10"
            >
              Execute
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
