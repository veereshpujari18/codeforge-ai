import React, { useState, useEffect, useRef } from 'react';
import { handTrackingService, HandPrediction } from '../../services/handTrackingService';
import { Hand, Camera, CameraOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../../utils/audioSonification';

export const HandTrackingHUD: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [prediction, setPrediction] = useState<HandPrediction | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const unsub = handTrackingService.subscribe((pred) => {
      setPrediction(pred);
    });

    return () => {
      unsub();
      handTrackingService.stop();
    };
  }, []);

  const handleToggleTracking = async () => {
    if (isActive) {
      handTrackingService.stop();
      setIsActive(false);
      setPrediction(null);
    } else {
      if (videoRef.current) {
        const success = await handTrackingService.startCamera(videoRef.current);
        setIsActive(true);
        soundFx.playQuantumCollapse();
      }
    }
  };

  return (
    <div className="rounded-xl glass-panel-elevated border border-cyan-500/25 p-4 font-mono text-xs shadow-xl space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Hand className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white">SPATIAL HAND GESTURE TRACKING (ML5 / WEBCAM)</span>
        </div>

        <button
          onClick={handleToggleTracking}
          className={`px-3 py-1 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
            isActive
              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold'
              : 'bg-cyan-500 text-black font-bold hover:bg-cyan-400'
          }`}
        >
          {isActive ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
          <span>{isActive ? 'Stop Tracking' : 'Enable Hand Tracking'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Video stream container */}
        <div className="md:col-span-5 relative rounded-lg overflow-hidden bg-black/60 aspect-video flex items-center justify-center border border-white/10">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${isActive ? 'block' : 'hidden'}`}
            muted
            playsInline
          />
          {!isActive && (
            <div className="text-center p-3 text-gray-500 text-[11px]">
              <Camera className="w-6 h-6 mx-auto mb-1 text-gray-600" />
              <span>Camera Stream Inactive</span>
            </div>
          )}

          {isActive && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-500/80 text-white text-[9px] font-bold animate-pulse">
              LIVE ML5 FEED
            </div>
          )}
        </div>

        {/* Prediction telemetry */}
        <div className="md:col-span-7 space-y-2">
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
            <div className="flex justify-between text-gray-400 text-[11px]">
              <span>Detected Gesture:</span>
              <span className="text-cyan-300 font-bold uppercase">{prediction?.gesture || 'None (Waiting for hand)'}</span>
            </div>
            <div className="flex justify-between text-gray-400 text-[11px]">
              <span>Confidence:</span>
              <span className="text-emerald-400 font-bold">{prediction ? `${(prediction.confidence * 100).toFixed(0)}%` : '0%'}</span>
            </div>
            <div className="flex justify-between text-gray-400 text-[11px]">
              <span>Keypoint Landmarks:</span>
              <span className="text-purple-300 font-bold">{prediction ? '21 Joints Resolved' : '0 Joints'}</span>
            </div>
          </div>

          <div className="text-[10px] text-gray-400">
            💡 Gestures mapped: <strong>Pinch</strong> to zoom 3D scene &bull; <strong>Open Palm</strong> to reset camera &bull; <strong>Index Point</strong> to select 3D agent
          </div>
        </div>
      </div>
    </div>
  );
};
