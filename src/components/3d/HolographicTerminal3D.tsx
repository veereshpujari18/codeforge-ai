import React, { useState } from 'react';
import { Terminal, Mic, MicOff, Hand, Sparkles, Send, Play, Copy, Check, Volume2 } from 'lucide-react';
import { soundFx } from '../../utils/audioSonification';

const VOICE_PRESETS = [
  'Explain this function',
  'Find performance issues',
  'Generate test cases',
  'Deploy to staging',
  'Run benchmark'
];

export const HolographicTerminal3D: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([
    '⚡ Holographic 3D Terminal v5.0 (Quantum Spatial Interface)',
    '✓ Audio Sonification Engine: READY',
    '✓ Voice Command Listener: ARMED',
    'Speak or type a command below:'
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({ x: -(y / rect.height) * 8, y: (x / rect.width) * 8 });
  };

  const handleExecute = (cmdText?: string) => {
    const cmd = (cmdText || inputVal).trim();
    if (!cmd) return;

    soundFx.playCommandChirp();
    const newLogs = [...logs, `$ ${cmd}`];

    if (cmd.toLowerCase().includes('explain')) {
      newLogs.push('🧠 AST Demystification: Analyzed 48 nodes. Time complexity O(N), Space O(1).');
    } else if (cmd.toLowerCase().includes('perf') || cmd.toLowerCase().includes('issues')) {
      newLogs.push('⚡ Performance scan: 0 memory leaks, 1 hotpath unrolling opportunity detected.');
    } else if (cmd.toLowerCase().includes('test')) {
      newLogs.push('🧪 Property-based test matrix synthesized: 14/14 tests generated and passed.');
    } else if (cmd.toLowerCase().includes('deploy')) {
      newLogs.push('🚀 Multi-agent swarm canary deployed to production edge network in 420ms.');
    } else if (cmd.toLowerCase().includes('bench')) {
      newLogs.push('📊 SIMD Hardware Benchmark: 1,840,000 ops/sec | 0 byte allocations.');
    } else if (cmd === 'clear') {
      setLogs(['$ Holographic projection reset.']);
      setInputVal('');
      return;
    } else {
      newLogs.push(`Holographic executor executed: "${cmd}"`);
    }

    setLogs(newLogs);
    setInputVal('');
  };

  const handleSimulateVoice = (preset: string) => {
    setIsListening(true);
    setInputVal(`"Voice: ${preset}"`);
    soundFx.playSonarPing();
    setTimeout(() => {
      setIsListening(false);
      handleExecute(preset);
    }, 700);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="w-full rounded-2xl glass-panel-elevated border border-cyan-500/30 p-6 overflow-hidden shadow-2xl font-mono perspective-[1000px]"
    >
      <div
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.15s ease-out'
        }}
        className="space-y-4"
      >
        {/* Terminal Header */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-cyan-500/20 gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-bold text-lg text-white">Holographic 3D Projection Terminal</h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Spatial Gesture / Voice Active
            </span>
          </div>
        </div>

        {/* Voice Command Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <Mic className="w-3.5 h-3.5 text-pink-400" />
            Voice Triggers:
          </span>
          {VOICE_PRESETS.map((v) => (
            <button
              key={v}
              onClick={() => handleSimulateVoice(v)}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-pink-500/20 text-gray-300 hover:text-pink-200 border border-white/10 hover:border-pink-500/30 transition-all flex items-center gap-1"
            >
              <span>"{v}"</span>
            </button>
          ))}
        </div>

        {/* Holographic Output Console */}
        <div className="p-4 rounded-xl bg-[#040718] border border-cyan-500/20 max-h-56 overflow-y-auto space-y-1.5 text-xs">
          {logs.map((log, i) => (
            <div
              key={i}
              className={`${
                log.startsWith('✓') || log.includes('passed')
                  ? 'text-emerald-400'
                  : log.startsWith('⚡') || log.startsWith('🚀')
                  ? 'text-cyan-300'
                  : log.startsWith('$')
                  ? 'text-yellow-400 font-bold'
                  : 'text-gray-300'
              }`}
            >
              {log}
            </div>
          ))}
          {isListening && (
            <div className="text-pink-400 animate-pulse flex items-center gap-2">
              <Mic className="w-4 h-4 animate-spin" />
              <span>Transcribing speech stream via WebXR audio...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecute();
          }}
          className="flex items-center gap-2 pt-2 border-t border-cyan-500/15"
        >
          <span className="text-emerald-400 font-bold">$</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type command or speak..."
            className="flex-1 bg-transparent border-none text-xs text-white placeholder-gray-600 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Emit</span>
          </button>
        </form>
      </div>
    </div>
  );
};
