import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Video, Download, Share2, Disc } from 'lucide-react';
import { soundFx } from '../../utils/audioSonification';

export const SessionReplayBar: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [seconds, setSeconds] = useState(42);
  const totalSeconds = 120;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setSeconds((prev) => (prev >= totalSeconds ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl glass-panel-elevated border border-cyan-500/25 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-xl select-none">
      {/* Recording status badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-bold text-[10px]">SESSION RECORDER</span>
        </div>
        <span className="text-gray-400 text-[11px] hidden sm:inline">3D State & Agent Logs Indexed</span>
      </div>

      {/* Scrubber & playback buttons */}
      <div className="flex-1 flex items-center gap-3 max-w-md mx-2">
        <button
          onClick={() => {
            setIsPlaying(!isPlaying);
            soundFx.playSonarPing();
          }}
          className="p-1.5 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors"
          title={isPlaying ? 'Pause Replay' : 'Play Replay'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => setSeconds(0)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
          title="Rewind to Beginning"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <span className="text-[11px] text-cyan-300 w-10 text-right">{formatTime(seconds)}</span>
        <input
          type="range"
          min={0}
          max={totalSeconds}
          value={seconds}
          onChange={(e) => setSeconds(Number(e.target.value))}
          className="flex-1 accent-cyan-400 cursor-pointer"
        />
        <span className="text-[11px] text-gray-400 w-10">{formatTime(totalSeconds)}</span>
      </div>

      {/* Export / Share actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => soundFx.playCommandChirp()}
          className="flex items-center gap-1 text-[11px] text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded border border-white/10 transition-colors"
        >
          <Share2 className="w-3 h-3 text-cyan-400" />
          <span className="hidden sm:inline">Share Replay</span>
        </button>
      </div>
    </div>
  );
};
