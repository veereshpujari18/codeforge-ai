import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AICoreOrbProps {
  size?: number;
  className?: string;
  themeColor?: 'cyan' | 'purple' | 'pink' | 'green';
}

export const AICoreOrb: React.FC<AICoreOrbProps> = ({ 
  size = 280, 
  className = '',
  themeColor = 'cyan'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Color definitions
    const colors = {
      cyan: { core: 0x00d9ff, ring1: 0x00d9ff, ring2: 0x9d4edd, particle: 0x00d9ff },
      purple: { core: 0x9d4edd, ring1: 0x9d4edd, ring2: 0xff006e, particle: 0x9d4edd },
      pink: { core: 0xff006e, ring1: 0xff006e, ring2: 0x00d9ff, particle: 0xff006e },
      green: { core: 0x06ffa5, ring1: 0x06ffa5, ring2: 0x00d9ff, particle: 0x06ffa5 },
    }[themeColor];

    // Core Group
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    // 1. Central Wireframe/Icosahedron Sphere
    const innerGeo = new THREE.IcosahedronGeometry(3.6, 2);
    const innerMat = new THREE.MeshBasicMaterial({
      color: colors.core,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    orbGroup.add(innerCore);

    // 2. Solid Inner glowing nucleus
    const nucleusGeo = new THREE.SphereGeometry(2.0, 32, 32);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    orbGroup.add(nucleus);

    // 3. Gyroscopic Ring 1
    const ring1Geo = new THREE.TorusGeometry(5.4, 0.08, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: colors.ring1,
      transparent: true,
      opacity: 0.7,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    orbGroup.add(ring1);

    // 4. Gyroscopic Ring 2
    const ring2Geo = new THREE.TorusGeometry(6.2, 0.08, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: colors.ring2,
      transparent: true,
      opacity: 0.55,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 2.5;
    orbGroup.add(ring2);

    // 5. Gyroscopic Ring 3 (Equatorial)
    const ring3Geo = new THREE.TorusGeometry(7.0, 0.06, 16, 100);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0x3a0ca3,
      transparent: true,
      opacity: 0.45,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI / 3;
    orbGroup.add(ring3);

    // 6. Orbiting Code Nodes
    const nodeCount = 12;
    const nodeMeshes: THREE.Mesh[] = [];
    const nodeGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const nodeMat = new THREE.MeshBasicMaterial({ color: colors.particle });

    for (let i = 0; i < nodeCount; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      orbGroup.add(node);
      nodeMeshes.push(node);
    }

    // Particle field around orb
    const pCount = 90;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const rad = 4.5 + Math.random() * 4.0;
      pPos[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
      pPos[i * 3 + 2] = rad * Math.cos(phi);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.35,
      color: colors.core,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    orbGroup.add(particles);

    // Animation loop with zero GC
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Pulse nucleus scale
      const scale = 1 + Math.sin(time * 3) * 0.08;
      nucleus.scale.set(scale, scale, scale);

      // Rotate core
      innerCore.rotation.x += delta * 0.35;
      innerCore.rotation.y += delta * 0.45;

      // Rotate rings at varying speeds
      ring1.rotation.x += delta * 0.6;
      ring1.rotation.y += delta * 0.4;

      ring2.rotation.y += delta * 0.5;
      ring2.rotation.z += delta * 0.3;

      ring3.rotation.x += delta * 0.3;
      ring3.rotation.z += delta * 0.7;

      // Orbit code nodes along ring paths
      for (let i = 0; i < nodeMeshes.length; i++) {
        const angle = time * 0.8 + (i * (Math.PI * 2)) / nodeCount;
        const radius = i % 2 === 0 ? 5.4 : 6.2;
        nodeMeshes[i].position.set(
          Math.cos(angle) * radius,
          Math.sin(angle * 1.5) * 2.2,
          Math.sin(angle) * radius
        );
        nodeMeshes[i].rotation.x += delta * 2;
        nodeMeshes[i].rotation.y += delta * 2;
      }

      // Rotate particle cloud
      particles.rotation.y += delta * 0.2;
      particles.rotation.x += delta * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, themeColor]);

  return (
    <div 
      ref={mountRef} 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    />
  );
};
