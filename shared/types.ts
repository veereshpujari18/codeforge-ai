/**
 * Shared types between Frontend and Backend for CodeForge AI
 */

export type AgentType = 'synthesis' | 'security' | 'architecture' | 'debug' | 'deploy';
export type AgentStatus = 'idle' | 'working' | 'error' | 'complete';
export type ParticleType = 'code' | 'data' | 'error' | 'success';

export interface AgentMetric {
  successRate: number; // 0 - 100
  avgTime: number;     // ms
  totalTasks: number;
}

export interface AgentTask {
  id: string;
  title: string;
  agentType: AgentType;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  payload?: any;
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  progress: number; // 0 - 100
  health: number;   // 0 - 100
  currentTask?: string;
  metrics: AgentMetric;
  lastActive: number;
}

export interface SystemMetrics {
  fps: number;
  cpuPercent: number;
  memoryMb: number;
  renderTimeMs: number;
  latencyMs: number;
  timestamp: number;
}

export interface AISuggestion {
  id: string;
  label: string;
  description: string;
  confidence: number; // 0 - 100
  code: string;
  diffTargetLine?: number;
}

export interface DiagnosticError {
  id: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  codeRule?: string;
}

export interface StackFrameData {
  id: string;
  funcName: string;
  file: string;
  line: number;
  execTimeMs: number; // Red = slow (>50ms), Yellow = medium (>10ms), Cyan = fast
  variables: Record<string, string | number | boolean>;
  callDepth: number;
}

export interface GestureState {
  type: 'none' | 'pinch' | 'swipe' | 'rotate' | 'longpress' | 'tap2' | 'dwell';
  scale?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  velocity?: number;
  angle?: number;
  dwellTarget?: string;
}

export interface SocketEvents {
  'code:update': (payload: { fileId: string; content: string; cursor?: { line: number; ch: number } }) => void;
  'metrics:update': (payload: SystemMetrics) => void;
  'agent:action': (payload: { agentId: string; action: string; taskId?: string }) => void;
  'ai:suggestions': (payload: { fileId: string; suggestions: AISuggestion[] }) => void;
}
