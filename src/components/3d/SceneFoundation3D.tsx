import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ParticleType } from '../../types';
import { performanceMonitor } from '../../services/performanceMonitor';

interface SceneFoundationProps {
  className?: string;
  onSelectGeometry?: (id: string) => void;
  particleTypeFilter?: ParticleType;
}

export const SceneFoundation3D: React.FC<SceneFoundationProps> = ({
  className = '',
  onSelectGeometry,
  particleTypeFilter,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0e27, 0.0015);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 10, 48);
    camera.lookAt(0, 0, 0);

    // 2. WebGL Renderer with 2048px Shadow Maps (Step 3)
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Lighting System (Step 3: Ambient + Directional with 2048 shadow + Point lighting)
    const ambientLight = new THREE.AmbientLight(0x1a1f3a, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00d9ff, 2.5);
    dirLight.position.set(25, 45, 25);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 120;
    dirLight.shadow.camera.left = -30;
    dirLight.shadow.camera.right = 30;
    dirLight.shadow.camera.top = 30;
    dirLight.shadow.camera.bottom = -30;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xff006e, 3, 60);
    pointLight.position.set(-18, 12, 10);
    scene.add(pointLight);

    const cyanPointLight = new THREE.PointLight(0x00d9ff, 3, 60);
    cyanPointLight.position.set(18, -8, 15);
    scene.add(cyanPointLight);

    // 4. 1000-Star Field with Depth (Step 3)
    const starCount = 1000;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      starPositions[idx] = (Math.random() - 0.5) * 300;
      starPositions[idx + 1] = (Math.random() - 0.5) * 200;
      starPositions[idx + 2] = (Math.random() - 0.5) * 240;

      const isCyan = Math.random() > 0.4;
      starColors[idx] = isCyan ? 0.0 : 0.6;
      starColors[idx + 1] = isCyan ? 0.85 : 0.3;
      starColors[idx + 2] = isCyan ? 1.0 : 0.9;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 5. Central AI Core (IcosahedronGeometry with glow) (Step 3)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const coreGeo = new THREE.IcosahedronGeometry(4.5, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00d9ff,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.8,
    });
    const aiCore = new THREE.Mesh(coreGeo, coreMat);
    aiCore.castShadow = true;
    coreGroup.add(aiCore);

    // Inner glowing sphere nucleus
    const innerNucleus = new THREE.Mesh(
      new THREE.SphereGeometry(2.5, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })
    );
    coreGroup.add(innerNucleus);

    // 6. 3 Orbiting Rings (TorusGeometry) (Step 3)
    const ring1Geo = new THREE.TorusGeometry(7.5, 0.1, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x00d9ff, transparent: true, opacity: 0.7 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    coreGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(9.0, 0.1, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x9d4edd, transparent: true, opacity: 0.6 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    coreGroup.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(10.5, 0.08, 16, 100);
    const ring3Mat = new THREE.MeshBasicMaterial({ color: 0xff006e, transparent: true, opacity: 0.5 });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI / 4;
    coreGroup.add(ring3);

    // 7. 5 Floating Code Geometries with Random Rotation (Step 3)
    const floatingGeometries: THREE.Mesh[] = [];
    const geoTemplates = [
      new THREE.BoxGeometry(2.2, 2.2, 2.2),
      new THREE.TetrahedronGeometry(2.2),
      new THREE.OctahedronGeometry(2.0),
      new THREE.DodecahedronGeometry(1.8),
      new THREE.TorusGeometry(1.6, 0.4, 16, 32),
    ];
    const geoColors = [0x00d9ff, 0x9d4edd, 0xff006e, 0x06ffa5, 0xffbe0b];

    geoTemplates.forEach((geo, i) => {
      const mat = new THREE.MeshStandardMaterial({
        color: geoColors[i],
        wireframe: true,
        roughness: 0.3,
        metalness: 0.7,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const angle = (i / 5) * Math.PI * 2;
      const radius = 17 + Math.random() * 4;
      mesh.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 14, Math.sin(angle) * radius);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      floatingGeometries.push(mesh);
    });

    // 8. Advanced Particle System (1000 Count, 4 Types, Gravity, SizeAttenuation) (Step 4)
    const particleCount = 1000;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const lifespans = new Float32Array(particleCount);

    const typeColorMap: Record<ParticleType, THREE.Color> = {
      code: new THREE.Color(0x00d9ff),
      data: new THREE.Color(0x9d4edd),
      error: new THREE.Color(0xff006e),
      success: new THREE.Color(0x06ffa5),
    };

    const types: ParticleType[] = ['code', 'data', 'error', 'success'];

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      positions[idx] = (Math.random() - 0.5) * 50;
      positions[idx + 1] = Math.random() * 30 - 10;
      positions[idx + 2] = (Math.random() - 0.5) * 50;

      velocities[idx] = (Math.random() - 0.5) * 0.4;
      velocities[idx + 1] = Math.random() * 0.6 + 0.2; // upward velocity
      velocities[idx + 2] = (Math.random() - 0.5) * 0.4;

      const pType = types[i % 4];
      const col = typeColorMap[pType];
      particleColors[idx] = col.r;
      particleColors[idx + 1] = col.g;
      particleColors[idx + 2] = col.b;

      lifespans[i] = Math.random() * 5 + 1; // 1 to 6 seconds
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true, // Step 4 requirement
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Gravity constant for particle physics
    const gravity = -0.005;

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Render Loop
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const startTime = performance.now();
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Rotate starfield
      starPoints.rotation.y += delta * 0.02;

      // Rotate AI Core & Inner Nucleus
      aiCore.rotation.x += delta * 0.4;
      aiCore.rotation.y += delta * 0.6;
      const pulse = 1 + Math.sin(time * 3.5) * 0.08;
      innerNucleus.scale.set(pulse, pulse, pulse);

      // Rotate Torus Rings
      ring1.rotation.x += delta * 0.8;
      ring1.rotation.y += delta * 0.5;
      ring2.rotation.y += delta * 0.7;
      ring2.rotation.z += delta * 0.4;
      ring3.rotation.x += delta * 0.5;
      ring3.rotation.z += delta * 0.9;

      // Rotate 5 floating code geometries
      floatingGeometries.forEach((geom, idx) => {
        geom.rotation.x += delta * (0.3 + (idx % 3) * 0.15);
        geom.rotation.y += delta * (0.4 + (idx % 2) * 0.2);
        geom.position.y += Math.sin(time * 2 + idx) * 0.04;
      });

      // Update 1000 GPU-accelerated Particles with Gravity lifecycle (Step 4)
      const posArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;

        // Apply velocity
        posArr[idx] += velocities[idx];
        posArr[idx + 1] += velocities[idx + 1];
        posArr[idx + 2] += velocities[idx + 2];

        // Apply Gravity
        velocities[idx + 1] += gravity;

        // Respawn if below ground or expired
        if (posArr[idx + 1] < -20 || posArr[idx + 1] > 35) {
          posArr[idx] = (Math.random() - 0.5) * 35;
          posArr[idx + 1] = -5 + Math.random() * 5;
          posArr[idx + 2] = (Math.random() - 0.5) * 35;

          velocities[idx] = (Math.random() - 0.5) * 0.35;
          velocities[idx + 1] = Math.random() * 0.5 + 0.3; // shoot up
          velocities[idx + 2] = (Math.random() - 0.5) * 0.35;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Render Scene
      renderer.render(scene, camera);

      // Report render time to performance monitor (Step 6)
      performanceMonitor.recordRenderTime(performance.now() - startTime);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      starGeo.dispose();
      starMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      innerNucleus.geometry.dispose();
      (innerNucleus.material as THREE.Material).dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      geoTemplates.forEach(g => g.dispose());
      particleGeo.dispose();
      particleMat.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [particleTypeFilter]);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
};
