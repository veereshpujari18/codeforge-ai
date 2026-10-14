import React, { useState, useEffect } from 'react';
import { Search, Terminal, Bug, GitCompare, Shield, Network, Binary, Bot, Zap, ArrowRight, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchWorkspace: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onLaunchWorkspace,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose(); else {
          // Trigger open via custom event or parent
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { label: 'Launch Developer Workspace IDE', category: 'Action', icon: Terminal, action: () => { onClose(); onLaunchWorkspace(); } },
    { label: 'AI Code Generation Studio', category: 'Navigation', icon: Zap, href: '#codegen' },
    { label: '3D Call Stack Debugger', category: 'Navigation', icon: Bug, href: '#debugger' },
    { label: 'Intelligent Code Review & Diff', category: 'Navigation', icon: GitCompare, href: '#review' },
    { label: 'Holographic Code Explanation', category: 'Navigation', icon: Terminal, href: '#explain' },
    { label: 'Zero-Trust Security Matrix', category: 'Navigation', icon: Shield, href: '#security' },
    { label: 'Project RAG Knowledge Graph', category: 'Navigation', icon: Network, href: '#rag' },
    { label: '3D DSA & Algorithms Playground', category: 'Navigation', icon: Binary, href: '#dsa' },
    { label: 'Multi-Agent Autonomous Swarm', category: 'Navigation', icon: Bot, href: '#agents' },
    { label: 'View Pricing & Enterprise Plans', category: 'Navigation', icon: Zap, href: '#pricing' },
  ];

  const filtered = actions.filter(a =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-2xl glass-panel-elevated border border-cyan-500/30 overflow-hidden shadow-2xl font-mono text-xs">
        {/* Search header */}
        <div className="p-3 bg-[#0d122e] border-b border-cyan-500/20 flex items-center gap-2.5">
          <Search className="w-4 h-4 text-cyan-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, sections, or actions (e.g. debugger, workspace, rag)..."
            className="flex-1 bg-transparent border-none text-white placeholder-gray-500 text-xs focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else if (item.href) {
                      onClose();
                      window.location.hash = item.href;
                    }
                  }}
                  className="p-2.5 rounded-lg hover:bg-cyan-500/20 cursor-pointer flex items-center justify-between transition-colors group text-gray-300 hover:text-white"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 group-hover:text-cyan-300 uppercase">
                    {item.category}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-gray-500">
              No matching commands found.
            </div>
          )}
        </div>

        {/* Footer tip */}
        <div className="px-3 py-2 bg-[#090d24] border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500">
          <span>Use ⌘K or ESC to toggle</span>
          <span>CodeForge Omnibox</span>
        </div>
      </div>
    </div>
  );
};
