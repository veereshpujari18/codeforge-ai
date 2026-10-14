import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { performanceMonitor } from '../../services/performanceMonitor';
import { socketService } from '../../services/socketService';
import { 
  FileCode, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  Copy, 
  Save, 
  Download, 
  Cpu, 
  Activity, 
  Terminal,
  Zap
} from 'lucide-react';
import { soundFx } from '../../utils/audioSonification';

export const CodeEditorComponent: React.FC<{ className?: string }> = ({ className = '' }) => {
  const {
    files,
    activeFileId,
    setActiveFile,
    updateCode,
    cursor,
    setCursor,
    isModified,
    suggestions,
    applySuggestion,
    saveFile,
    isAutoSaving,
    diagnostics,
  } = useEditorStore();

  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(1.2);
  const [copied, setCopied] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeFile = files[activeFileId] || Object.values(files)[0];

  // Subscribe to performance metrics overlay (Step 11)
  useEffect(() => {
    const unsub = performanceMonitor.subscribe((m) => {
      setFps(m.fps);
      setLatency(m.latencyMs);
    });
    return unsub;
  }, []);

  // Keyboard shortcuts (Step 11: Cmd+Space for suggestions, Cmd+S to save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
        soundFx.playCommandChirp();
      } else if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault();
        setShowSuggestions((prev) => !prev);
        soundFx.playSonarPing();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveFile]);

  const handleCursorMove = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const pos = target.selectionStart;
    const lines = target.value.substring(0, pos).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    setCursor({ line, column });

    // Emit live cursor & code update to socket
    socketService.emitCodeUpdate(activeFile.id, target.value, { line, column });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative flex flex-col h-full rounded-2xl glass-panel-elevated border border-cyan-500/25 overflow-hidden font-mono ${className}`}>
      {/* Top File Tabs & Action Bar */}
      <div className="px-4 py-2 bg-[#0e1333] border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 select-none">
        {/* File tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {Object.values(files).map((file) => {
            const isActive = file.id === activeFileId;
            return (
              <button
                key={file.id}
                onClick={() => {
                  setActiveFile(file.id);
                  soundFx.playSonarPing();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(0,217,255,0.2)]'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>{file.name}</span>
                {file.isModified && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </button>
            );
          })}
        </div>

        {/* Diagnostic Errors Overlay (Top-Right) (Step 11) */}
        <div className="flex items-center gap-3 text-xs">
          {diagnostics.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{diagnostics.length} Diagnostics</span>
            </div>
          )}

          {/* Performance metrics overlay (Step 11) */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-black/40 border border-white/10 text-[11px] text-gray-400">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Activity className="w-3 h-3" />
              {fps} FPS
            </span>
            <span>&bull;</span>
            <span className="text-cyan-300">{latency}ms</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={saveFile}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10"
              title="Save (Cmd+S)"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10"
              title="Copy Source"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="flex-1 relative flex overflow-hidden bg-[#070b20]">
        {/* Line numbers gutter */}
        <div className="select-none py-3 px-3 text-right bg-[#050818] border-r border-cyan-500/10 text-gray-600 text-xs font-mono leading-relaxed min-w-[3rem]">
          {activeFile.content.split('\n').map((_, idx) => (
            <div key={idx} className={idx + 1 === cursor.line ? 'text-cyan-400 font-bold' : ''}>
              {idx + 1}
            </div>
          ))}
        </div>

        {/* Textarea code container */}
        <div className="flex-1 relative p-3 overflow-auto">
          <textarea
            ref={textareaRef}
            value={activeFile.content}
            onChange={(e) => updateCode(e.target.value)}
            onKeyUp={handleCursorMove}
            onClick={handleCursorMove}
            className="w-full h-full bg-transparent border-none text-xs sm:text-sm font-mono text-gray-200 leading-relaxed resize-none focus:outline-none selection:bg-cyan-500/30"
            spellCheck="false"
          />
        </div>
      </div>

      {/* AI Suggestions Panel (Bottom Overlay) (Step 11) */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="p-3 bg-[#0c1236]/95 border-t border-cyan-500/30 backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/20 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              AI Synthesizer Suggestions (Press Cmd+Space to toggle)
            </span>
            <span className="text-[10px] text-gray-400">Titan-3.8 Engine</span>
          </div>

          <div className="space-y-2">
            {suggestions.map((sug) => (
              <div
                key={sug.id}
                className="p-2.5 rounded-lg bg-black/40 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{sug.label}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">{sug.confidence}% Match</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">{sug.description}</p>
                </div>

                <button
                  onClick={() => {
                    applySuggestion(sug.id);
                    soundFx.playCommandChirp();
                  }}
                  className="px-3 py-1 rounded-md bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors"
                >
                  Apply Patch
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor Status Bar */}
      <div className="px-4 py-1.5 bg-[#090d24] border-t border-cyan-500/15 flex flex-wrap items-center justify-between text-[11px] text-gray-400 select-none">
        <div className="flex items-center gap-3">
          <span>Ln {cursor.line}, Col {cursor.column}</span>
          <span>&bull;</span>
          <span>UTF-8</span>
          <span>&bull;</span>
          <span className="text-cyan-400 font-bold uppercase">{activeFile.language}</span>
        </div>

        <div className="flex items-center gap-3">
          {isAutoSaving ? (
            <span className="text-yellow-400 font-bold animate-pulse">Auto-saving...</span>
          ) : isModified ? (
            <span className="text-cyan-300">Unsaved changes</span>
          ) : (
            <span className="text-emerald-400">✓ All changes saved</span>
          )}
        </div>
      </div>
    </div>
  );
};
