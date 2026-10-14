import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Bot, Play, Pause, RotateCcw, CheckCircle2, Zap, ArrowRight, ShieldCheck, Cpu, Activity, AlertTriangle, Layers } from 'lucide-react';
import { soundFx } from '../../utils/audioSonification';

interface SwarmAgent {
  id: string;
  name: string;
  role: string;
  health: number;
  pulseRate: string;
  status: 'active' | 'processing' | 'standby';
  colorHex: number;
  colorCss: string;
  tasksCompleted: number;
  currentTask: string;
}

const SWARM_AGENTS: SwarmAgent[] = [
  {
    id: 'architect',
    name: 'Architecture Agent',
    role: 'AST Schema Synthesis & API Contracts',
    health: 99.8,
    pulseRate: '240 bpm',
    status: 'active',
    colorHex: 0x9d4edd,
    colorCss: '#9d4edd',
    tasksCompleted: 42,
    currentTask: 'Generating OpenAPI 3.1 & Proto3 schemas'
  },
  {
    id: 'coder',
    name: 'Synthesis Coder Agent',
    role: 'Zero-Copy Type-Safe Code Generation',
    health: 100.0,
    pulseRate: '310 bpm',
    status: 'processing',
    colorHex: 0x00d9ff,
    colorCss: '#00d9ff',
    tasksCompleted: 128,
    currentTask: 'Compiling SIMD matrix unrolling pass'
  },
  {
    id: 'sentinel',
    name: 'Security Sentinel Agent',
    role: 'Taint Tracing & Threat Neutralization',
    health: 98.9,
    pulseRate: '190 bpm',
    status: 'active',
    colorHex: 0xff006e,
    colorCss: '#ff006e',
    tasksCompleted: 19,
    currentTask: 'Auditing path traversal sanitizers'
  },
  {
    id: 'debugger',
    name: 'Time-Travel Debug Agent',
    role: 'Memory Race Condition Isolation',
    health: 97.4,
    pulseRate: '220 bpm',
    status: 'processing',
    colorHex: 0x06ffa5,
    colorCss: '#06ffa5',
    tasksCompleted: 34,
    currentTask: 'Asserting CAS ordering on 64 cores'
  },
  {
    id: 'deployer',
    name: 'Deployment Cloud Agent',
    role: 'Canary Rollout & Edge WASM Smoke Tests',
    health: 100.0,
    pulseRate: '140 bpm',
    status: 'standby',
    colorHex: 0xffbe0b,
    colorCss: '#ffbe0b',
    tasksCompleted: 15,
    currentTask: 'Awaiting verified smoke test matrix'
  }
];

export const AgentWorkflowSection: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('coder');
  const [isSimulating, setIsSimulating] = useState(false);
  const [packetCount, setPacketCount] = useState(1420);

  const activeAgent = SWARM_AGENTS.find(a => a.id === selectedAgentId) || SWARM_AGENTS[1];

  // 3D Swarm canvas with central orchestrator and orbiting agents connected via bezier curves
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4, 22);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const swarmGroup = new THREE.Group();
    scene.add(swarmGroup);

    // 1. Central Nucleus (Swarm Orchestrator)
    const nucleusGeo = new THREE.IcosahedronGeometry(2.4, 2);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    swarmGroup.add(nucleus);

    const innerCore = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })
    );
    nucleus.add(innerCore);

    // 2. 5 Orbiting Sub-Agents
    const agentMeshes: { mesh: THREE.Mesh; agent: SwarmAgent; angleOffset: number }[] = [];
    const agentGeo = new THREE.SphereGeometry(0.9, 16, 16);

    SWARM_AGENTS.forEach((agent, idx) => {
      const mat = new THREE.MeshBasicMaterial({
        color: agent.colorHex,
        wireframe: true,
      });
      const mesh = new THREE.Mesh(agentGeo, mat);
      const angle = (idx / SWARM_AGENTS.length) * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * 7.5, Math.sin(angle * 2) * 1.5, Math.sin(angle) * 7.5);
      swarmGroup.add(mesh);
      agentMeshes.push({ mesh, agent, angleOffset: angle });
    });

    // 3. Flowing Bezier curves between nucleus and agents
    const curveLines: THREE.Line[] = [];
    agentMeshes.forEach(({ mesh, agent }) => {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(mesh.position.x * 0.5, 3.0, mesh.position.z * 0.5),
        mesh.position
      );
      const points = curve.getPoints(24);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: agent.colorHex,
        transparent: true,
        opacity: 0.5,
      });
      const line = new THREE.Line(geo, mat);
      swarmGroup.add(line);
      curveLines.push(line);
    });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Nucleus rotation and pulsing
      nucleus.rotation.y += delta * 0.8;
      nucleus.rotation.x += delta * 0.4;
      const s = 1 + Math.sin(time * 4) * 0.1;
      innerCore.scale.set(s, s, s);

      // Rotate orbiting agents
      agentMeshes.forEach(({ mesh, angleOffset, agent }) => {
        const curAngle = time * 0.4 + angleOffset;
        mesh.position.set(
          Math.cos(curAngle) * 7.5,
          Math.sin(curAngle * 2) * 1.8,
          Math.sin(curAngle) * 7.5
        );
        mesh.rotation.y += delta * 1.5;

        // Pulse selected agent
        if (agent.id === selectedAgentId) {
          const selectedPulse = 1.4 + Math.sin(time * 6) * 0.2;
          mesh.scale.set(selectedPulse, selectedPulse, selectedPulse);
        } else {
          mesh.scale.set(1, 1, 1);
        }
      });

      swarmGroup.rotation.y = Math.sin(time * 0.15) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      innerCore.geometry.dispose();
      agentGeo.dispose();
      curveLines.forEach(l => {
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      });
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [selectedAgentId]);

  const handleSimulateSwarm = () => {
    setIsSimulating(true);
    soundFx.playQuantumCollapse();
    setPacketCount(prev => prev + 240);
    setTimeout(() => {
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <section id="agents" className="py-24 relative overflow-hidden bg-[#090d24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono mb-3">
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            SECTION 08 // AUTONOMOUS AGENT ORCHESTRATION
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            Multi-Agent Autonomous Engineering Swarm
          </h2>
          <p className="mt-4 text-gray-400 text-base leading-relaxed">
            Dispatch specialized autonomous sub-agents that collaboratively plan, code, audit,
            and deploy complex features end-to-end with real-time data flow visualization.
          </p>
        </div>

        {/* 3D Visualizer & Swarm Control Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: 3D Swarm Orbit Canvas */}
          <div className="lg:col-span-7 rounded-2xl glass-panel-elevated border border-purple-500/30 p-6 relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20 text-xs font-mono">
              <span className="text-white font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                CENTRAL SWARM FORCE GRAPH (5 PARALLEL AGENTS)
              </span>
              <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                Telemetry: 100% HEALTHY
              </span>
            </div>

            <div ref={mountRef} className="w-full h-80 sm:h-96" />

            {/* Quick Agent Selectors */}
            <div className="pt-3 border-t border-purple-500/15 flex flex-wrap gap-2">
              {SWARM_AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => {
                    setSelectedAgentId(agent.id);
                    soundFx.playSonarPing();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                    selectedAgentId === agent.id
                      ? 'bg-purple-500 text-white font-bold shadow-[0_0_15px_rgba(157,78,221,0.4)]'
                      : 'bg-white/5 text-gray-300 hover:text-white border border-white/10'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: agent.colorCss }} />
                  <span>{agent.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Selected Agent Inspector & Floating Job Queue */}
          <div className="lg:col-span-5 space-y-4 font-mono">
            {/* Active Agent Card */}
            <div className="p-5 rounded-2xl glass-panel-elevated border border-purple-500/30">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: activeAgent.colorCss }} />
                  <div>
                    <h3 className="font-display font-bold text-base text-white">{activeAgent.name}</h3>
                    <span className="text-[10px] text-gray-400 uppercase">{activeAgent.role}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 text-sm font-bold block">{activeAgent.health}%</span>
                  <span className="text-[10px] text-gray-500">Agent Health</span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-gray-400 text-[10px] block">ACTIVE DISPATCH TASK</span>
                  <span className="text-cyan-300 font-semibold">{activeAgent.currentTask}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-gray-400 text-[10px] block">PULSE RATE</span>
                    <span className="text-purple-300 font-bold">{activeAgent.pulseRate}</span>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-gray-400 text-[10px] block">TASKS RESOLVED</span>
                    <span className="text-emerald-400 font-bold">{activeAgent.tasksCompleted} units</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSimulateSwarm}
                disabled={isSimulating}
                className="mt-5 w-full py-2.5 rounded-xl text-xs font-bold font-mono text-black bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-300 hover:to-pink-300 shadow-[0_0_20px_rgba(157,78,221,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isSimulating ? 'Propagating Swarm Packets...' : 'Trigger Swarm Workload Burst'}</span>
              </button>
            </div>

            {/* Floating Job Queue preview */}
            <div className="p-4 rounded-xl glass-card border border-white/10 text-xs">
              <span className="text-[11px] font-bold text-gray-300 uppercase block mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Live Swarm Message Bus ({packetCount} Packets Processed)
              </span>
              <div className="space-y-1.5 text-[11px] text-gray-400">
                <div className="flex justify-between p-1.5 rounded bg-white/5">
                  <span className="text-cyan-300">#8912 &bull; AST Inlining</span>
                  <span className="text-emerald-400">✓ Completed</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-white/5">
                  <span className="text-purple-300">#8913 &bull; Taint Propagation</span>
                  <span className="text-cyan-400 animate-pulse">Running</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-white/5">
                  <span className="text-yellow-300">#8914 &bull; Canary Health Check</span>
                  <span className="text-gray-500">Queued</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
