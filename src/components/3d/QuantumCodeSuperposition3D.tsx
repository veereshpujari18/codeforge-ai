import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Atom, Sparkles, CheckCircle2, RefreshCw, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { soundFx } from '../../utils/audioSonification';

interface QuantumState {
  id: string;
  braKet: string;
  name: string;
  confidence: number;
  tradeoff: string;
  code: string;
}

const QUANTUM_STATES: QuantumState[] = [
  {
    id: 'simd_ring',
    braKet: '|ψ₁⟩',
    name: 'Zero-Copy SIMD Ring Buffer',
    confidence: 98.4,
    tradeoff: 'Sub-microsecond latency, strictly cache-aligned',
    code: `pub fn push_simd(&mut self, data: &[f32; 8]) -> bool {
    let head = self.head.load(Ordering::Relaxed);
    unsafe { _mm256_store_ps(self.ptr.add(head), _mm256_load_ps(data.as_ptr())) };
    self.head.store((head + 8) & 1023, Ordering::Release);
    true
}`
  },
  {
    id: 'atomic_mutex',
    braKet: '|ψ₂⟩',
    name: 'Lockless CAS Spinlock Queue',
    confidence: 84.2,
    tradeoff: 'Safe cross-thread dispatch, slight contention on 64+ cores',
    code: `pub fn push_cas(&self, val: u64) -> Result<(), QueueError> {
    while let Err(prev) = self.tail.compare_exchange_weak(
        tail, (tail + 1) % CAP, Ordering::AcqRel, Ordering::Relaxed
    ) {
        std::hint::spin_loop();
    }
    Ok(())
}`
  },
  {
    id: 'arena_alloc',
    braKet: '|ψ₃⟩',
    name: 'Monotonic Bump Arena Allocation',
    confidence: 62.5,
    tradeoff: 'Fast burst allocation, requires bulk reset on frame boundary',
    code: `pub fn alloc_bump(&mut self, size: usize) -> *mut u8 {
    let next = self.offset + size;
    if next > self.cap { return std::ptr::null_mut(); }
    let ptr = unsafe { self.base.add(self.offset) };
    self.offset = next;
    ptr
}`
  }
];

export const QuantumCodeSuperposition3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [isCollapsing, setIsCollapsing] = useState(false);

  // Three.js Quantum Wave Cloud Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const quantumGroup = new THREE.Group();
    scene.add(quantumGroup);

    // Probability wave particles
    const pCount = 350;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);

    const cyanColor = new THREE.Color(0x00d9ff);
    const pinkColor = new THREE.Color(0xff006e);
    const purpleColor = new THREE.Color(0x9d4edd);

    for (let i = 0; i < pCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 4.5 + Math.sin(theta * 3) * 1.5;

      pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPos[i * 3 + 2] = r * Math.cos(phi);

      const col = i % 3 === 0 ? cyanColor : i % 3 === 1 ? pinkColor : purpleColor;
      pColors[i * 3] = col.r;
      pColors[i * 3 + 1] = col.g;
      pColors[i * 3 + 2] = col.b;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const waveCloud = new THREE.Points(pGeo, pMat);
    quantumGroup.add(waveCloud);

    // Quantum nucleus ring
    const ringGeo = new THREE.TorusGeometry(3.2, 0.08, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00d9ff, wireframe: true });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    quantumGroup.add(ring);

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

      // Continuous rotation of probability cloud
      quantumGroup.rotation.y += delta * 0.5;
      quantumGroup.rotation.x += delta * 0.25;

      ring.rotation.z += delta * 1.2;

      // Pulse wave cloud
      const s = 1 + Math.sin(time * 3) * 0.08;
      waveCloud.scale.set(s, s, s);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      pGeo.dispose();
      pMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleCollapse = (stateId: string) => {
    setIsCollapsing(true);
    soundFx.playQuantumCollapse();
    setTimeout(() => {
      setSelectedStateId(stateId);
      setIsCollapsing(false);
    }, 700);
  };

  const activeState = QUANTUM_STATES.find(s => s.id === (selectedStateId || 'simd_ring')) || QUANTUM_STATES[0];

  return (
    <div className="w-full rounded-2xl glass-panel-elevated border border-pink-500/30 p-6 overflow-hidden shadow-2xl font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-pink-500/20 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <Atom className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">Quantum Code Superposition & Uncertainty</h3>
            <span className="text-[11px] text-gray-400">Schrödinger's Code &bull; Multi-Path Wave Function Collapse</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedStateId(null)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Superposition</span>
          </button>
        </div>
      </div>

      {/* Grid: 3D Quantum Cloud + Superposition State Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-4">
        {/* Left: 3D Probability Cloud Canvas */}
        <div className="lg:col-span-5 relative">
          <div ref={mountRef} className="w-full h-72 sm:h-80" />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center text-[10px] text-gray-400 bg-black/60 px-3 py-1 rounded-full border border-white/10">
            |Ψ⟩ = α|ψ₁⟩ + β|ψ₂⟩ + γ|ψ₃⟩
          </div>
        </div>

        {/* Right: The 3 Superposed States */}
        <div className="lg:col-span-7 space-y-3">
          {QUANTUM_STATES.map((st) => {
            const isChosen = selectedStateId === st.id;
            const inSuperposition = selectedStateId === null;

            return (
              <div
                key={st.id}
                onClick={() => handleCollapse(st.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  isChosen
                    ? 'bg-pink-500/20 border-2 border-pink-400 shadow-[0_0_20px_rgba(255,0,110,0.3)]'
                    : inSuperposition
                    ? 'glass-card border-white/10 hover:border-pink-500/40 opacity-90'
                    : 'bg-black/30 border border-white/5 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-pink-400 font-bold text-sm">{st.braKet}</span>
                    <h4 className="text-white font-sans font-bold text-sm">{st.name}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-400 font-bold">{st.confidence}% Confidence</span>
                    {isChosen && (
                      <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded border border-pink-500/40 font-bold">
                        COLLAPSED
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-400 font-sans">{st.tradeoff}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected / Collapsed Solution Code */}
      <div className="pt-4 border-t border-pink-500/15">
        <div className="flex items-center justify-between pb-2 text-xs text-gray-400">
          <span className="flex items-center gap-1.5 text-pink-300 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            COLLAPSED OPTIMAL KERNEL ({activeState.braKet} &bull; {activeState.name})
          </span>
          <span className="text-emerald-400">Zero Hallucination Verified</span>
        </div>
        <pre className="text-xs bg-[#070b20] p-4 rounded-xl text-gray-200 overflow-x-auto border border-white/5 leading-relaxed">
          <code>{activeState.code}</code>
        </pre>
      </div>
    </div>
  );
};
