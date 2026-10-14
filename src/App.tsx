import React, { useState, useEffect } from 'react';
import { Navbar } from './components/sections/Navbar';
import { HeroSection } from './components/sections/HeroSection';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { HandTrackingHUD } from './components/hand/HandTrackingHUD';
import { AdaptiveContextStudio } from './components/sections/AdaptiveContextStudio';
import { CodeGenerationSection } from './components/sections/CodeGenerationSection';
import { AdvancedDebuggingSection } from './components/sections/AdvancedDebuggingSection';
import { CodeReviewDiffSection } from './components/sections/CodeReviewDiffSection';
import { CodeExplanationSection } from './components/sections/CodeExplanationSection';
import { SecurityMatrixSection } from './components/sections/SecurityMatrixSection';
import { RAGSection } from './components/sections/RAGSection';
import { DSAAlgorithmsSection } from './components/sections/DSAAlgorithmsSection';
import { AgentWorkflowSection } from './components/sections/AgentWorkflowSection';
import { InfiniteZoomSection } from './components/sections/InfiniteZoomSection';
import { PricingSection } from './components/sections/PricingSection';
import { Footer } from './components/sections/Footer';
import { DeveloperWorkspaceModal } from './components/workspace/DeveloperWorkspaceModal';
import { FloatingTerminal } from './components/ui/FloatingTerminal';
import { CommandPalette } from './components/ui/CommandPalette';
import { socketService } from './services/socketService';
import { gestureRecognizer } from './services/gestureRecognition';

export default function App() {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Initialize WebSocket connection & Gesture listener (Step 5 & Step 12)
  useEffect(() => {
    socketService.initialize();
    gestureRecognizer.attach(document.body);

    const unsubGesture = gestureRecognizer.subscribe((gesture) => {
      if (gesture.type === 'swipe' && gesture.direction === 'down') {
        setIsCommandPaletteOpen(true);
      }
    });

    return () => {
      unsubGesture();
      gestureRecognizer.detach(document.body);
      socketService.disconnect();
    };
  }, []);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e27] text-[#e8e9f3] selection:bg-cyan-500/30 selection:text-white relative">
      {/* Navigation Header */}
      <Navbar
        onOpenWorkspace={() => setIsWorkspaceOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Hero Section with 3D Spacefield & Suspended 3D IDE Centerpiece */}
      <HeroSection onOpenWorkspace={() => setIsWorkspaceOpen(true)} />

      {/* STEP 13: Main Production Dashboard (Editor, Debug, Performance, Agent, Collab tabs) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <MainDashboard />
        {/* STEP 17: Spatial Hand Gesture Tracking HUD (ML5 / WebCam) */}
        <div className="mt-4">
          <HandTrackingHUD />
        </div>
      </div>

      {/* Adaptive Context Studio (Observatory, Living AST, Helix Timeline, Quantum Superposition, Holographic Terminal) */}
      <AdaptiveContextStudio />

      {/* Section 1: AI Code Generation */}
      <CodeGenerationSection />

      {/* Section 2: Advanced 3D Debugging */}
      <AdvancedDebuggingSection />

      {/* Section 3: Code Review & 3D Diff */}
      <CodeReviewDiffSection />

      {/* Section 4: Line-by-Line Code Explanation */}
      <CodeExplanationSection />

      {/* Section 5: Security & Threat Shield */}
      <SecurityMatrixSection />

      {/* Section 6: RAG-Powered 3D Project Knowledge Graph */}
      <RAGSection />

      {/* Section 7: DSA & Algorithms Lab */}
      <DSAAlgorithmsSection />

      {/* Section 8: Multi-Agent Autonomous Swarm with Bezier Data Flow */}
      <AgentWorkflowSection />

      {/* 7-Tier Infinite Zoom LOD (Galaxy to Silicon) */}
      <InfiniteZoomSection />

      {/* Pricing Tiers & Value Matrix */}
      <PricingSection onSelectTier={() => setIsWorkspaceOpen(true)} />

      {/* Footer */}
      <Footer />

      {/* Functional Full Developer Workspace Modal */}
      <DeveloperWorkspaceModal
        isOpen={isWorkspaceOpen}
        onClose={() => setIsWorkspaceOpen(false)}
      />

      {/* Floating Interactive Terminal Easter Egg */}
      <FloatingTerminal />

      {/* Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onLaunchWorkspace={() => setIsWorkspaceOpen(true)}
      />
    </div>
  );
}
