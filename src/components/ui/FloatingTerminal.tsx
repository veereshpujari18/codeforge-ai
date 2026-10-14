import React, { useState } from 'react';
import { Terminal as TerminalIcon, X, Minus, Maximize2, Sparkles } from 'lucide-react';

export const FloatingTerminal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    '⚡ CodeForge Micro-Terminal v4.2 [Interactive Easter Egg]',
    'Try typing: "forge version", "bench", "easter-egg", or "help"'
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    const newLogs = [...logs, `$ ${cmd}`];

    if (cmd === 'clear') {
      setLogs(['$ Console cleared.']);
      setInputVal('');
      return;
    } else if (cmd === 'easter-egg') {
      newLogs.push('🚀 3D Matrix hyper-speed unlocked!');
      newLogs.push('👾 You discovered the CodeForge secret kernel.');
      newLogs.push('✨ May your code compile with zero warnings forever.');
    } else if (cmd === 'bench') {
      newLogs.push('⚡ Micro-bench: 1,850,290 ops/sec | 0 byte allocations');
    } else if (cmd === 'forge version') {
      newLogs.push('CodeForge Titan-3.8 Engine [Rust / WebAssembly 2.0]');
    } else if (cmd === 'help') {
      newLogs.push('Commands: easter-egg, bench, forge version, clear, help');
    } else {
      newLogs.push(`Executed: ${cmd}`);
    }

    setLogs(newLogs);
    setInputVal('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#141a3d]/90 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(0,217,255,0.3)] backdrop-blur-xl transition-all hover:scale-110 group"
        title="Open Quick Floating Terminal"
      >
        <TerminalIcon className="w-5 h-5 group-hover:rotate-6 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 sm:w-96 rounded-xl glass-panel-elevated border border-cyan-500/30 overflow-hidden shadow-2xl font-mono text-xs">
      {/* Window Header */}
      <div className="px-3 py-2 bg-[#0e1333] border-b border-cyan-500/20 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5">
          <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-bold text-gray-300">Quick Terminal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-gray-400 hover:text-white"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-400 hover:text-red-400"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Terminal content */}
      {!isMinimized && (
        <div className="p-3 bg-[#050818]/95 space-y-2">
          <div className="h-36 overflow-y-auto space-y-1 text-emerald-400 text-[11px]">
            {logs.map((log, i) => (
              <div key={i} className={log.startsWith('$') ? 'text-yellow-400' : ''}>
                {log}
              </div>
            ))}
          </div>

          <form onSubmit={handleCommand} className="flex items-center gap-1.5 pt-2 border-t border-white/10">
            <span className="text-cyan-400 font-bold">$</span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="type command..."
              className="flex-1 bg-transparent border-none text-[11px] text-white placeholder-gray-600 focus:outline-none"
              autoFocus
            />
          </form>
        </div>
      )}
    </div>
  );
};
