import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Play, Pause, SkipForward, RotateCcw, Bug, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';

interface StackFrame {
  id: string;
  name: string;
  file: string;
  line: number;
  memory: string;
  state: 'current' | 'caller' | 'resolved';
  vars: Record<string, string>;
}

const DEBUG_SCENARIOS = [
  {
    id: 'race_condition',
    title: 'Thread Race Condition',
    description: 'Concurrent access on unlocked VectorBuffer cache',
    frames: [
      { id: '1', name: 'VectorBuffer::write_atomic()', file: 'buffer.rs', line: 142, memory: '0x7ffd19b2', state: 'current', vars: { lock_state: 'POISONED', thread_id: '12', slice_len: '4096' } },
      { id: '2', name: 'MemoryArena::allocate_chunk()', file: 'arena.rs', line: 88, memory: '0x7ffd1840', state: 'caller', vars: { capacity: '65536', used: '61440' } },
      { id: '3', name: 'PipelineWorker::process_batch()', file: 'worker.rs', line: 210, memory: '0x7ffd1600', state: 'caller', vars: { batch_size: '256', completed: '254' } },
      { id: '4', name: 'tokio::runtime::task::raw()', file: 'raw.rs', line: 55, memory: '0x7ffd1200', state: 'resolved', vars: { scheduler: 'multi_thread' } }
    ] as StackFrame[]
  },
  {
    id: 'memory_leak',
    title: 'Heap Leak in AST Cache',
    description: 'Circular strong reference in AST parent pointers',
    frames: [
      { id: '1', name: 'ASTNode::retain_parent()', file: 'ast_graph.ts', line: 79, memory: '0x10f84a00', state: 'current', vars: { ref_count: '249,102', leak_detected: 'true' } },
      { id: '2', name: 'Parser::build_expression_tree()', file: 'parser.ts', line: 312, memory: '0x10f82110', state: 'caller', vars: { depth: '18', total_nodes: '41,080' } },
      { id: '3', name: 'Compiler::analyze_semantics()', file: 'compiler.ts', line: 45, memory: '0x10f78900', state: 'caller', vars: { target: 'ES2024' } },
      { id: '4', name: 'main()', file: 'index.ts', line: 12, memory: '0x10f70000', state: 'resolved', vars: { env: 'production' } }
    ] as StackFrame[]
  }
];

export const DebugVisualizer3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [activeFrameIdx, setActiveFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [breakpointHit, setBreakpointHit] = useState(true);

  const scenario = DEBUG_SCENARIOS[scenarioIdx];
  const activeFrame = scenario.frames[activeFrameIdx] || scenario.frames[0];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const stackGroup = new THREE.Group();
    scene.add(stackGroup);

    // Create 4 stack frame cylinders
    const cylinderMeshes: THREE.Mesh[] = [];
    const colors = [0x00d9ff, 0x9d4edd, 0x3a0ca3, 0x1a1f3a];

    for (let i = 0; i < 4; i++) {
      const geo = new THREE.CylinderGeometry(3.6 - i * 0.35, 3.8 - i * 0.35, 1.1, 32);
      const mat = new THREE.MeshBasicMaterial({
        color: colors[i],
        wireframe: true,
        transparent: true,
        opacity: i === 0 ? 0.9 : 0.45,
      });
      const cyl = new THREE.Mesh(geo, mat);
      cyl.position.y = (3 - i) * 1.8 - 2.5;
      stackGroup.add(cyl);
      cylinderMeshes.push(cyl);
    }

    // Floating Breakpoint Spheres
    const bpGroup = new THREE.Group();
    scene.add(bpGroup);

    const bpGeo = new THREE.SphereGeometry(0.45, 16, 16);
    const bpMat = new THREE.MeshBasicMaterial({ color: 0xff006e, wireframe: true });
    const bpMesh = new THREE.Mesh(bpGeo, bpMat);
    bpMesh.position.set(4.5, 2.9, 0);
    bpGroup.add(bpMesh);

    // Glowing halo for breakpoint
    const haloGeo = new THREE.RingGeometry(0.6, 0.8, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xff006e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(bpMesh.position);
    bpGroup.add(halo);

    // Handle resize
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

      // Rotate call stack gently
      stackGroup.rotation.y += delta * 0.4;

      // Pulse active frame
      if (cylinderMeshes[activeFrameIdx]) {
        const pulse = 1 + Math.sin(time * 4) * 0.05;
        cylinderMeshes[activeFrameIdx].scale.set(pulse, 1, pulse);
      }

      // Breakpoint pulsing
      halo.rotation.z += delta * 1.5;
      const bpScale = 1 + Math.sin(time * 6) * 0.15;
      bpMesh.scale.set(bpScale, bpScale, bpScale);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      cylinderMeshes.forEach(m => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      bpGeo.dispose();
      bpMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeFrameIdx, scenarioIdx]);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      {/* 3D Visualizer Canvas & Controls */}
      <div className="lg:col-span-6 relative rounded-2xl glass-panel-elevated p-4 overflow-hidden border border-cyan-500/25">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-pink-400" />
            <span className="font-semibold text-white">3D EXECUTION CALL STACK</span>
          </div>
          <div className="flex items-center gap-1.5 bg-pink-500/10 text-pink-300 px-2.5 py-0.5 rounded border border-pink-500/20">
            <span className="w-2 h-2 rounded-full bg-pink-400" />
            <span>BREAKPOINT HIT @ Line {activeFrame.line}</span>
          </div>
        </div>

        {/* 3D Canvas Mount */}
        <div ref={mountRef} className="w-full h-72 sm:h-80" />

        {/* Stack Navigation & Stepping Toolbar */}
        <div className="pt-3 border-t border-cyan-500/15 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-semibold text-xs hover:bg-cyan-400 transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Resume'}</span>
            </button>
            <button
              onClick={() => setActiveFrameIdx((prev) => (prev + 1) % scenario.frames.length)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs border border-white/10 transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5 text-cyan-400" />
              <span>Step Over</span>
            </button>
            <button
              onClick={() => setActiveFrameIdx(0)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
              title="Reset Stack"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            {DEBUG_SCENARIOS.map((sc, idx) => (
              <button
                key={sc.id}
                onClick={() => {
                  setScenarioIdx(idx);
                  setActiveFrameIdx(0);
                }}
                className={`text-[11px] font-mono px-2 py-1 rounded transition-colors ${
                  scenarioIdx === idx
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {sc.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Frame Details & Variables Inspector */}
      <div className="lg:col-span-6 space-y-4">
        {/* Scenario Header */}
        <div className="p-4 rounded-xl glass-card border border-purple-500/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono text-purple-400 uppercase tracking-wider font-semibold">
              DIAGNOSTIC CASE: {scenario.title}
            </span>
            <span className="text-xs font-mono text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
              SEV-1
            </span>
          </div>
          <p className="text-sm text-gray-300">{scenario.description}</p>
        </div>

        {/* Stack Frames List */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-gray-400 font-semibold uppercase flex items-center justify-between">
            <span>Call Stack Frames</span>
            <span className="text-[10px] text-gray-500">Click frame to inspect memory</span>
          </div>

          {scenario.frames.map((frame, idx) => {
            const isSelected = activeFrameIdx === idx;
            return (
              <div
                key={frame.id}
                onClick={() => setActiveFrameIdx(idx)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-500/15 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,217,255,0.15)]'
                    : 'glass-card hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-gray-600'}`} />
                    <span className="font-mono text-xs text-white font-semibold">{frame.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-gray-400">{frame.memory}</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[11px] font-mono text-gray-400 pl-4">
                  <span>{frame.file}:{frame.line}</span>
                  <span>&bull;</span>
                  <span className="text-cyan-300">Level #{idx}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Variable Hologram Inspector */}
        <div className="p-4 rounded-xl glass-panel border border-cyan-500/20 font-mono">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/10">
            <span className="text-xs text-cyan-300 font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              LIVE VARIABLES & REGISTERS
            </span>
            <span className="text-[10px] text-gray-400">Frame: {activeFrame.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(activeFrame.vars).map(([k, v]) => (
              <div key={k} className="p-2 rounded bg-black/40 border border-white/5 flex justify-between">
                <span className="text-gray-400">{k}:</span>
                <span className="text-emerald-300 font-semibold">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-cyan-300/80 bg-cyan-500/10 p-2 rounded border border-cyan-500/20">
            💡 AI Copilot Fix Suggestion: Insert atomic barrier `sync::atomic::fence(Acquire)` at line {activeFrame.line} to eliminate dirty reads.
          </div>
        </div>
      </div>
    </div>
  );
};
