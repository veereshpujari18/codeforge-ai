import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { StackFrameData } from '../../types';
import { Bug, Clock, Cpu, ArrowRight } from 'lucide-react';
import { soundFx } from '../../utils/audioSonification';

const DEFAULT_STACK_FRAMES: StackFrameData[] = [
  { id: 'frame-1', funcName: 'main()', file: 'index.ts', line: 12, execTimeMs: 1.2, callDepth: 0, variables: { env: 'production', cluster: 'us-east' } },
  { id: 'frame-2', funcName: 'EngineOrchestrator.compileHotpath()', file: 'orchestrator.ts', line: 18, execTimeMs: 8.4, callDepth: 1, variables: { optLevel: 3, simd: true } },
  { id: 'frame-3', funcName: 'QuantumJIT.emitVectorMachineCode()', file: 'jit.rs', line: 72, execTimeMs: 64.8, callDepth: 2, variables: { passes: 4, cache_miss: 0, unroll_factor: 8 } }, // Red = slow!
  { id: 'frame-4', funcName: 'vectorized_dot_product()', file: 'matrix_simd.rs', line: 15, execTimeMs: 2.1, callDepth: 3, variables: { len: 4096, reg_alloc: 'ymm0..ymm7' } },
  { id: 'frame-5', funcName: 'FastASTIndex.query_nearest()', file: 'neural_rag.py', line: 24, execTimeMs: 14.5, callDepth: 4, variables: { k: 5, dim: 1536 } } // Yellow = medium
];

export const CallStackHelix3D: React.FC<{ onSelectFrame?: (frame: StackFrameData) => void }> = ({ onSelectFrame }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedFrameId, setSelectedFrameId] = useState<string>('frame-3');
  const [hoveredFrameId, setHoveredFrameId] = useState<string | null>(null);

  const activeFrame = DEFAULT_STACK_FRAMES.find(f => f.id === selectedFrameId) || DEFAULT_STACK_FRAMES[2];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 6, 26);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const helixGroup = new THREE.Group();
    scene.add(helixGroup);

    // 1. Helix Curve via CatmullRomCurve3 (Step 9 requirement)
    const curvePoints: THREE.Vector3[] = [];
    const framePoints: { pos: THREE.Vector3; frame: StackFrameData }[] = [];
    const totalSteps = 48;
    const radius = 5.0;
    const heightSpan = 18;

    for (let i = 0; i <= totalSteps; i++) {
      const t = i / totalSteps;
      const angle = t * Math.PI * 4; // 2 complete loops
      const y = t * heightSpan - heightSpan / 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const pt = new THREE.Vector3(x, y, z);
      curvePoints.push(pt);
    }

    const helixCurve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(helixCurve, 64, 0.15, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({ color: 0x00d9ff, transparent: true, opacity: 0.6 });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    helixGroup.add(tubeMesh);

    // 2. Frame Markers as Spheres with Glow Effects & Color Coding (Step 9)
    // Red = slow (>50ms), Yellow = medium (>10ms), Cyan = fast (<10ms)
    const markerSpheres: { mesh: THREE.Mesh; frame: StackFrameData }[] = [];
    const sphereGeo = new THREE.SphereGeometry(0.85, 24, 24);

    DEFAULT_STACK_FRAMES.forEach((frame, idx) => {
      const t = (idx + 0.5) / DEFAULT_STACK_FRAMES.length;
      const pos = helixCurve.getPoint(t);

      // Color coding rule
      const colorHex = frame.execTimeMs > 50 
        ? 0xff006e // Slow (Red/Pink)
        : frame.execTimeMs > 10 
        ? 0xffbe0b // Medium (Yellow)
        : 0x00d9ff; // Fast (Cyan)

      const mat = new THREE.MeshBasicMaterial({
        color: colorHex,
        wireframe: true,
      });

      const sphere = new THREE.Mesh(sphereGeo, mat);
      sphere.position.copy(pos);
      sphere.castShadow = true;
      helixGroup.add(sphere);

      // Inner glowing core
      const glowGeo = new THREE.SphereGeometry(0.45, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      sphere.add(glowMesh);

      markerSpheres.push({ mesh: sphere, frame });
    });

    // Raycaster for interactive hover/click detection (Step 9)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markerSpheres.map(m => m.mesh));
      if (intersects.length > 0) {
        const hit = markerSpheres.find(m => m.mesh === intersects[0].object || m.mesh === intersects[0].object.parent);
        if (hit) {
          setHoveredFrameId(hit.frame.id);
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredFrameId(null);
        container.style.cursor = 'default';
      }
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markerSpheres.map(m => m.mesh));
      if (intersects.length > 0) {
        const hit = markerSpheres.find(m => m.mesh === intersects[0].object || m.mesh === intersects[0].object.parent);
        if (hit) {
          setSelectedFrameId(hit.frame.id);
          if (onSelectFrame) onSelectFrame(hit.frame);
          soundFx.playSonarPing();
        }
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handleClick);

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

      // Gentle auto-rotation
      helixGroup.rotation.y += delta * 0.3;

      // Animate active and hovered markers
      markerSpheres.forEach(({ mesh, frame }) => {
        const isSelected = frame.id === selectedFrameId;
        const isHovered = frame.id === hoveredFrameId;
        
        if (isSelected) {
          const s = 1.35 + Math.sin(time * 5) * 0.15;
          mesh.scale.set(s, s, s);
        } else if (isHovered) {
          mesh.scale.set(1.2, 1.2, 1.2);
        } else {
          mesh.scale.set(1.0, 1.0, 1.0);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      tubeGeo.dispose();
      tubeMat.dispose();
      sphereGeo.dispose();
      markerSpheres.forEach(m => (m.mesh.material as THREE.Material).dispose());
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [selectedFrameId, hoveredFrameId]);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center font-mono">
      {/* 3D Visualizer Canvas */}
      <div className="lg:col-span-7 rounded-2xl glass-panel-elevated border border-cyan-500/30 p-4 relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 text-xs">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-pink-400" />
            <span className="font-bold text-white">3D EXECUTION HELIX CALL STACK</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1 text-pink-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-pink-500" /> Slow (&gt;50ms)
            </span>
            <span className="flex items-center gap-1 text-yellow-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-yellow-500" /> Med (&gt;10ms)
            </span>
            <span className="flex items-center gap-1 text-cyan-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Fast (&lt;10ms)
            </span>
          </div>
        </div>

        <div ref={mountRef} className="w-full h-80 sm:h-96" />

        <div className="pt-2 text-center text-[10px] text-gray-400">
          Click or hover any sphere on the CatmullRom helix to inspect frame registers & execution latency
        </div>
      </div>

      {/* Frame Data Inspector */}
      <div className="lg:col-span-5 space-y-4">
        {/* Selected Frame Card */}
        <div className="p-5 rounded-2xl glass-card border border-cyan-500/30">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <div>
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-bold">
                FRAME STACK DEPTH: #{activeFrame.callDepth}
              </span>
              <h4 className="text-base font-bold text-white">{activeFrame.funcName}</h4>
            </div>
            <div className={`px-2.5 py-1 rounded text-xs font-bold border ${
              activeFrame.execTimeMs > 50
                ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                : activeFrame.execTimeMs > 10
                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
            }`}>
              {activeFrame.execTimeMs} ms
            </div>
          </div>

          <div className="text-xs text-gray-400 mb-3">
            Source: <code className="text-cyan-300">{activeFrame.file}:{activeFrame.line}</code>
          </div>

          <div className="pt-2 border-t border-white/5 space-y-1.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
              Local Variables & Register State:
            </span>
            {Object.entries(activeFrame.variables).map(([k, v]) => (
              <div key={k} className="p-2 rounded bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-gray-400">{k}:</span>
                <span className="text-emerald-400 font-semibold">{String(v)}</span>
              </div>
            ))}
          </div>

          {activeFrame.execTimeMs > 50 && (
            <div className="mt-4 p-2.5 rounded-lg bg-pink-500/15 border border-pink-500/30 text-[11px] text-pink-200">
              ⚡ Bottleneck: QuantumJIT compilation took 64.8ms. Recommend enabling speculative multi-threaded JIT compilation.
            </div>
          )}
        </div>

        {/* Stack Frames Quick List */}
        <div className="space-y-1.5">
          {DEFAULT_STACK_FRAMES.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setSelectedFrameId(f.id);
                soundFx.playSonarPing();
              }}
              className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between ${
                f.id === selectedFrameId
                  ? 'bg-cyan-500/20 text-white border border-cyan-500/40 font-bold'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className={`w-2 h-2 rounded-full ${f.execTimeMs > 50 ? 'bg-pink-500' : f.execTimeMs > 10 ? 'bg-yellow-400' : 'bg-cyan-400'}`} />
                <span className="truncate">{f.funcName}</span>
              </div>
              <span className="text-[11px] text-gray-400 shrink-0">{f.execTimeMs}ms</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
