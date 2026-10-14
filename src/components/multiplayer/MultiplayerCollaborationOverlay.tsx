import React, { useState } from 'react';
import { Users, MousePointer, ShieldCheck, AlertCircle, MessageSquare } from 'lucide-react';

interface PeerEngineer {
  id: string;
  name: string;
  role: string;
  file: string;
  line: number;
  color: string;
  cursorX: number;
  cursorY: number;
  message?: string;
}

const PEERS: PeerEngineer[] = [
  {
    id: 'elena',
    name: 'Elena Rostova',
    role: 'Staff Systems Eng',
    file: 'cache_engine.rs',
    line: 42,
    color: '#00d9ff',
    cursorX: 25,
    cursorY: 45,
    message: 'Validating lockless CAS ordering with TSan...'
  },
  {
    id: 'marcus',
    name: 'Marcus Chen',
    role: 'Security Architect',
    file: 'auth_jwt.go',
    line: 18,
    color: '#9d4edd',
    cursorX: 68,
    cursorY: 60,
    message: 'Ed25519 signature verified!'
  },
  {
    id: 'swarm',
    name: 'Forge Swarm Sub-Agent #4',
    role: 'Autonomous QA Fuzzer',
    file: 'neural_rag.py',
    line: 91,
    color: '#06ffa5',
    cursorX: 82,
    cursorY: 30,
    message: 'Generated 2,400 randomized fuzz test vectors.'
  }
];

export const MultiplayerCollaborationOverlay: React.FC = () => {
  const [activePeerId, setActivePeerId] = useState<string | null>(null);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl glass-panel-elevated border border-emerald-500/25 p-4 shadow-xl font-mono text-xs my-4">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-emerald-500/20 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-white text-sm">
            Live Multiplayer Collaborative Swarm (3 Engineers Active)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            CRDT WebSocket Synced
          </span>
        </div>
      </div>

      {/* Peer Developer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        {PEERS.map((peer) => {
          const isSelected = activePeerId === peer.id;
          return (
            <div
              key={peer.id}
              onClick={() => setActivePeerId(isSelected ? null : peer.id)}
              className={`p-3 rounded-xl cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_15px_rgba(6,255,165,0.3)]'
                  : 'bg-black/30 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: peer.color }}
                  />
                  <span className="font-bold text-white text-xs">{peer.name}</span>
                </div>
                <MousePointer className="w-3.5 h-3.5 text-gray-400" />
              </div>

              <div className="text-[11px] text-gray-400 mb-1">{peer.role}</div>

              <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 bg-black/40 px-2 py-1 rounded">
                <span>{peer.file}:{peer.line}</span>
                <span className="text-gray-500">Watching</span>
              </div>

              {peer.message && (
                <div className="mt-2 text-[10px] text-gray-300 bg-white/5 p-1.5 rounded flex items-center gap-1.5 border border-white/5">
                  <MessageSquare className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{peer.message}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
