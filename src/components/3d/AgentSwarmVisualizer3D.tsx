import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAgentStore } from '../../store/agentStore';
import { AgentType } from '../../types';
import { soundFx } from '../../utils/audioSonification';

export const AgentSwarmVisualizer3D: React.FC<{ className?: string }> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { agents, selectedAgentId, selectAgent } = useAgentStore();

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 10, 24);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const swarmGroup = new THREE.Group();
    scene.add(swarmGroup);

    // 1. Central Orchestrator Sphere (IcosahedronGeometry with glow) (Step 10)
    const orchestratorGeo = new THREE.IcosahedronGeometry(3.0, 2);
    const orchestratorMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const centralOrchestrator = new THREE.Mesh(orchestratorGeo, orchestratorMat);
    swarmGroup.add(centralOrchestrator);

    const innerPulse = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
    );
    centralOrchestrator.add(innerPulse);

    // 2. 5 Orbiting Agents with Type-Specific Geometries (Step 10)
    const agentGeometries: Record<AgentType, THREE.BufferGeometry> = {
      synthesis: new THREE.DodecahedronGeometry(1.2),
      security: new THREE.OctahedronGeometry(1.3),
      architecture: new THREE.CylinderGeometry(0.8, 0.8, 2.0, 16),
      debug: new THREE.TorusKnotGeometry(0.8, 0.25, 32, 8),
      deploy: new THREE.ConeGeometry(1.0, 2.2, 16),
    };

    const agentColorMap: Record<AgentType, number> = {
      synthesis: 0x00d9ff,
      security: 0xff006e,
      architecture: 0x9d4edd,
      debug: 0x06ffa5,
      deploy: 0xffbe0b,
    };

    const agentMeshes: {
      id: string;
      type: AgentType;
      mesh: THREE.Mesh;
      radius: number;
      speed: number;
      offset: number;
    }[] = [];

    const agentKeys: AgentType[] = ['synthesis', 'security', 'architecture', 'debug', 'deploy'];

    agentKeys.forEach((type, idx) => {
      const geo = agentGeometries[type];
      const mat = new THREE.MeshBasicMaterial({
        color: agentColorMap[type],
        wireframe: true,
      });
      const mesh = new THREE.Mesh(geo, mat);

      // Staggered orbital mechanics (Step 10)
      const radius = 7.5 + (idx % 2) * 2.2;
      const speed = 0.5 + idx * 0.12;
      const offset = (idx / agentKeys.length) * Math.PI * 2;

      mesh.position.set(Math.cos(offset) * radius, 0, Math.sin(offset) * radius);
      swarmGroup.add(mesh);

      agentMeshes.push({ id: type, type, mesh, radius, speed, offset });
    });

    // 3. Flowing Energy Particles on Connections (Step 10)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleT = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particleT[i] = Math.random();
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.35,
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const energyPoints = new THREE.Points(particleGeo, particleMat);
    swarmGroup.add(energyPoints);

    // 4. Collaboration Lines Between Working Agents (Step 10)
    const collabLineMat = new THREE.LineBasicMaterial({
      color: 0x06ffa5,
      transparent: true,
      opacity: 0.6,
    });
    const collabLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    const collabLine = new THREE.Line(collabLineGeo, collabLineMat);
    swarmGroup.add(collabLine);

    // Interactive Raycasting for Agent Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(agentMeshes.map(a => a.mesh));

      if (intersects.length > 0) {
        const hit = agentMeshes.find(a => a.mesh === intersects[0].object);
        if (hit) {
          selectAgent(hit.id);
          soundFx.playSonarPing();
        }
      }
    };

    container.addEventListener('click', handlePointerClick);

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

      // Central orchestrator rotation & breathing
      centralOrchestrator.rotation.y += delta * 0.4;
      centralOrchestrator.rotation.x += delta * 0.25;
      const pulse = 1 + Math.sin(time * 4) * 0.1;
      innerPulse.scale.set(pulse, pulse, pulse);

      // Staggered orbital mechanics for 5 agents (Step 10)
      agentMeshes.forEach(({ id, mesh, radius, speed, offset }) => {
        const currentAngle = time * speed + offset;
        mesh.position.set(
          Math.cos(currentAngle) * radius,
          Math.sin(currentAngle * 2) * 1.5,
          Math.sin(currentAngle) * radius
        );
        mesh.rotation.y += delta * 1.5;
        mesh.rotation.x += delta * 0.8;

        // Interactive Selection Scale Animation (Step 10)
        if (id === selectedAgentId) {
          const selScale = 1.45 + Math.sin(time * 6) * 0.15;
          mesh.scale.set(selScale, selScale, selScale);
        } else {
          mesh.scale.set(1.0, 1.0, 1.0);
        }
      });

      // Update Flowing Energy Particles from Central Orchestrator to Agents (Step 10)
      const pPositions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        particleT[i] = (particleT[i] + delta * 0.6) % 1.0;
        const targetAgent = agentMeshes[i % agentMeshes.length];
        const t = particleT[i];

        // Linear interpolation from center to agent position
        pPositions[i * 3] = targetAgent.mesh.position.x * t;
        pPositions[i * 3 + 1] = targetAgent.mesh.position.y * t;
        pPositions[i * 3 + 2] = targetAgent.mesh.position.z * t;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Update Collaboration line between Synthesis & Security agents
      if (agentMeshes[0] && agentMeshes[1]) {
        const p1 = agentMeshes[0].mesh.position;
        const p2 = agentMeshes[1].mesh.position;
        collabLine.geometry.setFromPoints([p1, p2]);
      }

      swarmGroup.rotation.y = Math.sin(time * 0.1) * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('click', handlePointerClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      orchestratorGeo.dispose();
      orchestratorMat.dispose();
      innerPulse.geometry.dispose();
      Object.values(agentGeometries).forEach(g => g.dispose());
      particleGeo.dispose();
      particleMat.dispose();
      collabLineGeo.dispose();
      collabLineMat.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [selectedAgentId]);

  return (
    <div className={`relative w-full h-80 sm:h-96 ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center text-[10px] text-gray-400 font-mono bg-black/60 px-3 py-1 rounded-full border border-white/10 pointer-events-none">
        Click any 3D agent to inspect telemetry & active workloads
      </div>
    </div>
  );
};
