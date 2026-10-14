import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { History, Play, Pause, RotateCcw, Clock, Layers, Flame, Sliders } from 'lucide-react';
import { soundFx } from '../../utils/audioSonification';

interface TimeSnapshot {
  t: number; // in milliseconds
  func: string;
  thread: 'Thread #1 (Main)' | 'Thread #2 (Worker SIMD)';
  memKB: number;
  vars: Record<string, string>;
  isHotspot?: boolean;
}

const TIMELINE_SNAPSHOTS: TimeSnapshot[] = [
  { t: 0, func: 'initApplet()', thread: 'Thread #1 (Main)', memKB: 140, vars: { argc: '1', state: 'BOOTING' } },
  { t: 30, func: 'loadVectorIndex()', thread: 'Thread #1 (Main)', memKB: 410, vars: { dim: '1536', chunks: '24' } },
  { t: 60, func: 'spawnWorkerPool()', thread: 'Thread #2 (Worker SIMD)', memKB: 780, vars: { workers: '4', affinity: 'CORE_0_3' } },
  { t: 100, func: 'matrixMultiplySIMD()', thread: 'Thread #2 (Worker SIMD)', memKB: 1240, vars: { cycles: '480k', cache_misses: '0' }, isHotspot: true },
  { t: 140, func: 'barrierSync()', thread: 'Thread #1 (Main)', memKB: 1190, vars: { lock_status: 'RELEASED' } },
  { t: 180, func: 'emitBytecodeOutput()', thread: 'Thread #1 (Main)', memKB: 980, vars: { bytes: '65536', status: 'OK' } }
];

export const ExecutionHelixTimeline3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [timeIndex, setTimeIndex] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);

  const snapshot = TIMELINE_SNAPSHOTS[timeIndex] || TIMELINE_SNAPSHOTS[0];

  // Auto-play timeline loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setTimeIndex(prev => (prev + 1) % TIMELINE_SNAPSHOTS.length);
        soundFx.playSonarPing();
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Three.js DNA Helix
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 4, 24);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const helixGroup = new THREE.Group();
    scene.add(helixGroup);

    // Create 2 intertwined helical paths
    const coilCount = 36;
    const radius = 3.6;
    const heightSpan = 18;

    const strand1Points: THREE.Vector3[] = [];
    const strand2Points: THREE.Vector3[] = [];
    const knots: THREE.Mesh[] = [];

    const knotGeo = new THREE.SphereGeometry(0.35, 12, 12);
    const knotMat = new THREE.MeshBasicMaterial({ color: 0x00d9ff, wireframe: true });

    for (let i = 0; i <= coilCount; i++) {
      const angle = (i / coilCount) * Math.PI * 4;
      const y = (i / coilCount) * heightSpan - heightSpan / 2;

      const p1 = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      const p2 = new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius);

      strand1Points.push(p1);
      strand2Points.push(p2);

      // Connecting rungs every 3 steps
      if (i % 3 === 0) {
        const rungGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const rungMat = new THREE.LineBasicMaterial({
          color: i === 18 ? 0xff006e : 0x9d4edd,
          transparent: true,
          opacity: 0.6,
        });
        const rung = new THREE.Line(rungGeo, rungMat);
        helixGroup.add(rung);

        const knot = new THREE.Mesh(knotGeo, knotMat);
        knot.position.copy(p1);
        helixGroup.add(knot);
        knots.push(knot);
      }
    }

    // Strand 1 line
    const strand1Curve = new THREE.CatmullRomCurve3(strand1Points);
    const strand1Geo = new THREE.TubeGeometry(strand1Curve, 64, 0.12, 8, false);
    const strand1Mat = new THREE.MeshBasicMaterial({ color: 0x00d9ff, transparent: true, opacity: 0.85 });
    const strand1 = new THREE.Mesh(strand1Geo, strand1Mat);
    helixGroup.add(strand1);

    // Strand 2 line
    const strand2Curve = new THREE.CatmullRomCurve3(strand2Points);
    const strand2Geo = new THREE.TubeGeometry(strand2Curve, 64, 0.12, 8, false);
    const strand2Mat = new THREE.MeshBasicMaterial({ color: 0x06ffa5, transparent: true, opacity: 0.75 });
    const strand2 = new THREE.Mesh(strand2Geo, strand2Mat);
    helixGroup.add(strand2);

    // Active scrubber indicator sphere in 3D
    const scrubberGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const scrubberMat = new THREE.MeshBasicMaterial({ color: 0xff006e });
    const scrubberMesh = new THREE.Mesh(scrubberGeo, scrubberMat);
    helixGroup.add(scrubberMesh);

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

      // Rotate helix
      helixGroup.rotation.y += delta * 0.4;

      // Position active scrubber along timeline height
      const progress = timeIndex / (TIMELINE_SNAPSHOTS.length - 1);
      const targetY = progress * heightSpan - heightSpan / 2;
      const angle = progress * Math.PI * 4;
      scrubberMesh.position.set(Math.cos(angle) * radius, targetY, Math.sin(angle) * radius);

      const pulse = 1 + Math.sin(time * 6) * 0.2;
      scrubberMesh.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      strand1Geo.dispose();
      strand1Mat.dispose();
      strand2Geo.dispose();
      strand2Mat.dispose();
      knotGeo.dispose();
      knotMat.dispose();
      scrubberGeo.dispose();
      scrubberMat.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [timeIndex]);

  return (
    <div className="w-full rounded-2xl glass-panel-elevated border border-cyan-500/30 p-6 overflow-hidden shadow-2xl font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-cyan-500/20 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">4D Temporal Execution Timeline (DNA Helix)</h3>
            <span className="text-[11px] text-gray-400">Scrub execution state backwards and forwards through microsecond history</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors flex items-center gap-1.5"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Replay Execution'}</span>
          </button>
          <button
            onClick={() => setTimeIndex(0)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
            title="Rewind to T+0ms"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount */}
      <div className="relative my-4">
        <div ref={mountRef} className="w-full h-80 sm:h-96" />

        {/* Hotspot Alert Overlay */}
        {snapshot.isHotspot && (
          <div className="absolute top-4 right-6 p-3 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs backdrop-blur-md">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Flame className="w-4 h-4 text-pink-400" />
              HOTSPOT DETECTED (T+{snapshot.t}ms)
            </div>
            <span>SIMD Matrix loop unrolling consumed 78% thread cycles.</span>
          </div>
        )}
      </div>

      {/* Timeline Scrubber Bar */}
      <div className="pt-4 border-t border-cyan-500/15 space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">T+0ms</span>
          <input
            type="range"
            min={0}
            max={TIMELINE_SNAPSHOTS.length - 1}
            value={timeIndex}
            onChange={(e) => setTimeIndex(Number(e.target.value))}
            className="flex-1 accent-cyan-400 cursor-pointer"
          />
          <span className="text-xs text-cyan-300 font-bold">T+{snapshot.t}ms</span>
        </div>

        {/* State Snapshot Inspector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-black/40 p-3 rounded-xl border border-white/5">
          <div>
            <span className="text-gray-400 text-[10px] block">ACTIVE FUNCTION</span>
            <span className="text-sm font-bold text-white">{snapshot.func}</span>
            <span className="text-[10px] text-cyan-400 block mt-0.5">{snapshot.thread}</span>
          </div>

          <div>
            <span className="text-gray-400 text-[10px] block">HEAP ALLOCATION AT T+{snapshot.t}ms</span>
            <span className="text-sm font-bold text-purple-300">{snapshot.memKB} KB</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Zero Leakage Point</span>
          </div>

          <div>
            <span className="text-gray-400 text-[10px] block">REGISTER VARIABLES</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(snapshot.vars).map(([k, v]) => (
                <span key={k} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-300 border border-white/10">
                  {k}: <strong className="text-cyan-300">{v}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
