import { create } from 'zustand';
import { EditorFile, CursorPosition, AISuggestion, DiagnosticError } from '../types';

interface EditorStore {
  files: Record<string, EditorFile>;
  activeFileId: string;
  theme: 'vs-dark' | 'synthwave-cyber' | 'holographic';
  cursor: CursorPosition;
  isModified: boolean;
  suggestions: AISuggestion[];
  isSuggesting: boolean;
  diagnostics: DiagnosticError[];
  isAutoSaving: boolean;
  lastSavedAt: number | null;

  // Actions
  setActiveFile: (id: string) => void;
  updateCode: (content: string) => void;
  setCursor: (cursor: CursorPosition) => void;
  setTheme: (theme: 'vs-dark' | 'synthwave-cyber' | 'holographic') => void;
  setSuggestions: (suggestions: AISuggestion[]) => void;
  applySuggestion: (suggestionId: string) => void;
  addFile: (file: EditorFile) => void;
  saveFile: () => void;
  triggerAutoSave: () => void;
  setDiagnostics: (diagnostics: DiagnosticError[]) => void;
}

const DEFAULT_FILES: Record<string, EditorFile> = {
  'orchestrator.ts': {
    id: 'orchestrator.ts',
    name: 'orchestrator.ts',
    language: 'typescript',
    isModified: false,
    version: 1,
    content: `import { AgentSwarm, QuantumJIT } from '@codeforge/core';
import { WebSocketStream } from '@/backend/socket';

export class EngineOrchestrator {
  private swarm: AgentSwarm;
  private jit: QuantumJIT;

  constructor(private clusterId: string) {
    this.swarm = new AgentSwarm({ maxAgents: 5, topology: 'mesh' });
    this.jit = new QuantumJIT({ optLevel: 3, simd: true });
  }

  // Real-time AST pipeline synthesis with sub-millisecond execution
  public async compileHotpath(codeStream: string): Promise<CompiledKernel> {
    const ast = await this.swarm.dispatch('architecture', { source: codeStream });
    const verified = await this.swarm.dispatch('security', { ast });
    
    // Direct emission to SIMD machine vectors
    return this.jit.emitVectorMachineCode(verified.nodeTree);
  }
}`
  },
  'matrix_simd.rs': {
    id: 'matrix_simd.rs',
    name: 'matrix_simd.rs',
    language: 'rust',
    isModified: false,
    version: 1,
    content: `use std::arch::x86_64::*;
use codeforge_types::TensorView;

#[inline(always)]
pub unsafe fn vectorized_dot_product(a: *const f32, b: *const f32, len: usize) -> f32 {
    let mut sum_vec = _mm256_setzero_ps();
    let mut i = 0;

    while i + 8 <= len {
        let va = _mm256_loadu_ps(a.add(i));
        let vb = _mm256_loadu_ps(b.add(i));
        sum_vec = _mm256_fmadd_ps(va, vb, sum_vec);
        i += 8;
    }

    let mut buffer = [0.0f32; 8];
    _mm256_storeu_ps(buffer.as_mut_ptr(), sum_vec);
    buffer.iter().sum()
}`
  },
  'neural_rag.py': {
    id: 'neural_rag.py',
    name: 'neural_rag.py',
    language: 'python',
    isModified: false,
    version: 1,
    content: `import numpy as np
from dataclasses import dataclass

@dataclass(slots=True)
class HNSWMemoryNode:
    vector_id: int
    embedding: np.ndarray
    layer: int
    connections: list[int]

class FastASTIndex:
    def __init__(self, dim: int = 1536):
        self.dim = dim
        self.nodes = {}

    def query_nearest_symbols(self, query_emb: np.ndarray, k: int = 5) -> list[int]:
        """Sub-2ms Cosine similarity traversal over local shared memory"""
        return sorted(self.nodes.keys(), key=lambda nid: -np.dot(self.nodes[nid].embedding, query_emb))[:k]`
  }
};

let autoSaveTimer: NodeJS.Timeout | null = null;

export const useEditorStore = create<EditorStore>((set, get) => ({
  files: DEFAULT_FILES,
  activeFileId: 'orchestrator.ts',
  theme: 'vs-dark',
  cursor: { line: 1, column: 1 },
  isModified: false,
  suggestions: [
    {
      id: 'sug-1',
      label: 'Optimize SIMD Memory Alignment',
      description: 'Replace unaligned _mm256_loadu_ps with 32-byte aligned load to eliminate 14% cache latency.',
      confidence: 98.4,
      code: 'let va = _mm256_load_ps(a.add(i)); // 32-byte cacheline aligned'
    },
    {
      id: 'sug-2',
      label: 'Add Compile Guard & Error Boundary',
      description: 'Wrap compileHotpath in telemetry try/catch with automated rollback.',
      confidence: 94.1,
      code: 'try { return await this.jit.emit(); } catch (err) { this.swarm.dispatch("debug", err); }'
    }
  ],
  isSuggesting: false,
  diagnostics: [
    {
      id: 'diag-1',
      line: 14,
      column: 12,
      message: 'SIMD load should ensure 32-byte pointer alignment in 64-bit address space',
      severity: 'warning',
      codeRule: 'RUST-AVX2-ALIGN'
    }
  ],
  isAutoSaving: false,
  lastSavedAt: null,

  setActiveFile: (id: string) => {
    if (get().files[id]) {
      set({ activeFileId: id, isModified: false });
    }
  },

  updateCode: (content: string) => {
    const { activeFileId, files } = get();
    const current = files[activeFileId];
    if (!current) return;

    set({
      files: {
        ...files,
        [activeFileId]: {
          ...current,
          content,
          isModified: true,
          version: (current.version || 1) + 1,
        }
      },
      isModified: true,
    });

    // 1000ms Debounced Auto-Save
    get().triggerAutoSave();
  },

  setCursor: (cursor: CursorPosition) => set({ cursor }),
  setTheme: (theme) => set({ theme }),
  setSuggestions: (suggestions) => set({ suggestions }),

  applySuggestion: (suggestionId: string) => {
    const { suggestions, files, activeFileId } = get();
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    const current = files[activeFileId];
    if (!current) return;

    const newContent = current.content + '\n\n// ⚡ Applied AI Suggestion (' + suggestion.label + '):\n' + suggestion.code;
    set({
      files: {
        ...files,
        [activeFileId]: {
          ...current,
          content: newContent,
          isModified: true,
        }
      },
      isModified: true,
      suggestions: suggestions.filter(s => s.id !== suggestionId),
    });
  },

  addFile: (file: EditorFile) => {
    set((state) => ({
      files: { ...state.files, [file.id]: file },
      activeFileId: file.id,
    }));
  },

  saveFile: () => {
    const { activeFileId, files } = get();
    const current = files[activeFileId];
    if (!current) return;

    set({
      files: {
        ...files,
        [activeFileId]: { ...current, isModified: false }
      },
      isModified: false,
      isAutoSaving: false,
      lastSavedAt: Date.now(),
    });
  },

  triggerAutoSave: () => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    set({ isAutoSaving: true });

    autoSaveTimer = setTimeout(() => {
      get().saveFile();
    }, 1000);
  },

  setDiagnostics: (diagnostics) => set({ diagnostics })
}));
