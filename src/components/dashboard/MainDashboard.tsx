import React, { useState, useEffect } from 'react';
import { useAgentStore } from '../../store/agentStore';
import { useEditorStore } from '../../store/editorStore';
import { performanceMonitor } from '../../services/performanceMonitor';
import { CodeEditorComponent } from '../editor/CodeEditorComponent';
import { CallStackHelix3D } from '../3d/CallStackHelix3D';
import { AgentSwarmVisualizer3D } from '../3d/AgentSwarmVisualizer3D';
import { PerformanceObservatory3D } from '../3d/PerformanceObservatory3D';
import { MultiplayerCollaborationOverlay } from '../multiplayer/MultiplayerCollaborationOverlay';
import { 
  Code2, 
  Bug, 
  Activity, 
  Bot, 
  Users, 
  Terminal as TerminalIcon, 
  Save, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  Zap, 
  Play, 
  CheckCircle2, 
  ChevronUp, 
  ChevronDown,
  Layers,
  Cpu
} from 'lucide-react';
import { soundFx } from '../../utils/audioSonification';

export type DashboardTab = 'Editor' | 'Debug' | 'Performance' | 'Agent' | 'Collab';

export const MainDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('Editor');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '⚡ CodeForge Kernel v5.0.0 [Initialized]',
    '✓ All 5 Sub-Agents Synchronized over WebSocket Room "forge-dev"',
    'Ready. Press Save or Analyze to test pipeline.'
  ]);
  const [termInput, setTermInput] = useState('');

  const [metrics, setMetrics] = useState({ fps: 60, cpuPercent: 32, memoryMb: 482 });
  const { agents, selectedAgentId, selectAgent, globalProgress, dispatchSwarmPulse } = useAgentStore();
  const { saveFile } = useEditorStore();

  useEffect(() => {
    const unsub = performanceMonitor.subscribe((m) => {
      setMetrics({
        fps: m.fps,
        cpuPercent: m.cpuPercent,
        memoryMb: m.memoryMb,
      });
    });
    return unsub;
  }, []);

  const handleTabSwitch = (tab: DashboardTab) => {
    setActiveTab(tab);
    soundFx.playSonarPing();
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleTerminalCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = termInput.trim();
    if (!cmd) return;

    soundFx.playCommandChirp();
    const newLogs = [...terminalLogs, `$ ${cmd}`];

    if (cmd === 'clear') {
      setTerminalLogs(['$ Ready.']);
      setTermInput('');
      return;
    } else if (cmd === 'analyze' || cmd === 'npm test') {
      newLogs.push('⚡ Compiling AST passes with Quantum JIT backend...');
      newLogs.push('✓ Verification PASSED: 0 memory leaks, 0 type errors');
      newLogs.push('🚀 Hotpath throughput: 1.84M ops/sec');
    } else {
      newLogs.push(`Command "${cmd}" executed successfully.`);
    }

    setTerminalLogs(newLogs);
    setTermInput('');
  };

  const handleQuickAnalyze = () => {
    dispatchSwarmPulse();
    soundFx.playQuantumCollapse();
    setTerminalLogs((prev) => [
      ...prev,
      '$ ai analyze',
      '⚡ Swarm pulse dispatched to 5 autonomous agents...',
      '✓ Multi-agent consensus achieved (99.8% health)'
    ]);
  };

  return (
    <section id="dashboard" className="w-full min-h-screen py-16 px-2 sm:px-6 relative bg-[#0a0e27] font-mono text-xs">
      <div className="max-w-7xl mx-auto flex flex-col space-y-4">
        
        {/* Top Control Bar with 5 Tabs, Real-time Metrics & Actions */}
        <div className="rounded-2xl glass-panel-elevated border border-cyan-500/30 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xl select-none">
          {/* 5-Tab Selector (Step 13) */}
          <div className="flex items-center gap-1 bg-[#101539] p-1 rounded-xl border border-cyan-500/20 overflow-x-auto">
            {(['Editor', 'Debug', 'Performance', 'Agent', 'Collab'] as DashboardTab[]).map((tab) => {
              const isActive = activeTab === tab;
              const Icon = {
                Editor: Code2,
                Debug: Bug,
                Performance: Activity,
                Agent: Bot,
                Collab: Users,
              }[tab];

              return (
                <button
                  key={tab}
                  onClick={() => handleTabSwitch(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-300 text-black font-bold shadow-[0_0_15px_rgba(0,217,255,0.4)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab}</span>
                </button>
              );
            })}
          </div>

          {/* Real-time Metrics Display (FPS, CPU%, Memory%) (Step 13) */}
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {metrics.fps} FPS
            </span>
            <span>&bull;</span>
            <span className="text-cyan-300">CPU: {metrics.cpuPercent}%</span>
            <span>&bull;</span>
            <span className="text-purple-300">RAM: {metrics.memoryMb} MB</span>
          </div>

          {/* Quick Action Buttons (Save, Analyze, Fullscreen) (Step 13) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                saveFile();
                soundFx.playCommandChirp();
              }}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all flex items-center gap-1.5"
              title="Save All Files (Cmd+S)"
            >
              <Save className="w-3.5 h-3.5 text-cyan-400" />
              <span>Save</span>
            </button>

            <button
              onClick={handleQuickAnalyze}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all shadow-[0_0_15px_rgba(0,217,255,0.3)] flex items-center gap-1.5"
              title="Run Swarm Analysis"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze</span>
            </button>

            <button
              onClick={handleToggleFullscreen}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Global Progress Bar (Step 13) */}
        <div className="w-full bg-[#11173d] h-2 rounded-full overflow-hidden border border-cyan-500/20 relative">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${globalProgress}%` }}
          />
        </div>

        {/* Dynamic Layout: Sidebar with Agents + Tab Viewport */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[520px]">
          
          {/* Sidebar: Agent Status Monitoring (Step 13) */}
          <div className="lg:col-span-3 rounded-2xl glass-panel-elevated border border-purple-500/25 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-purple-500/20 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-purple-400" />
                SWARM AGENT HEALTH
              </span>
              <span className="text-emerald-400 text-[10px] font-bold">5 Online</span>
            </div>

            <div className="space-y-2">
              {Object.values(agents).map((ag) => {
                const isSelected = ag.id === selectedAgentId;
                return (
                  <div
                    key={ag.id}
                    onClick={() => {
                      selectAgent(ag.id);
                      soundFx.playSonarPing();
                    }}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-400 shadow-[0_0_12px_rgba(157,78,221,0.25)]'
                        : 'bg-black/30 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-bold text-xs truncate">{ag.name.split(' ')[0]}</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        ag.status === 'working' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {ag.status}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-black/60 h-1 rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
                        style={{ width: `${ag.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>Health: <strong className="text-emerald-400">{ag.health.toFixed(1)}%</strong></span>
                      <span>Succ: <strong className="text-cyan-300">{ag.metrics.successRate}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Tab Content Viewport */}
          <div className="lg:col-span-9 flex flex-col space-y-4">
            {activeTab === 'Editor' && <CodeEditorComponent className="min-h-[500px]" />}
            {activeTab === 'Debug' && <CallStackHelix3D />}
            {activeTab === 'Performance' && <PerformanceObservatory3D />}
            {activeTab === 'Agent' && (
              <div className="rounded-2xl glass-panel-elevated border border-purple-500/30 p-4">
                <AgentSwarmVisualizer3D />
              </div>
            )}
            {activeTab === 'Collab' && <MultiplayerCollaborationOverlay />}
          </div>
        </div>

        {/* Terminal Emulator (40px compact height with expandable toggle) (Step 13) */}
        <div className="rounded-xl glass-panel-elevated border border-cyan-500/25 overflow-hidden transition-all duration-300">
          <div className="h-10 px-4 bg-[#0d122e] flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white text-xs">WORKSPACE TERMINAL EMULATOR</span>
              <span className="text-gray-500 hidden sm:inline">&bull; Type "analyze" or "help"</span>
            </div>

            <button
              onClick={() => setIsTerminalExpanded(!isTerminalExpanded)}
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
            >
              {isTerminalExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>

          {isTerminalExpanded && (
            <div className="p-3 bg-[#050818] space-y-2">
              <div className="max-h-36 overflow-y-auto space-y-1 text-xs">
                {terminalLogs.map((log, i) => (
                  <div key={i} className={log.startsWith('✓') ? 'text-emerald-400' : log.startsWith('$') ? 'text-yellow-400 font-bold' : 'text-gray-300'}>
                    {log}
                  </div>
                ))}
              </div>

              <form onSubmit={handleTerminalCommand} className="flex items-center gap-2 pt-2 border-t border-white/5">
                <span className="text-cyan-400 font-bold">$</span>
                <input
                  type="text"
                  value={termInput}
                  onChange={(e) => setTermInput(e.target.value)}
                  placeholder="type command..."
                  className="flex-1 bg-transparent border-none text-xs text-white placeholder-gray-600 focus:outline-none"
                />
              </form>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
