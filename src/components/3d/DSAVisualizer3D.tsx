import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, SkipForward, Sliders, BarChart3, Code2 } from 'lucide-react';

type AlgorithmType = 'quicksort' | 'bubblesort' | 'mergesort' | 'binarysearch';

interface AlgorithmMeta {
  name: string;
  timeBest: string;
  timeAvg: string;
  timeWorst: string;
  space: string;
  code: string;
}

const ALGORITHMS: Record<AlgorithmType, AlgorithmMeta> = {
  quicksort: {
    name: 'QuickSort (Lomuto Partition)',
    timeBest: 'O(n log n)',
    timeAvg: 'O(n log n)',
    timeWorst: 'O(n²)',
    space: 'O(log n)',
    code: `function quickSort(arr, low, high) {
  if (low < high) {
    let pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}`
  },
  bubblesort: {
    name: 'Bubble Sort with Early Exit',
    timeBest: 'O(n)',
    timeAvg: 'O(n²)',
    timeWorst: 'O(n²)',
    space: 'O(1)',
    code: `function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) swap(arr, j, j + 1);
    }
  }
}`
  },
  mergesort: {
    name: 'MergeSort (Divide & Conquer)',
    timeBest: 'O(n log n)',
    timeAvg: 'O(n log n)',
    timeWorst: 'O(n log n)',
    space: 'O(n)',
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)));
}`
  },
  binarysearch: {
    name: 'Binary Search (Sorted Array)',
    timeBest: 'O(1)',
    timeAvg: 'O(log n)',
    timeWorst: 'O(log n)',
    space: 'O(1)',
    code: `function binarySearch(arr, target) {
  let l = 0, r = arr.length - 1;
  while (l <= r) {
    let m = Math.floor((l + r) / 2);
    if (arr[m] === target) return m;
    if (arr[m] < target) l = m + 1; else r = m - 1;
  }
  return -1;
}`
  }
};

const DEFAULT_ARRAY = [45, 18, 82, 33, 91, 12, 64, 27, 73, 50, 95, 38];

export const DSAVisualizer3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [algo, setAlgo] = useState<AlgorithmType>('quicksort');
  const [array, setArray] = useState<number[]>([...DEFAULT_ARRAY]);
  const [activeIndices, setActiveIndices] = useState<[number, number]>([0, 1]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(300);
  const [stepCount, setStepCount] = useState<number>(0);

  const barsRef = useRef<THREE.Mesh[]>([]);

  // Three.js 3D Bar visualization setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 14, 28);
    camera.lookAt(0, 4, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const barsGroup = new THREE.Group();
    scene.add(barsGroup);

    // Floor grid
    const grid = new THREE.GridHelper(36, 18, 0x00d9ff, 0x1a1f3a);
    grid.position.y = 0;
    const gMat = grid.material as THREE.Material;
    gMat.transparent = true;
    gMat.opacity = 0.25;
    scene.add(grid);

    // Rebuild 3D Bars
    barsRef.current = [];
    const barWidth = 1.6;
    const spacing = 2.2;
    const totalW = array.length * spacing;

    array.forEach((val, i) => {
      const h = (val / 100) * 12 + 0.5;
      const geo = new THREE.BoxGeometry(barWidth, h, barWidth);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x00d9ff,
        wireframe: true,
      });
      const bar = new THREE.Mesh(geo, mat);
      bar.position.set(i * spacing - totalW / 2 + spacing / 2, h / 2, 0);
      barsGroup.add(bar);
      barsRef.current.push(bar);
    });

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

      // Subtle scene floating
      barsGroup.rotation.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      barsRef.current.forEach(b => {
        b.geometry.dispose();
        (b.material as THREE.Material).dispose();
      });
      grid.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [array]);

  // Update Bar highlights when activeIndices change
  useEffect(() => {
    barsRef.current.forEach((bar, i) => {
      const mat = bar.material as THREE.MeshBasicMaterial;
      if (i === activeIndices[0] || i === activeIndices[1]) {
        mat.color.setHex(0xff006e); // Comparing: holographic pink
      } else {
        mat.color.setHex(0x00d9ff); // Normal: neon cyan
      }
    });
  }, [activeIndices]);

  // Single step sorting simulation
  const stepSorting = () => {
    setArray((prev) => {
      const copy = [...prev];
      let swapped = false;
      for (let i = 0; i < copy.length - 1; i++) {
        if (copy[i] > copy[i + 1]) {
          const temp = copy[i];
          copy[i] = copy[i + 1];
          copy[i + 1] = temp;
          setActiveIndices([i, i + 1]);
          swapped = true;
          setStepCount((s) => s + 1);
          break;
        }
      }
      if (!swapped) {
        // Fully sorted
        setIsPlaying(false);
        barsRef.current.forEach(b => (b.material as THREE.MeshBasicMaterial).color.setHex(0x06ffa5));
      }
      return copy;
    });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        stepSorting();
      }, speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  const shuffleArray = () => {
    setIsPlaying(false);
    setStepCount(0);
    const shuffled = [...DEFAULT_ARRAY].sort(() => Math.random() - 0.5);
    setArray(shuffled);
    setActiveIndices([0, 1]);
  };

  const currentMeta = ALGORITHMS[algo];

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      {/* 3D Visualizer & Interactive Playback Panel */}
      <div className="lg:col-span-7 relative rounded-2xl glass-panel-elevated p-4 overflow-hidden border border-cyan-500/25">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-cyan-500/15 gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs font-semibold text-white">3D ALGORITHM PLAYGROUND</span>
          </div>

          {/* Algorithm Tabs */}
          <div className="flex items-center gap-1 bg-[#101538] p-1 rounded-lg border border-cyan-500/20">
            {(Object.keys(ALGORITHMS) as AlgorithmType[]).map((k) => (
              <button
                key={k}
                onClick={() => {
                  setAlgo(k);
                  shuffleArray();
                }}
                className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase transition-colors ${
                  algo === k
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Canvas Mount */}
        <div ref={mountRef} className="w-full h-72 sm:h-80" />

        {/* Playback Controls & Speed Bar */}
        <div className="pt-3 border-t border-cyan-500/15 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Visualize'}</span>
            </button>
            <button
              onClick={stepSorting}
              disabled={isPlaying}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 disabled:opacity-50"
            >
              <SkipForward className="w-3.5 h-3.5 text-cyan-400" />
              <span>Step</span>
            </button>
            <button
              onClick={shuffleArray}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
              title="Shuffle Elements"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-gray-400">
              <Sliders className="w-3 h-3" />
              <span className="text-[10px]">Speed</span>
              <input
                type="range"
                min="50"
                max="800"
                step="50"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-16 accent-cyan-400 cursor-pointer"
              />
            </div>
            <span className="text-[11px] text-cyan-300">
              Steps: <span className="font-bold">{stepCount}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Complexity Gauges & Algorithm Code */}
      <div className="lg:col-span-5 space-y-4">
        {/* Title & Complexity Matrix */}
        <div className="p-4 rounded-xl glass-card border border-purple-500/20 font-mono">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-500/20">
            <span className="text-xs text-purple-300 uppercase font-semibold">{currentMeta.name}</span>
            <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              OPTIMIZED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded bg-black/40 border border-white/5">
              <span className="text-[10px] text-gray-400 block">Best Case</span>
              <span className="text-emerald-400 font-bold">{currentMeta.timeBest}</span>
            </div>
            <div className="p-2.5 rounded bg-black/40 border border-white/5">
              <span className="text-[10px] text-gray-400 block">Average Case</span>
              <span className="text-cyan-400 font-bold">{currentMeta.timeAvg}</span>
            </div>
            <div className="p-2.5 rounded bg-black/40 border border-white/5">
              <span className="text-[10px] text-gray-400 block">Worst Case</span>
              <span className="text-pink-400 font-bold">{currentMeta.timeWorst}</span>
            </div>
            <div className="p-2.5 rounded bg-black/40 border border-white/5">
              <span className="text-[10px] text-gray-400 block">Space Complexity</span>
              <span className="text-purple-300 font-bold">{currentMeta.space}</span>
            </div>
          </div>
        </div>

        {/* Real-time Code Viewer */}
        <div className="p-4 rounded-xl glass-panel border border-cyan-500/20 font-mono">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/10 text-xs">
            <span className="text-cyan-300 flex items-center gap-1.5 font-semibold">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              IMPLEMENTATION KERNEL
            </span>
            <span className="text-[10px] text-gray-400">TypeScript / C++</span>
          </div>
          <pre className="text-xs text-gray-300 leading-relaxed overflow-x-auto bg-[#070b20] p-3 rounded-lg border border-white/5">
            <code>{currentMeta.code}</code>
          </pre>
          <p className="mt-2 text-[11px] text-gray-400">
            🤖 CodeForge synthesizes optimal algorithmic variants matching your memory latency and cache-line constraints.
          </p>
        </div>
      </div>
    </div>
  );
};
