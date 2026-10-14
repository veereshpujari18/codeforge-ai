import React, { useState, useEffect } from 'react';
import { Terminal, Code2, Menu, X, ArrowRight, Activity, Compass, Radio, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  onOpenWorkspace: () => void;
  onOpenCommandPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenWorkspace, onOpenCommandPalette }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Dashboard', href: '#dashboard' },
    { label: '3D Studio', href: '#observatory' },
    { label: 'CodeGen', href: '#codegen' },
    { label: '3D Debugger', href: '#debugger' },
    { label: 'Review', href: '#review' },
    { label: 'Explain', href: '#explain' },
    { label: 'Security', href: '#security' },
    { label: 'RAG Graph', href: '#rag' },
    { label: 'DSA Lab', href: '#dsa' },
    { label: 'Swarm', href: '#agents' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0e27]/90 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] py-2.5'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-600 to-pink-500 p-[1.5px] shadow-[0_0_15px_rgba(0,217,255,0.4)] group-hover:shadow-[0_0_25px_rgba(0,217,255,0.7)] transition-all">
            <div className="w-full h-full bg-[#0a0e27] rounded-[10px] flex items-center justify-center">
              <Code2 className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              CodeForge <span className="text-cyan-400 text-xs px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 font-mono">AI v5</span>
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden xl:flex items-center space-x-4 text-xs font-mono text-gray-300">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-cyan-400 transition-colors py-1 relative group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-cyan-400 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center space-x-3">
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono border border-white/10 transition-colors"
            title="Search commands (Cmd+K)"
          >
            <span>Search</span>
            <kbd className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400 border border-white/10">⌘K</kbd>
          </button>

          <button
            onClick={onOpenWorkspace}
            className="relative group overflow-hidden px-4 py-2 rounded-xl text-xs font-mono font-semibold text-black bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-300 shadow-[0_0_20px_rgba(0,217,255,0.4)] hover:shadow-[0_0_30px_rgba(0,217,255,0.8)] transition-all flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Launch Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onOpenWorkspace}
            className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs"
          >
            <Terminal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/5 text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 pt-3 pb-6 bg-[#0a0e27]/95 border-b border-cyan-500/20 backdrop-blur-2xl">
          <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded bg-white/5 text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10"
              >
                {link.label}
              </a>
            ))}
          </div>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenWorkspace();
            }}
            className="w-full py-2.5 rounded-xl font-mono text-xs font-bold text-black bg-gradient-to-r from-cyan-400 to-emerald-300 flex items-center justify-center gap-2"
          >
            <Terminal className="w-4 h-4" />
            <span>Launch Developer Workspace</span>
          </button>
        </div>
      )}
    </header>
  );
};
