import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Search, Database, Layers, Network, FileCode, CheckCircle, ArrowRight } from 'lucide-react';

interface GraphNode {
  id: string;
  name: string;
  type: 'core' | 'ai' | 'db' | 'security' | 'wasm';
  x: number;
  y: number;
  z: number;
  deps: string[];
  tokens: string;
  summary: string;
}

const GRAPH_NODES: GraphNode[] = [
  { id: 'app', name: 'App.tsx', type: 'core', x: 0, y: 0, z: 0, deps: ['rag', 'auth', 'wasm'], tokens: '2.4k', summary: 'Top-level UI router and state orchestrator' },
  { id: 'rag', name: 'rag_engine.py', type: 'ai', x: 8, y: 5, z: -4, deps: ['vector_db', 'embed'], tokens: '8.1k', summary: '1536-dim cosine similarity graph pipeline' },
  { id: 'vector_db', name: 'vector_store.bin', type: 'db', x: 12, y: -4, z: 2, deps: ['embed'], tokens: '14.2k', summary: 'HNSW vector index with quantized embeddings' },
  { id: 'embed', name: 'tokenizer.rs', type: 'wasm', x: 6, y: -7, z: -5, deps: [], tokens: '5.6k', summary: 'Zero-copy BPE token streamer compiled to WASM' },
  { id: 'auth', name: 'auth_jwt.go', type: 'security', x: -8, y: 4, z: 5, deps: ['db_pool'], tokens: '3.9k', summary: 'Ed25519 signature validator & RBAC policy' },
  { id: 'db_pool', name: 'db_pool.go', type: 'db', x: -11, y: -3, z: 0, deps: [], tokens: '4.2k', summary: 'High-throughput connection pooling with healthchecks' },
  { id: 'wasm', name: 'simd_jit.wasm', type: 'wasm', x: -4, y: -6, z: 6, deps: [], tokens: '18.0k', summary: 'SIMD x86_64 accelerated AST compilation unit' }
];

export const RAGKnowledgeGraph3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('rag');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedNode = GRAPH_NODES.find(n => n.id === selectedNodeId) || GRAPH_NODES[0];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 26);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const graphGroup = new THREE.Group();
    scene.add(graphGroup);

    // Node colors mapping
    const typeColorMap: Record<string, number> = {
      core: 0xe8e9f3,
      ai: 0x00d9ff,
      db: 0x9d4edd,
      security: 0xff006e,
      wasm: 0x06ffa5,
    };

    // Create 3D Nodes
    const nodeMeshes: { mesh: THREE.Mesh; node: GraphNode }[] = [];
    const sphereGeo = new THREE.SphereGeometry(1.2, 24, 24);

    GRAPH_NODES.forEach((node) => {
      const color = typeColorMap[node.type] || 0x00d9ff;
      const mat = new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
      });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.position.set(node.x, node.y, node.z);
      graphGroup.add(mesh);
      nodeMeshes.push({ mesh, node });

      // Core nucleus
      const coreGeo = new THREE.SphereGeometry(0.5, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      mesh.add(coreMesh);
    });

    // Create Lines connecting dependencies
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.35,
    });

    GRAPH_NODES.forEach((source) => {
      source.deps.forEach((targetId) => {
        const target = GRAPH_NODES.find(n => n.id === targetId);
        if (target) {
          const points = [
            new THREE.Vector3(source.x, source.y, source.z),
            new THREE.Vector3(target.x, target.y, target.z)
          ];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(lineGeo, lineMat);
          graphGroup.add(line);
        }
      });
    });

    // Orbiting particle stream along graph
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const rad = 10 + Math.random() * 4;
      const angle = (i / particleCount) * Math.PI * 2;
      particlePos[i * 3] = Math.cos(angle) * rad;
      particlePos[i * 3 + 1] = Math.sin(angle) * (rad * 0.4);
      particlePos[i * 3 + 2] = Math.sin(angle) * rad;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.4,
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    graphGroup.add(particles);

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix;
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Gentle auto-rotation
      graphGroup.rotation.y += delta * 0.15;
      graphGroup.rotation.x = Math.sin(time * 0.4) * 0.08;

      // Pulse selected node
      nodeMeshes.forEach(({ mesh, node }) => {
        if (node.id === selectedNodeId) {
          const s = 1.3 + Math.sin(time * 5) * 0.15;
          mesh.scale.set(s, s, s);
        } else {
          mesh.scale.set(1, 1, 1);
        }
        mesh.rotation.y += delta * 0.5;
      });

      // Rotate particle stream
      particles.rotation.y -= delta * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      sphereGeo.dispose();
      lineMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [selectedNodeId]);

  const filteredNodes = GRAPH_NODES.filter(n =>
    n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      {/* 3D Visualizer Viewport */}
      <div className="lg:col-span-7 relative rounded-2xl glass-panel-elevated p-4 overflow-hidden border border-cyan-500/25">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-white">RAG SEMANTIC CODE GRAPH</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>1,536-D Vector Embedding Active</span>
          </div>
        </div>

        {/* 3D Canvas */}
        <div ref={mountRef} className="w-full h-80 sm:h-96" />

        {/* Node quick selector bar */}
        <div className="pt-3 border-t border-cyan-500/15 flex flex-wrap gap-2">
          {GRAPH_NODES.map((n) => {
            const isSelected = n.id === selectedNodeId;
            return (
              <button
                key={n.id}
                onClick={() => setSelectedNodeId(n.id)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-md transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,217,255,0.4)]'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                }`}
              >
                {n.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Node Context & Relationship Inspector */}
      <div className="lg:col-span-5 space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symbols or files (e.g., auth, token, wasm)..."
            className="w-full bg-[#111638] border border-cyan-500/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        {/* Selected Node Card */}
        <div className="p-5 rounded-2xl glass-card border border-cyan-500/30">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-cyan-400" />
              <div>
                <h4 className="text-base font-bold font-mono text-white">{selectedNode.name}</h4>
                <span className="text-[10px] uppercase font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  CATEGORY: {selectedNode.type}
                </span>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs text-gray-400 block">Token Weight</span>
              <span className="text-sm font-bold text-emerald-400">{selectedNode.tokens}</span>
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-300 leading-relaxed">
            {selectedNode.summary}
          </p>

          {/* Dependencies / Connections */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block mb-2 font-semibold">
              Resolved Downstream Dependencies:
            </span>
            {selectedNode.deps.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.deps.map((depId) => {
                  const depNode = GRAPH_NODES.find(n => n.id === depId);
                  return (
                    <button
                      key={depId}
                      onClick={() => setSelectedNodeId(depId)}
                      className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                    >
                      <ArrowRight className="w-3 h-3 text-purple-400" />
                      <span>{depNode ? depNode.name : depId}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <span className="text-xs font-mono text-gray-500 italic">Leaf node (no outgoing dependencies)</span>
            )}
          </div>
        </div>

        {/* Context Features Highlight */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#141a3f]/70 border border-white/10">
            <span className="text-gray-400 block text-[10px]">RAG RETRIEVAL SPEED</span>
            <span className="text-sm font-bold text-cyan-400">1.8ms P95</span>
          </div>
          <div className="p-3 rounded-xl bg-[#141a3f]/70 border border-white/10">
            <span className="text-gray-400 block text-[10px]">CROSS-FILE REFS</span>
            <span className="text-sm font-bold text-purple-400">100% Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
};
