import React, { useState } from 'react';
import { GitCompare, CheckCircle, AlertTriangle, ArrowRight, Zap, TrendingUp, Sparkles, Sliders } from 'lucide-react';

export const CodeReviewDiffSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'latency' | 'security' | 'memory'>('latency');

  const diffData = {
    latency: {
      title: 'Database Query N+1 & Allocator Inefficiency',
      impact: '+94% Throughput Boost',
      metricChange: '142ms → 8.4ms',
      original: `// ❌ ORIGINAL (Legacy Hotpath)
async function fetchUserOrders(userIds: string[]) {
  const results = [];
  for (const id of userIds) {
    // Bottleneck: N+1 synchronous roundtrips
    const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    const orders = await db.query('SELECT * FROM orders WHERE user_id = $1', [id]);
    results.push({ user, orders });
  }
  return results;
}`,
      improved: `// ⚡ CODEFORGE OPTIMIZATION (Batch SIMD Vectorized)
async function fetchUserOrders(userIds: string[]) {
  // Solved: Single batched IN query with zero-copy JSON aggregation
  const [users, orders] = await Promise.all([
    db.query('SELECT id, name, email FROM users WHERE id = ANY($1)', [userIds]),
    db.query('SELECT * FROM orders WHERE user_id = ANY($1)', [userIds])
  ]);

  const orderMap = Map.groupBy(orders, o => o.user_id);
  return users.map(user => ({ user, orders: orderMap.get(user.id) ?? [] }));
}`,
      annotations: [
        { line: 4, text: 'Eliminated N+1 sequential latency cliff', type: 'critical' },
        { line: 8, text: 'O(1) in-memory grouping via Map.groupBy', type: 'perf' }
      ]
    },
    security: {
      title: 'Path Traversal & Unvalidated Input Taint',
      impact: '100% Exploit Immunity',
      metricChange: 'CWE-22 Prevented',
      original: `// ❌ ORIGINAL (Vulnerable File Server)
app.get('/download', (req, res) => {
  const filename = req.query.path;
  // Vulnerability: Path traversal ../../etc/passwd
  const filepath = path.join('/var/data', filename);
  res.sendFile(filepath);
});`,
      improved: `// 🛡️ CODEFORGE SECURITY HARDENED
app.get('/download', (req, res) => {
  const filename = sanitizePath(req.query.path);
  const resolved = path.resolve('/var/data', filename);
  
  // Enforce boundary containment to root directory
  if (!resolved.startsWith('/var/data/')) {
    return res.status(403).json({ error: 'Access denied: Directory traversal detected' });
  }
  res.sendFile(resolved);
});`,
      annotations: [
        { line: 4, text: 'Sanitized input & bounded path containment', type: 'critical' },
        { line: 8, text: 'Audit trail logging integrated', type: 'security' }
      ]
    },
    memory: {
      title: 'V8 Hidden Class De-optimization',
      impact: '72% GC Pressure Reduction',
      metricChange: '4.2GB → 1.1GB RAM',
      original: `// ❌ ORIGINAL (Polymorphic Inline Cache Misses)
function Point(x, y) {
  this.x = x;
  this.y = y;
}
// Dynamic attribute injection mutates hidden class
p.z = 10;
delete p.x;`,
      improved: `// ⚡ CODEFORGE TYPE-MONOMORPHIC
class Point3D {
  // Pre-declared monomorphic fields ensure V8 fast-path JIT
  x: number = 0;
  y: number = 0;
  z: number = 0;
  
  constructor(x: number, y: number, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}`,
      annotations: [
        { line: 2, text: 'Ensures monomorphic shape dispatch in V8 engine', type: 'perf' },
        { line: 7, text: 'Zero de-optimization bails during hot JIT loops', type: 'perf' }
      ]
    }
  }[activeTab];

  return (
    <section id="review" className="py-24 relative overflow-hidden bg-[#0c102c]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-3">
            <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
            SECTION 03 // INTELLIGENT CODE REVIEW
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            3D Diff Engine & Performance Verification
          </h2>
          <p className="mt-4 text-gray-400 text-base leading-relaxed">
            Move beyond superficial PR comments. CodeForge AI pinpoints algorithmic bottlenecks,
            tainted data paths, and hidden class thrashing with measurable performance benchmarks.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-xl bg-[#141a3f] border border-cyan-500/20">
            <button
              onClick={() => setActiveTab('latency')}
              className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'latency'
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_15px_rgba(0,217,255,0.4)]'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Latency & Concurrency
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'security'
                  ? 'bg-pink-500 text-black font-bold shadow-[0_0_15px_rgba(255,0,110,0.4)]'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Taint & Security
            </button>
            <button
              onClick={() => setActiveTab('memory')}
              className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'memory'
                  ? 'bg-purple-500 text-black font-bold shadow-[0_0_15px_rgba(157,78,221,0.4)]'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              V8 Engine JIT
            </button>
          </div>
        </div>

        {/* Split Screen Diff Container */}
        <div className="rounded-2xl glass-panel-elevated border border-cyan-500/30 overflow-hidden shadow-2xl">
          {/* Diff Banner */}
          <div className="px-6 py-4 bg-[#11173d] border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider block">
                ISSUE DIAGNOSED
              </span>
              <h3 className="text-base font-bold text-white font-mono">{diffData.title}</h3>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-gray-400">Benchmark:</span>
              <span className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                {diffData.metricChange.split('→')[0]}
              </span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                {diffData.metricChange.split('→')[1]}
              </span>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                {diffData.impact}
              </span>
            </div>
          </div>

          {/* Left vs Right Editor Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-cyan-500/20 font-mono text-xs">
            
            {/* Left: Original Code */}
            <div className="p-5 bg-[#0a0d24]/90">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-red-500/20 text-red-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  ORIGINAL IMPLEMENTATION
                </span>
                <span className="text-[10px] text-gray-500">Unoptimized</span>
              </div>
              <pre className="text-gray-300 leading-relaxed overflow-x-auto">
                <code>{diffData.original}</code>
              </pre>
            </div>

            {/* Right: CodeForge AI Suggestion */}
            <div className="p-5 bg-[#091129]/90 relative">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-500/20 text-emerald-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  CODEFORGE OPTIMIZED REFACTOR
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Ready to Merge
                </span>
              </div>
              <pre className="text-gray-200 leading-relaxed overflow-x-auto">
                <code>{diffData.improved}</code>
              </pre>

              {/* Glowing Annotations */}
              <div className="mt-4 pt-3 border-t border-cyan-500/15 space-y-2">
                {diffData.annotations.map((ann, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-cyan-500/10 border border-cyan-500/25 flex items-center gap-2 text-[11px] text-cyan-200"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{ann.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
