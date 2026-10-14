import { SystemMetrics } from '../types';
import { socketService } from './socketService';

export class PerformanceMonitor {
  private fps: number = 60;
  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private lastBroadcast: number = 0;
  private renderTimeMs: number = 1.2;
  private animationId: number | null = null;
  private listeners: Set<(metrics: SystemMetrics) => void> = new Set();

  constructor() {
    this.startTracking();
  }

  private startTracking() {
    const loop = (now: number) => {
      this.frameCount++;
      const delta = now - this.lastTime;

      if (delta >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / delta);
        this.frameCount = 0;
        this.lastTime = now;

        const metrics = this.collectMetrics();
        this.listeners.forEach((fn) => fn(metrics));

        // Broadcast to backend via WebSocket every 2 seconds
        if (now - this.lastBroadcast > 2000) {
          socketService.emitMetricsUpdate(metrics);
          this.lastBroadcast = now;
        }
      }

      this.animationId = requestAnimationFrame(loop);
    };

    this.animationId = requestAnimationFrame(loop);
  }

  public recordRenderTime(durationMs: number) {
    this.renderTimeMs = Math.round(durationMs * 100) / 100;
  }

  public collectMetrics(): SystemMetrics {
    // 1. Memory tracking
    let memoryMb = 482;
    if (typeof window !== 'undefined' && (performance as any).memory) {
      const mem = (performance as any).memory;
      memoryMb = Math.round(mem.usedJSHeapSize / (1024 * 1024));
    }

    // 2. CPU estimation based on frame delta & memory
    const cpuEstimate = Math.min(
      95,
      Math.max(12, Math.round((1 - Math.min(1, this.fps / 60)) * 60 + (memoryMb / 1024) * 25 + 10))
    );

    // 3. Latency from navigation timing
    let latencyMs = 1.4;
    if (typeof window !== 'undefined' && performance.getEntriesByType) {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries.length > 0 && navEntries[0].responseEnd && navEntries[0].requestStart) {
        latencyMs = Math.max(0.8, Math.round((navEntries[0].responseEnd - navEntries[0].requestStart) * 10) / 10);
      }
    }

    return {
      fps: this.fps,
      cpuPercent: cpuEstimate,
      memoryMb,
      renderTimeMs: this.renderTimeMs,
      latencyMs,
      timestamp: Date.now(),
    };
  }

  public subscribe(callback: (metrics: SystemMetrics) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public destroy() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.listeners.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();
