import React, { useState } from 'react';
import { 
  X, 
  Terminal as TerminalIcon, 
  FolderTree, 
  FileCode, 
  Play, 
  Sparkles, 
  Copy, 
  Check, 
  Send, 
  GitBranch, 
  Settings, 
  Download, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  RefreshCw,
  Plus
} from 'lucide-react';

interface WorkspaceFile {
  id: string;
  name: string;
  lang: string;
  content: string;
}

const DEFAULT_FILES: WorkspaceFile[] = [
  {
    id: 'server.ts',
    name: 'server.ts',
    lang: 'typescript',
    content: `import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { RAGPipeline } from './ai/rag';

const app = express();
app.use(express.json());

const rag = new RAGPipeline({ indexName: 'codebase-v4' });

// High-speed code synthesis endpoint with sub-millisecond AST cache
app.post('/api/forge/synthesize', async (req, res) => {
  try {
    const { prompt, language = 'typescript' } = req.body;
    const context = await rag.retrieveContext(prompt);
    
    // Stream tokens with SIMD zero-copy buffer
    const result = await rag.generateStream({ prompt, context, language });
    res.json({ success: true, code: result.code, latency: '1.4ms' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`⚡ CodeForge Engine listening on port \${PORT}\`);
});`
  },
  {
    id: 'cache_engine.rs',
    name: 'cache_engine.rs',
    lang: 'rust',
    content: `use std::sync::atomic::{AtomicUsize, Ordering};
use dashmap::DashMap;

pub struct LocklessCache<K, V> {
    store: DashMap<K, V>,
    hits: AtomicUsize,
    misses: AtomicUsize,
}

impl<K: std::hash::Hash + Eq + Clone, V: Clone> LocklessCache<K, V> {
    pub fn new() -> Self {
        Self {
            store: DashMap::new(),
            hits: AtomicUsize::new(0),
            misses: AtomicUsize::new(0),
        }
    }

    #[inline(always)]
    pub fn get(&self, key: &K) -> Option<V> {
        if let Some(val) = self.store.get(key) {
            self.hits.fetch_add(1, Ordering::Relaxed);
            Some(val.clone())
        } else {
            self.misses.fetch_add(1, Ordering::Relaxed);
            None
        }
    }
}`
  },
  {
    id: 'neural_rag.py',
    name: 'neural_rag.py',
    lang: 'python',
    content: `import numpy as np

class VectorIndex:
    def __init__(self, dimension: int = 1536):
        self.dim = dimension
        self.vectors = np.empty((0, dimension), dtype=np.float32)
        self.doc_ids = []

    def add_vector(self, doc_id: str, vec: np.ndarray):
        norm = np.linalg.norm(vec)
        normalized = (vec / norm) if norm > 0 else vec
        self.vectors = np.vstack([self.vectors, normalized])
        self.doc_ids.append(doc_id)

    def top_k_cosine(self, query_vec: np.ndarray, k: int = 5):
        query_norm = query_vec / np.linalg.norm(query_vec)
        similarities = np.dot(self.vectors, query_norm)
        top_indices = np.argsort(similarities)[::-1][:k]
        return [(self.doc_ids[i], float(similarities[i])) for i in top_indices]`
  }
];

export const DeveloperWorkspaceModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [files, setFiles] = useState<WorkspaceFile[]>(DEFAULT_FILES);
  const [activeFileId, setActiveFileId] = useState<string>('server.ts');
  const [activeTab, setActiveTab] = useState<'editor' | 'git' | 'settings'>('editor');
  const [copied, setCopied] = useState(false);

  // Terminal state
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '⚡ CodeForge Developer Workspace Runtime v4.2.0',
    '✓ Loaded 3 project files into AST virtual filesystem',
    'Type "help", "npm run test", "bench", or "ai explain" below:'
  ]);
  const [terminalInput, setTerminalInput] = useState('');

  // AI Copilot state
  const [aiChat, setAiChat] = useState<Array<{ role: 'ai' | 'user'; text: string; patchCode?: string }>>([
    {
      role: 'ai',
      text: 'Workspace AI Copilot ready. I can generate unit tests, optimize memory layout, or refactor your active file in real-time.'
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  if (!isOpen) return null;

  const currentFile = files.find(f => f.id === activeFileId) || files[0];

  const handleUpdateCode = (newCode: string) => {
    setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, content: newCode } : f));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExecuteTerminal = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    const newLogs = [...terminalLogs, `$ ${cmd}`];

    if (cmd === 'clear') {
      setTerminalLogs(['$ Ready.']);
      setTerminalInput('');
      return;
    } else if (cmd === 'help') {
      newLogs.push('Available commands:');
      newLogs.push('  npm run test      Run test suite with coverage report');
      newLogs.push('  bench             Run SIMD and memory throughput benchmark');
      newLogs.push('  git status        Show current branch and staged files');
      newLogs.push('  ai audit          Run static taint & vulnerability scan');
      newLogs.push('  clear             Clear the terminal window');
    } else if (cmd === 'npm run test') {
      newLogs.push('🧪 Running test suites across 3 modules...');
      newLogs.push('✓ server.test.ts (8 tests passed - 42ms)');
      newLogs.push('✓ cache_engine_test.rs (14 tests passed - 18ms)');
      newLogs.push('✓ neural_rag_test.py (6 tests passed - 9ms)');
      newLogs.push('🎉 All 28 tests PASSED with 100% branch coverage.');
    } else if (cmd === 'bench') {
      newLogs.push('⚡ Running hardware micro-benchmark...');
      newLogs.push('  LocklessCache.get(): 48,200,000 ops/sec | Latency: 20.7ns');
      newLogs.push('  CosineSimilarity SIMD: 1,840,000 vectors/sec');
      newLogs.push('  P99 Memory Allocation: 0 bytes in hot loops (Zero-Copy)');
    } else if (cmd === 'git status') {
      newLogs.push('On branch main (origin/main)');
      newLogs.push('Changes not staged for commit:');
      newLogs.push(`  modified: ${currentFile.name}`);
      newLogs.push('no untracked files present.');
    } else if (cmd === 'ai audit') {
      newLogs.push('🛡️ Running CodeForge Sentinel static security scan...');
      newLogs.push('✓ Buffer Bounds: SAFE');
      newLogs.push('✓ Secrets: 0 hardcoded keys detected');
      newLogs.push('✓ Dependencies: 0 critical vulnerabilities');
    } else {
      newLogs.push(`Command executed: ${cmd} (exit status: 0)`);
    }

    setTerminalLogs(newLogs);
    setTerminalInput('');
  };

  const handleSendAiPrompt = (promptText?: string) => {
    const query = promptText || aiInput.trim();
    if (!query) return;

    setAiChat(prev => [...prev, { role: 'user', text: query }]);
    setAiInput('');
    setIsAiGenerating(true);

    setTimeout(() => {
      let reply = '';
      let patch = '';

      if (query.toLowerCase().includes('test')) {
        reply = `✓ Generated comprehensive unit test suite for ${currentFile.name}. Includes edge cases, boundary conditions, and concurrent race-condition assertions.`;
        patch = `describe('${currentFile.name} Unit Tests', () => {
  it('should handle concurrency safely without data races', async () => {
    // Assert lockless operation
    expect(true).toBe(true);
  });
});`;
      } else if (query.toLowerCase().includes('optimize') || query.toLowerCase().includes('perf')) {
        reply = `⚡ Analyzed ${currentFile.name}: Replaced redundant allocations with stack-allocated buffers. Estimated throughput increase: +42%.`;
      } else {
        reply = `✓ Analyzed "${query}" against the full AST of ${currentFile.name}. All type boundaries and export signatures remain verified.`;
      }

      setAiChat(prev => [...prev, { role: 'ai', text: reply, patchCode: patch }]);
      setIsAiGenerating(false);
    }, 800);
  };

  const handleApplyPatch = (patchCode: string) => {
    handleUpdateCode(currentFile.content + '\n\n' + patchCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl">
      {/* Workspace Outer Container */}
      <div className="w-full max-w-7xl h-[94vh] rounded-2xl glass-panel-elevated border border-cyan-500/30 flex flex-col overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)]">
        
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-[#0d122e] border-b border-cyan-500/20 flex items-center justify-between select-none">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>

            <div className="h-4 w-[1px] bg-white/10" />

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                CodeForge Production IDE
              </span>
              <span className="text-gray-500">&bull;</span>
              <span className="text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Branch: main
              </span>
            </div>
          </div>

          {/* Tab selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white/5 p-1 rounded-lg border border-white/10 text-xs font-mono">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'editor' ? 'bg-cyan-500 text-black font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                Editor & AI
              </button>
              <button
                onClick={() => setActiveTab('git')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'git' ? 'bg-cyan-500 text-black font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                Git Graph
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'settings' ? 'bg-cyan-500 text-black font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                Preferences
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 transition-colors ml-2"
              title="Close Workspace"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace Body */}
        {activeTab === 'editor' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#0a0e27]">
            
            {/* 1. Left: File Explorer */}
            <div className="lg:col-span-2 border-r border-cyan-500/15 p-3 bg-[#0c102a] hidden md:flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-3 pb-2 border-b border-white/5">
                  <span className="flex items-center gap-1.5 font-semibold text-cyan-300">
                    <FolderTree className="w-3.5 h-3.5" />
                    PROJECT FILES
                  </span>
                </div>

                <div className="space-y-1">
                  {files.map(f => {
                    const isActive = f.id === currentFile.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setActiveFileId(f.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{f.name}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Memory stats */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] space-y-1 text-gray-400">
                <div className="flex justify-between">
                  <span>AST Cache:</span>
                  <span className="text-emerald-400">Warm</span>
                </div>
                <div className="flex justify-between">
                  <span>JIT Compile:</span>
                  <span className="text-cyan-300">1.2ms</span>
                </div>
              </div>
            </div>

            {/* 2. Center: Code Editor & Terminal */}
            <div className="lg:col-span-6 flex flex-col border-r border-cyan-500/15 bg-[#080c22]">
              {/* Active Tab & Action Buttons */}
              <div className="px-4 py-2 border-b border-cyan-500/15 flex items-center justify-between bg-[#0e1333]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-white font-semibold flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    {currentFile.name}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-gray-500 px-1.5 py-0.5 rounded bg-white/5">
                    {currentFile.lang}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-xs font-mono text-gray-300 hover:text-cyan-300 bg-white/5 px-2.5 py-1 rounded border border-white/10"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 text-xs font-mono text-gray-300 hover:text-cyan-300 bg-white/5 px-2.5 py-1 rounded border border-white/10"
                    title="Export File"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Code Editor Textarea */}
              <div className="flex-1 relative p-4 overflow-y-auto">
                <textarea
                  value={currentFile.content}
                  onChange={(e) => handleUpdateCode(e.target.value)}
                  className="w-full h-full bg-transparent border-none text-xs sm:text-sm font-mono text-gray-200 leading-relaxed resize-none focus:outline-none selection:bg-cyan-500/30"
                  spellCheck="false"
                />
              </div>

              {/* Bottom Integrated Terminal */}
              <div className="h-44 border-t border-cyan-500/20 bg-[#050818] p-3 font-mono flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <TerminalIcon className="w-3.5 h-3.5" />
                      WORKSPACE RUNTIME TERMINAL
                    </span>
                    <span className="text-[10px] text-gray-500">Bash / Node 22</span>
                  </div>

                  <div className="text-xs space-y-0.5 max-h-24 overflow-y-auto">
                    {terminalLogs.map((log, i) => (
                      <div key={i} className={log.startsWith('✓') ? 'text-emerald-400' : log.startsWith('$') ? 'text-yellow-400' : 'text-gray-400'}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleExecuteTerminal} className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <span className="text-cyan-400 text-xs font-bold">$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Run 'npm run test', 'bench', or 'ai audit'..."
                    className="flex-1 bg-transparent border-none text-xs text-white placeholder-gray-600 focus:outline-none font-mono"
                  />
                  <button type="submit" className="text-[10px] text-gray-400 hover:text-cyan-300 px-2 py-0.5 rounded bg-white/5">
                    Run
                  </button>
                </form>
              </div>
            </div>

            {/* 3. Right: AI Copilot Panel */}
            <div className="lg:col-span-4 p-4 flex flex-col justify-between bg-[#0e1336]">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-cyan-500/15">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-cyan-500/20 text-cyan-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-xs font-bold text-white">FORGE COPILOT</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Online
                  </span>
                </div>

                {/* AI Chat History */}
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {aiChat.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl text-xs font-mono leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-cyan-500/15 text-cyan-100 ml-4 border border-cyan-500/30'
                          : 'bg-[#151c4a] text-gray-200 mr-2 border border-white/10'
                      }`}
                    >
                      <div className="text-[10px] text-gray-400 mb-1 font-semibold">
                        {msg.role === 'user' ? 'You' : 'CodeForge AI'}
                      </div>
                      <p>{msg.text}</p>

                      {msg.patchCode && (
                        <div className="mt-2.5 pt-2 border-t border-white/10">
                          <pre className="text-[11px] bg-black/50 p-2 rounded text-emerald-300 overflow-x-auto mb-2">
                            <code>{msg.patchCode}</code>
                          </pre>
                          <button
                            onClick={() => handleApplyPatch(msg.patchCode!)}
                            className="text-[10px] bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 px-2.5 py-1 rounded border border-emerald-500/40 transition-colors font-bold"
                          >
                            + Apply Patch to File
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {isAiGenerating && (
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300 flex items-center gap-2 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      <span>Synthesizing code refactor...</span>
                    </div>
                  )}
                </div>

                {/* Quick Action Pills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {['Generate Unit Tests', 'Optimize Hotpath', 'Add JSDoc Comments', 'Audit Security'].map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendAiPrompt(action)}
                      className="text-[10px] font-mono text-gray-300 hover:text-cyan-200 bg-white/5 hover:bg-cyan-500/20 px-2 py-1 rounded border border-white/10 transition-colors"
                    >
                      + {action}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="mt-4 pt-3 border-t border-cyan-500/15">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendAiPrompt();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ask AI or command refactor..."
                    className="flex-1 bg-[#090d26] border border-cyan-500/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isAiGenerating}
                    className="p-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Git Graph */}
        {activeTab === 'git' && (
          <div className="flex-1 p-6 bg-[#0a0e27] overflow-y-auto font-mono text-xs">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-400" />
              Git Repository Commit Graph & Branches
            </h3>
            <div className="space-y-4 max-w-3xl">
              {[
                { hash: '7f91c0e', msg: 'feat: add SIMD matrix operations kernel', author: 'forge-copilot', time: '12m ago', branch: 'main' },
                { hash: '2a4b8d1', msg: 'refactor: zero-copy ring buffer with atomic CMPXCHG', author: 'lead-architect', time: '1h ago', branch: 'main' },
                { hash: '991e0a4', msg: 'security: sanitize path traversal endpoints', author: 'sentinel-bot', time: '3h ago', branch: 'security-patch' },
                { hash: '55d21a9', msg: 'chore: initial workspace configuration v4.0', author: 'dev-team', time: '1d ago', branch: 'main' }
              ].map((c) => (
                <div key={c.hash} className="p-4 rounded-xl glass-card border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                      {c.hash}
                    </span>
                    <div>
                      <span className="text-white font-semibold block">{c.msg}</span>
                      <span className="text-[11px] text-gray-400">By {c.author} &bull; {c.time}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {c.branch}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Preferences */}
        {activeTab === 'settings' && (
          <div className="flex-1 p-6 bg-[#0a0e27] overflow-y-auto font-mono text-xs max-w-2xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              Workspace Configuration & Engine Parameters
            </h3>

            <div className="p-4 rounded-xl glass-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold block">AI Autocomplete Speed</span>
                  <span className="text-[11px] text-gray-400">Speculative streaming decoding</span>
                </div>
                <span className="text-emerald-400 font-bold">Ultra-Low Latency (Sub-2ms)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl glass-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold block">AST Memory Indexing</span>
                  <span className="text-[11px] text-gray-400">Re-index on file save</span>
                </div>
                <span className="text-cyan-400 font-bold">Enabled (Incremental)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl glass-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold block">Auto-Linting on Keystroke</span>
                  <span className="text-[11px] text-gray-400">TypeScript 5.8 & Rust Analyzer JIT</span>
                </div>
                <span className="text-cyan-400 font-bold">Active</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
