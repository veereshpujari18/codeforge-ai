import React, { useState } from 'react';
import { Code2, Github, Twitter, Linkedin, Send, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
    }, 1500);
  };

  return (
    <footer className="relative bg-[#070a1e] border-t border-cyan-500/20 pt-16 pb-12 overflow-hidden text-gray-400 font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center text-black">
                <Code2 className="w-5 h-5 text-black" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                CodeForge <span className="text-cyan-400">AI</span>
              </span>
            </div>

            <p className="text-sm text-gray-400 font-sans leading-relaxed max-w-sm">
              The premium, 3D-accelerated engineering workspace empowering high-velocity developers
              to plan, synthesize, debug, and ship production software without cognitive friction.
            </p>

            {/* Newsletter form */}
            <div className="pt-2">
              <span className="block text-xs font-semibold text-white mb-2 uppercase tracking-wider">
                Subscribe to Kernel Engineering Changelog
              </span>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@domain.com"
                  className="flex-1 bg-[#101438] border border-cyan-500/20 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all flex items-center gap-1.5"
                >
                  {subscribed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{subscribed ? 'Joined' : 'Join'}</span>
                </button>
              </form>
              {subscribed && (
                <span className="text-emerald-400 text-[11px] mt-1 block">
                  ✓ Successfully subscribed to weekly technical releases!
                </span>
              )}
            </div>
          </div>

          {/* Links Column 1: Product */}
          <div>
            <h4 className="font-sans font-bold text-white text-sm mb-3">Product</h4>
            <ul className="space-y-2">
              <li><a href="#codegen" className="hover:text-cyan-400 transition-colors">Code Synthesis</a></li>
              <li><a href="#debugger" className="hover:text-cyan-400 transition-colors">3D Time-Travel Debugger</a></li>
              <li><a href="#review" className="hover:text-cyan-400 transition-colors">Automated Code Review</a></li>
              <li><a href="#security" className="hover:text-cyan-400 transition-colors">Security Sentinel</a></li>
              <li><a href="#rag" className="hover:text-cyan-400 transition-colors">Project RAG Graph</a></li>
              <li><a href="#dsa" className="hover:text-cyan-400 transition-colors">3D Algorithm Lab</a></li>
              <li><a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing & Plans</a></li>
            </ul>
          </div>

          {/* Links Column 2: Resources & Docs */}
          <div>
            <h4 className="font-sans font-bold text-white text-sm mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#docs" className="hover:text-cyan-400 transition-colors">API Reference</a></li>
              <li><a href="#docs" className="hover:text-cyan-400 transition-colors">Compiler Benchmarks</a></li>
              <li><a href="#docs" className="hover:text-cyan-400 transition-colors">WebAssembly Runtime</a></li>
              <li><a href="#docs" className="hover:text-cyan-400 transition-colors">Language SDKs</a></li>
              <li><a href="#docs" className="hover:text-cyan-400 transition-colors">Security Certifications</a></li>
              <li><a href="#docs" className="hover:text-cyan-400 transition-colors">Changelog & Roadmap</a></li>
            </ul>
          </div>

          {/* Links Column 3: Company & Legal */}
          <div>
            <h4 className="font-sans font-bold text-white text-sm mb-3">Company & Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">About CodeForge</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Engineering Careers</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">SOC2 Compliance</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Security Whitepaper</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with status & social */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              All AI Core Systems Operational (100.0% Uptime)
            </span>
            <span className="text-gray-500">&bull;</span>
            <span className="text-gray-500">&copy; {new Date().getFullYear()} CodeForge AI Inc.</span>
          </div>

          <div className="flex items-center space-x-4 text-gray-400">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
