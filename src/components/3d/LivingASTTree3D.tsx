import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GitFork, Layers, Sparkles, AlertOctagon, CheckCircle2, RefreshCw, Cpu } from 'lucide-react';
import { soundFx } from '../../utils/audioSonification';

interface ASTNodeInfo {
  id: string;
  type: string;
  name: string;
  complexity: number;
  memoryBytes: number;
  details: string;
}

const AST_NODES: ASTNodeInfo[] = [
  { id: 'fn_main', type: 'FunctionDeclaration', name: 'processDataStream()', complexity: 8, memoryBytes: 2048, details: 'Main entry function; O(N) linear iteration over buffered stream.' },
  { id: 'loop_1', type: 'ForOfStatement', name: 'for (const chunk of stream)', complexity: 5, memoryBytes: 512, details: 'Inner stream consumer loop with zero-copy SIMD slice handling.' },
  { id: 'cond_1', type: 'IfStatement', name: 'if (chunk.isCorrupted)', complexity: 3, memoryBytes: 128, details: 'Conditional error guard branching into recovery handler.' },
  { id: 'var_buf', type: 'VariableDeclarator', name: 'const payloadBuffer', complexity: 1, memoryBytes: 4096, details: 'Pre-allocated typed Uint8Array memory slab in V8 heap.' }
];

export const LivingASTTree3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<ASTNodeInfo>(AST_NODES[0]);
  const [isFractured, setIsFractured] = useState(false);
  const [isHealing, setIsHealing] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 8, 22);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const treeGroup = new THREE.Group();
    scene.add(treeGroup);

    // 1. Function Box (Volume = Complexity)
    const fnGeo = new THREE.BoxGeometry(4.5, 6, 4.5);
    const fnMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const fnMesh = new THREE.Mesh(fnGeo, fnMat);
    fnMesh.position.set(-6, 2, 0);
    treeGroup.add(fnMesh);

    // 2. Loop Spiral (Torus Knot)
    const loopGeo = new THREE.TorusKnotGeometry(2.2, 0.5, 64, 16);
    const loopMat = new THREE.MeshBasicMaterial({
      color: 0x9d4edd,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const loopMesh = new THREE.Mesh(loopGeo, loopMat);
    loopMesh.position.set(0, 3, 0);
    treeGroup.add(loopMesh);

    // 3. Conditional Branching Fork (Pyramid / Cone)
    const condGeo = new THREE.ConeGeometry(2.5, 5, 4);
    const condMat = new THREE.MeshBasicMaterial({
      color: 0xff006e,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const condMesh = new THREE.Mesh(condGeo, condMat);
    condMesh.position.set(6, 2.5, 0);
    treeGroup.add(condMesh);

    // 4. Variable Floating Orb
    const varGeo = new THREE.SphereGeometry(1.8, 16, 16);
    const varMat = new THREE.MeshBasicMaterial({
      color: 0x06ffa5,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const varMesh = new THREE.Mesh(varGeo, varMat);
    varMesh.position.set(0, -3.5, 0);
    treeGroup.add(varMesh);

    // Dependency Light Beams connecting the nodes
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.45,
    });
    const points = [
      fnMesh.position,
      loopMesh.position,
      condMesh.position,
      varMesh.position,
      fnMesh.position
    ];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const beams = new THREE.Line(lineGeo, lineMat);
    treeGroup.add(beams);

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

      // Continuous rotations
      fnMesh.rotation.y += delta * 0.4;
      loopMesh.rotation.x += delta * 0.6;
      loopMesh.rotation.y += delta * 0.4;
      condMesh.rotation.y += delta * 0.5;
      varMesh.rotation.y += delta * 0.3;

      // Fracture effect logic
      if (isFractured) {
        fnMesh.position.x = -6 + Math.sin(time * 20) * 0.25;
        loopMesh.position.y = 3 + Math.sin(time * 25) * 0.3;
        (fnMesh.material as THREE.MeshBasicMaterial).color.setHex(0xff0044);
        (loopMesh.material as THREE.MeshBasicMaterial).color.setHex(0xffaa00);
      } else {
        fnMesh.position.x = -6;
        loopMesh.position.y = 3;
        (fnMesh.material as THREE.MeshBasicMaterial).color.setHex(0x00d9ff);
        (loopMesh.material as THREE.MeshBasicMaterial).color.setHex(0x9d4edd);
      }

      treeGroup.rotation.y = Math.sin(time * 0.25) * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      fnGeo.dispose();
      fnMat.dispose();
      loopGeo.dispose();
      loopMat.dispose();
      condGeo.dispose();
      condMat.dispose();
      varGeo.dispose();
      varMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isFractured]);

  const handleTriggerFracture = () => {
    setIsFractured(true);
    soundFx.playSonarPing();
  };

  const handleAutoHeal = () => {
    setIsHealing(true);
    soundFx.playQuantumCollapse();
    setTimeout(() => {
      setIsFractured(false);
      setIsHealing(false);
    }, 900);
  };

  return (
    <div className="w-full rounded-2xl glass-panel-elevated border border-purple-500/30 p-6 overflow-hidden shadow-2xl font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-purple-500/20 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">Living 3D Abstract Syntax Tree (AST)</h3>
            <span className="text-[11px] text-gray-400">Functions as Complexity Boxes &bull; Loops as Helices &bull; Conditionals as Forks</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerFracture}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition-colors flex items-center gap-1.5"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Simulate Syntax Fracture</span>
          </button>
          <button
            onClick={handleAutoHeal}
            disabled={!isFractured || isHealing}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            {isHealing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isHealing ? 'Healing Geometries...' : 'AI Auto-Heal AST'}</span>
          </button>
        </div>
      </div>

      {/* 3D Visualizer */}
      <div className="relative my-4">
        <div ref={mountRef} className="w-full h-80 sm:h-96" />

        {/* Status Pill overlay */}
        <div className="absolute top-3 left-4 p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs">
          <span className="text-gray-400 block text-[10px]">AST HEALTH STATUS</span>
          <span className={`font-bold flex items-center gap-1.5 ${isFractured ? 'text-red-400' : 'text-emerald-400'}`}>
            {isFractured ? '⚠️ 2 Syntax Fractures Detected' : '✓ 100% Structurally Sound'}
          </span>
        </div>
      </div>

      {/* Interactive Node Selector & Inspector */}
      <div className="pt-4 border-t border-purple-500/15 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-6 flex flex-wrap gap-2">
          {AST_NODES.map((node) => {
            const isSelected = selectedNode.id === node.id;
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`p-2 rounded-lg text-xs font-mono transition-all text-left ${
                  isSelected
                    ? 'bg-purple-500/30 text-white border border-purple-400 font-bold shadow-[0_0_12px_rgba(157,78,221,0.3)]'
                    : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                <div className="text-[10px] text-purple-300 uppercase">{node.type}</div>
                <div className="text-white truncate max-w-[180px]">{node.name}</div>
              </button>
            );
          })}
        </div>

        <div className="md:col-span-6 p-4 rounded-xl bg-black/40 border border-white/10 text-xs space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <span className="text-purple-300 font-bold">{selectedNode.name}</span>
            <span className="text-[10px] text-gray-400">Cyclomatic: {selectedNode.complexity}</span>
          </div>
          <p className="text-gray-300 text-[11px] leading-relaxed">
            {selectedNode.details}
          </p>
          <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
            <span>Allocated Heap: {selectedNode.memoryBytes} bytes</span>
            <span className="text-cyan-400">JIT Inlining Candidate: YES</span>
          </div>
        </div>
      </div>
    </div>
  );
};
