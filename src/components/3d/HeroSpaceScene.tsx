import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const HeroSpaceScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0e27, 0.0018);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 80;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 1. Starfield Particles
    const starCount = 1800;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const cyanColor = new THREE.Color(0x00d9ff);
    const purpleColor = new THREE.Color(0x9d4edd);
    const whiteColor = new THREE.Color(0xe8e9f3);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      starPositions[idx] = (Math.random() - 0.5) * 350;
      starPositions[idx + 1] = (Math.random() - 0.5) * 300;
      starPositions[idx + 2] = (Math.random() - 0.5) * 300;

      // Color variation: 60% white, 25% cyan, 15% electric purple
      const rand = Math.random();
      const col = rand > 0.4 ? whiteColor : rand > 0.15 ? cyanColor : purpleColor;
      starColors[idx] = col.r;
      starColors[idx + 1] = col.g;
      starColors[idx + 2] = col.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    // Custom circular particle texture via procedural canvas
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(0, 217, 255, 0.8)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const starTexture = new THREE.CanvasTexture(canvas);

    const starMaterial = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      map: starTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starPoints = new THREE.Points(starGeometry, starMaterial);
    scene.add(starPoints);

    // 2. Floating Geometric Wireframe Objects
    const shapesGroup = new THREE.Group();
    scene.add(shapesGroup);

    // Icosahedron wireframe
    const icoGeo = new THREE.IcosahedronGeometry(12, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    icoMesh.position.set(-45, 18, -25);
    shapesGroup.add(icoMesh);

    // Dodecahedron wireframe
    const dodecaGeo = new THREE.DodecahedronGeometry(10, 0);
    const dodecaMat = new THREE.MeshBasicMaterial({
      color: 0x9d4edd,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const dodecaMesh = new THREE.Mesh(dodecaGeo, dodecaMat);
    dodecaMesh.position.set(48, -15, -30);
    shapesGroup.add(dodecaMesh);

    // Torus Knot floating in distance
    const torusGeo = new THREE.TorusKnotGeometry(7, 1.8, 64, 16);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x3a0ca3,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.position.set(-35, -28, -40);
    shapesGroup.add(torusMesh);

    // Floating Cyber Cubes
    const cubeCount = 12;
    const cubeMeshes: THREE.Mesh[] = [];
    const cubeGeo = new THREE.BoxGeometry(4, 4, 4);

    for (let i = 0; i < cubeCount; i++) {
      const cubeMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00d9ff : 0xff006e,
        wireframe: true,
        transparent: true,
        opacity: 0.2 + Math.random() * 0.2,
      });
      const cube = new THREE.Mesh(cubeGeo, cubeMat);
      cube.position.set(
        (Math.random() - 0.5) * 140,
        (Math.random() - 0.5) * 80,
        -10 + (Math.random() - 0.5) * 40
      );
      cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      shapesGroup.add(cube);
      cubeMeshes.push(cube);
    }

    // 3. Ambient Lighting & Subtle Grid
    const gridHelper = new THREE.GridHelper(260, 40, 0x00d9ff, 0x1a1f3a);
    gridHelper.position.y = -45;
    const gridMat = gridHelper.material as THREE.Material;
    gridMat.transparent = true;
    gridMat.opacity = 0.18;
    scene.add(gridHelper);

    // Mouse Parallax tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouse.targetX = (e.clientX - windowHalfX) * 0.035;
      mouse.targetY = (e.clientY - windowHalfY) * 0.035;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

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

    // Animation Loop with zero GC
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth camera interpolation
      mouse.x = THREE.MathUtils.damp(mouse.x, mouse.targetX, 4, delta);
      mouse.y = THREE.MathUtils.damp(mouse.y, mouse.targetY, 4, delta);

      camera.position.x = mouse.x;
      camera.position.y = -mouse.y;
      camera.lookAt(0, 0, 0);

      // Rotate starfield slowly
      starPoints.rotation.y += delta * 0.015;
      starPoints.rotation.x += delta * 0.005;

      // Rotate primary geometries
      icoMesh.rotation.x += delta * 0.2;
      icoMesh.rotation.y += delta * 0.3;
      dodecaMesh.rotation.y += delta * 0.25;
      dodecaMesh.rotation.z += delta * 0.15;
      torusMesh.rotation.x += delta * 0.35;
      torusMesh.rotation.y += delta * 0.2;

      // Animate floating cubes
      for (let i = 0; i < cubeMeshes.length; i++) {
        const cube = cubeMeshes[i];
        cube.rotation.x += delta * (0.2 + (i % 3) * 0.1);
        cube.rotation.y += delta * (0.2 + (i % 2) * 0.1);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      starTexture.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      dodecaGeo.dispose();
      dodecaMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      cubeGeo.dispose();
      gridHelper.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
};
