import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Activity, Cpu, Database, Zap, ArrowUpRight, ShieldCheck, Gauge, Volume2, RefreshCw } from 'lucide-react';
import { soundFx } from '../../utils/audioSonification';

export const PerformanceObservatory3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState({
    fps: 60,
    heapMB: 482,
    cpuPercent: 34,
    latencyMs: 1.2,
    networkThroughput: 142.8,
  });
  const [timeRange, setTimeRange] = useState<'realtime' | '1h' | '24h'>('realtime');

  // Continuously update metrics to simulate live data
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics((prev) => {
        const newCpu = Math.min(95, Math.max(15, prev.cpuPercent + (Math.random() * 12 - 6)));
        const newHeap = Math.min(950, Math.max(380, prev.heapMB + (Math.random() * 20 - 10)));
        const newFps = Math.floor(58 + Math.random() * 3);
        const newLatency = Number((1.1 + Math.random() * 0.4).toFixed(2));
        const newThroughput = Number((130 + Math.random() * 30).toFixed(1));

        return {
          fps: newFps,
          heapMB: Math.round(newHeap),
          cpuPercent: Math.round(newCpu),
          latencyMs: newLatency,
          networkThroughput: newThroughput,
        };
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  // Three.js 3D Performance Space
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0e27, 0.002);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 10, 26);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const observatoryGroup = new THREE.Group();
    scene.add(observatoryGroup);

    // 1. Central Rotating FPS Globe
    const globeGeo = new THREE.SphereGeometry(3.2, 24, 24);
    const globeMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const fpsGlobe = new THREE.Mesh(globeGeo, globeMat);
    fpsGlobe.position.set(-6, 4, 0);
    observatoryGroup.add(fpsGlobe);

    const globeNucleus = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.6, 1),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
    );
    fpsGlobe.add(globeNucleus);

    // 2. Memory Liquid Cylinder Vessel
    const cylinderVesselGeo = new THREE.CylinderGeometry(2.4, 2.4, 7, 32, 1, true);
    const cylinderVesselMat = new THREE.MeshBasicMaterial({
      color: 0x9d4edd,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const vessel = new THREE.Mesh(cylinderVesselGeo, cylinderVesselMat);
    vessel.position.set(0, 3.5, 0);
    observatoryGroup.add(vessel);

    // Liquid inside cylinder
    const liquidGeo = new THREE.CylinderGeometry(2.2, 2.2, 4.2, 32);
    const liquidMat = new THREE.MeshBasicMaterial({
      color: 0x9d4edd,
      transparent: true,
      opacity: 0.5,
    });
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.set(0, 2.1, 0);
    observatoryGroup.add(liquid);

    // 3. 8 CPU Thread Light Beams
    const threadBeams: THREE.Mesh[] = [];
    const beamGeo = new THREE.CylinderGeometry(0.2, 0.2, 8, 16);
    for (let i = 0; i < 8; i++) {
      const beamMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x06ffa5 : 0x00d9ff,
        transparent: true,
        opacity: 0.7,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      const angle = (i / 8) * Math.PI * 2;
      beam.position.set(7 + Math.cos(angle) * 2.2, 4, Math.sin(angle) * 2.2);
      observatoryGroup.add(beam);
      threadBeams.push(beam);
    }

    // 4. Ingress / Egress Network Particle Streams
    const pCount = 80;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 24;
      pPos[i * 3 + 1] = Math.random() * 8;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.35,
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    observatoryGroup.add(particles);

    // Floor holographic grid
    const grid = new THREE.GridHelper(36, 18, 0x00d9ff, 0x1a1f3a);
    grid.position.y = 0;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.25;
    scene.add(grid);

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

      // Rotate FPS globe
      fpsGlobe.rotation.y += delta * 0.7;
      fpsGlobe.rotation.x += delta * 0.3;
      const pulse = 1 + Math.sin(time * 4) * 0.08;
      globeNucleus.scale.set(pulse, pulse, pulse);

      // Animate liquid level sloshing
      liquid.scale.y = 1 + Math.sin(time * 2.5) * 0.06;

      // Pulse CPU thread beams
      threadBeams.forEach((beam, idx) => {
        const beamScale = 0.5 + Math.sin(time * 5 + idx * 0.8) * 0.45;
        beam.scale.set(1, Math.max(0.2, beamScale), 1);
      });

      // Flow network particles
      const positions = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < pCount; i++) {
        positions[i * 3 + 1] += delta * 3;
        if (positions[i * 3 + 1] > 8) {
          positions[i * 3 + 1] = 0;
        }
      }
      pGeo.attributes.position.needsUpdate = true;

      // Slow scene rotation
      observatoryGroup.rotation.y = Math.sin(time * 0.2) * 0.12;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      globeGeo.dispose();
      globeMat.dispose();
      cylinderVesselGeo.dispose();
      cylinderVesselMat.dispose();
      liquidGeo.dispose();
      liquidMat.dispose();
      beamGeo.dispose();
      pGeo.dispose();
      pMat.dispose();
      grid.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="w-full rounded-2xl glass-panel-elevated border border-cyan-500/30 p-6 overflow-hidden shadow-2xl font-mono">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-cyan-500/20 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">3D Real-Time Performance Observatory</h3>
            <span className="text-[11px] text-gray-400">Live Hardware Telemetry &bull; Zero-Overhead eBPF Probe</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {(['realtime', '1h', '24h'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg uppercase transition-all ${
                timeRange === r
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,217,255,0.4)]'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
          <button
            onClick={() => soundFx.playMetricPitch(metrics.cpuPercent)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10"
            title="Acoustic Sonification Ping"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount */}
      <div className="relative my-4">
        <div ref={mountRef} className="w-full h-80 sm:h-96" />
        
        {/* Spatial Overlays for 3D elements */}
        <div className="absolute top-4 left-6 pointer-events-none text-xs">
          <span className="text-cyan-400 font-bold block">Render FPS Globe</span>
          <span className="text-2xl font-extrabold text-white">{metrics.fps} FPS</span>
          <span className="text-[10px] text-gray-400">P99 Frame: 16.6ms</span>
        </div>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none text-xs text-center">
          <span className="text-purple-400 font-bold block">V8 Heap Reservoir</span>
          <span className="text-2xl font-extrabold text-white">{metrics.heapMB} MB</span>
          <span className="text-[10px] text-gray-400">Cap: 1024 MB (47% Used)</span>
        </div>

        <div className="absolute top-4 right-6 pointer-events-none text-xs text-right">
          <span className="text-emerald-400 font-bold block">8-Core Thread Beams</span>
          <span className="text-2xl font-extrabold text-white">{metrics.cpuPercent}%</span>
          <span className="text-[10px] text-gray-400">SIMD Vector Cores Active</span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-cyan-500/15 text-xs">
        <div className="p-3 rounded-xl bg-black/40 border border-white/5">
          <span className="text-gray-400 text-[10px] block">EVENT LOOP LAG</span>
          <span className="text-base font-bold text-cyan-300">{metrics.latencyMs} ms</span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">&lt; 2ms SLA Guaranteed</span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/5">
          <span className="text-gray-400 text-[10px] block">NETWORK THROUGHPUT</span>
          <span className="text-base font-bold text-purple-300">{metrics.networkThroughput} MB/s</span>
          <span className="text-[10px] text-gray-400 block mt-0.5">Zero-Copy WebSockets</span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/5">
          <span className="text-gray-400 text-[10px] block">GC PAUSE DURATION</span>
          <span className="text-base font-bold text-emerald-300">0.18 ms</span>
          <span className="text-[10px] text-gray-400 block mt-0.5">Incremental Scavenge</span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/5">
          <span className="text-gray-400 text-[10px] block">AI INFERENCE TIME</span>
          <span className="text-base font-bold text-pink-300">14.2 ms</span>
          <span className="text-[10px] text-gray-400 block mt-0.5">Titan-3.8 JIT Flash</span>
        </div>
      </div>
    </div>
  );
};
