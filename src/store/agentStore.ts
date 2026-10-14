import { create } from 'zustand';
import { Agent, AgentType, AgentStatus, AgentTask } from '../types';

interface AgentStore {
  agents: Record<string, Agent>;
  selectedAgentId: string | null;
  tasks: AgentTask[];
  globalProgress: number;

  // Actions
  selectAgent: (id: string | null) => void;
  updateAgentStatus: (id: string, status: AgentStatus, progress?: number) => void;
  updateAgentHealth: (id: string, health: number) => void;
  enqueueTask: (task: Omit<AgentTask, 'id'>) => void;
  completeTask: (taskId: string) => void;
  filterAgentsByType: (type: AgentType) => Agent[];
  filterAgentsByStatus: (status: AgentStatus) => Agent[];
  dispatchSwarmPulse: () => void;
}

const INITIAL_AGENTS: Record<string, Agent> = {
  'synthesis': {
    id: 'synthesis',
    name: 'Synthesis Coder Agent',
    type: 'synthesis',
    status: 'working',
    progress: 74,
    health: 99.8,
    currentTask: 'Synthesizing AVX2 loop unrolling kernel',
    lastActive: Date.now(),
    metrics: { successRate: 99.4, avgTime: 240, totalTasks: 182 }
  },
  'security': {
    id: 'security',
    name: 'Security Sentinel Agent',
    type: 'security',
    status: 'working',
    progress: 88,
    health: 98.9,
    currentTask: 'Tracing tainted buffer pointers & memory bounds',
    lastActive: Date.now(),
    metrics: { successRate: 100.0, avgTime: 180, totalTasks: 96 }
  },
  'architecture': {
    id: 'architecture',
    name: 'Architecture Agent',
    type: 'architecture',
    status: 'complete',
    progress: 100,
    health: 100.0,
    currentTask: 'OpenAPI 3.1 & Proto3 contract verified',
    lastActive: Date.now(),
    metrics: { successRate: 98.8, avgTime: 310, totalTasks: 64 }
  },
  'debug': {
    id: 'debug',
    name: 'Time-Travel Debug Agent',
    type: 'debug',
    status: 'idle',
    progress: 0,
    health: 97.5,
    currentTask: 'Standby for memory anomaly & race condition reports',
    lastActive: Date.now(),
    metrics: { successRate: 96.2, avgTime: 420, totalTasks: 48 }
  },
  'deploy': {
    id: 'deploy',
    name: 'Canary Deployment Agent',
    type: 'deploy',
    status: 'idle',
    progress: 0,
    health: 100.0,
    currentTask: 'Awaiting smoke test validation',
    lastActive: Date.now(),
    metrics: { successRate: 100.0, avgTime: 850, totalTasks: 22 }
  }
};

const INITIAL_TASKS: AgentTask[] = [
  {
    id: 't-1',
    title: 'AVX2 Vectorization optimization for matrix_simd.rs',
    agentType: 'synthesis',
    status: 'in_progress',
    priority: 'high',
    progress: 74,
  },
  {
    id: 't-2',
    title: 'Static Taint Analysis on IPC sockets',
    agentType: 'security',
    status: 'in_progress',
    priority: 'critical',
    progress: 88,
  },
  {
    id: 't-3',
    title: 'AST Schema validation against TypeScript 5.8',
    agentType: 'architecture',
    status: 'completed',
    priority: 'medium',
    progress: 100,
  },
  {
    id: 't-4',
    title: 'Fuzzing memory allocations with AddressSanitizer',
    agentType: 'debug',
    status: 'pending',
    priority: 'medium',
    progress: 0,
  }
];

export const useAgentStore = create<AgentStore>((set, get) => ({
  agents: INITIAL_AGENTS,
  selectedAgentId: 'synthesis',
  tasks: INITIAL_TASKS,
  globalProgress: 72,

  selectAgent: (id) => set({ selectedAgentId: id }),

  updateAgentStatus: (id, status, progress) => {
    const { agents } = get();
    const current = agents[id];
    if (!current) return;

    set({
      agents: {
        ...agents,
        [id]: {
          ...current,
          status,
          progress: progress !== undefined ? progress : current.progress,
          lastActive: Date.now(),
        }
      }
    });
  },

  updateAgentHealth: (id, health) => {
    const { agents } = get();
    const current = agents[id];
    if (!current) return;

    set({
      agents: {
        ...agents,
        [id]: { ...current, health }
      }
    });
  },

  enqueueTask: (task) => {
    const newTask: AgentTask = {
      ...task,
      id: `task-${Date.now()}`
    };
    set((state) => ({
      tasks: [newTask, ...state.tasks]
    }));
  },

  completeTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'completed', progress: 100 } : t)
    }));
  },

  filterAgentsByType: (type) => {
    return Object.values(get().agents).filter(a => a.type === type);
  },

  filterAgentsByStatus: (status) => {
    return Object.values(get().agents).filter(a => a.status === status);
  },

  dispatchSwarmPulse: () => {
    const { agents } = get();
    const updated: Record<string, Agent> = {};

    Object.entries(agents).forEach(([key, ag]) => {
      const isWorking = Math.random() > 0.3;
      updated[key] = {
        ...ag,
        status: isWorking ? 'working' : ag.status === 'complete' ? 'complete' : 'idle',
        progress: isWorking ? Math.min(100, ag.progress + Math.floor(Math.random() * 15)) : ag.progress,
        health: Math.min(100, Math.max(90, ag.health + (Math.random() * 2 - 1))),
        lastActive: Date.now(),
      };
    });

    const activeList = Object.values(updated);
    const avgProgress = Math.round(activeList.reduce((acc, a) => acc + a.progress, 0) / activeList.length);

    set({
      agents: updated,
      globalProgress: avgProgress
    });
  }
}));
