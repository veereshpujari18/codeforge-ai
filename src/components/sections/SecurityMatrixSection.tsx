import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Lock, Unlock, AlertTriangle, Terminal, CheckCircle2, RefreshCw } from 'lucide-react';

interface ThreatItem {
  id: string;
  cve: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  location: string;
  status: 'BLOCKED' | 'FIXED' | 'MONITORING';
  rule: string;
}

const THREATS: ThreatItem[] = [
  { id: '1', cve: 'CVE-2025-4192', title: 'Prototype Pollution via Deep Merge', severity: 'CRITICAL', location: 'src/utils/object.ts:42', status: 'BLOCKED', rule: 'CWE-1321 Object Prototype Defense' },
  { id: '2', cve: 'CVE-2025-2980', title: 'SQL Taint Ingestion in Dynamic ORDER BY', severity: 'HIGH', location: 'src/db/orders.ts:108', status: 'FIXED', rule: 'CWE-89 Parameterized Enforcement' },
  { id: '3', cve: 'CVE-2024-8821', title: 'Hardcoded Secret Entropy Anomaly', severity: 'HIGH', location: 'src/config/aws.ts:15', status: 'BLOCKED', rule: 'CWE-798 Vault Key Rotation' },
  { id: '4', cve: 'CVE-2024-3901', title: 'ReDoS Regex Catastrophic Backtracking', severity: 'MEDIUM', location: 'src/auth/email.ts:24', status: 'FIXED', rule: 'CWE-1333 Linear DFA Parser' },
];

export const SecurityMatrixSection: React.FC = () => {
  const [selectedSeverity, setSelectedSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('All 48 Security Rules Active (Zero Vulnerabilities Outstanding)');

  const handleRunScan = () => {
    setIsScanning(true);
    setScanStatus('Running dynamic AST taint tracing and entropy analysis...');
    setTimeout(() => {
      setIsScanning(false);
      setScanStatus('Audit complete: 4 threats neutralized, 0 active exposures.');
    }, 1200);
  };

  const filteredThreats = THREATS.filter(t => 
    selectedSeverity === 'ALL' ? true : t.severity === selectedSeverity
  );

  return (
    <section id="security" className="py-24 relative overflow-hidden bg-[#0c102c]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono mb-3">
            <Shield className="w-3.5 h-3.5 text-red-400" />
            SECTION 05 // ZERO-TRUST SECURITY MATRIX
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            Autonomous Vulnerability & Threat Shield
          </h2>
          <p className="mt-4 text-gray-400 text-base leading-relaxed">
            Real-time static taint analysis, automated CVE remediation, and secret entropy scanning
            embedded directly within your compilation pipeline.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: 3D Shield & Live Heat Map */}
          <div className="lg:col-span-5 rounded-2xl glass-panel-elevated border border-red-500/25 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Animated Shield Graphic */}
            <div className="relative my-4">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-red-500/20 via-pink-600/30 to-cyan-500/20 flex items-center justify-center border border-red-500/40 shadow-[0_0_35px_rgba(255,0,110,0.3)] animate-pulse">
                <ShieldCheck className="w-14 h-14 text-emerald-400" />
              </div>
              <div className="absolute -top-1 -right-1 p-1 rounded-full bg-emerald-500 text-black">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>

            <h3 className="font-display font-bold text-xl text-white">Active Defense Perimeter</h3>
            <p className="text-xs text-gray-400 font-mono mt-1">
              Deterministic AST Taint Tracking v4.0
            </p>

            {/* Matrix Heatmap visual cells */}
            <div className="w-full mt-6 pt-5 border-t border-white/10">
              <span className="text-xs font-mono text-gray-400 block mb-2 font-semibold">
                SECTOR HEATMAP (16 THREAT REGIONS)
              </span>
              <div className="grid grid-cols-8 gap-1.5">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-5 rounded text-[9px] flex items-center justify-center font-mono ${
                      i === 3 || i === 11
                        ? 'bg-red-500/80 text-white font-bold animate-pulse'
                        : i === 7 || i === 22
                        ? 'bg-yellow-500/70 text-black font-semibold'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {i === 3 || i === 11 ? '!' : '✓'}
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 mt-2">
                <span>Memory Safe</span>
                <span className="text-emerald-400">0 Critical Leaks</span>
                <span>Type Sound</span>
              </div>
            </div>

            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className="mt-6 w-full py-2.5 rounded-xl font-mono text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isScanning ? 'Scanning AST...' : 'Run Security Deep Scan'}</span>
            </button>
          </div>

          {/* Right: Threat List & Remediation Log */}
          <div className="lg:col-span-7 space-y-4">
            {/* Filter pills */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSelectedSeverity(sev)}
                    className={`text-[11px] font-mono px-3 py-1 rounded-lg transition-all ${
                      selectedSeverity === sev
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {scanStatus}
              </span>
            </div>

            {/* Threat Cards */}
            <div className="space-y-3">
              {filteredThreats.map((threat) => (
                <div
                  key={threat.id}
                  className="p-4 rounded-xl glass-card border border-white/10 hover:border-red-500/30 transition-all font-mono text-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        threat.severity === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : threat.severity === 'HIGH'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {threat.severity}
                      </span>
                      <span className="text-gray-400 text-[11px]">{threat.cve}</span>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      {threat.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white font-sans">{threat.title}</h4>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-gray-400 text-[11px]">
                    <span>Target: <code className="text-cyan-300">{threat.location}</code></span>
                    <span>&bull;</span>
                    <span className="text-gray-400">{threat.rule}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
