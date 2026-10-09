"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Repeat, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { isPressableTarget, isTypingTarget } from "@/lib/keyboard";
import { TIMELINE_EVENT, dispatchTimeline } from "@/characters/_core/useTimeline";

export function AnimationPlayerBar({
  elementId = "character-workspace",
  durationMs,
  totalFrames = 48,
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const requestRef = useRef(null);
  const lastTimeRef = useRef(null);
  const progressRef = useRef(0);
  const animateRef = useRef(null);
  const isExportingRef = useRef(false);

  // Sync progressRef dengan state progress
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Listen external export events to pause the player immediately
  useEffect(() => {
    const handleExternalTimeline = (e) => {
      if (e.detail?.isExporting) {
        isExportingRef.current = true;
        setIsPlaying(false);
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
          requestRef.current = null;
        }
      } else if (e.detail && !e.detail.isExporting && isExportingRef.current) {
        isExportingRef.current = false;
      }
    };
    window.addEventListener(TIMELINE_EVENT, handleExternalTimeline);
    return () => window.removeEventListener(TIMELINE_EVENT, handleExternalTimeline);
  }, []);

  // Broadcast sinyal kontrol ke karakter (CSS & Framer Motion)
  const broadcastTimelineState = useCallback((prog, playing) => {
    // Jangan broadcast jika sedang dalam proses export
    if (isExportingRef.current) return;

    // Gunakan queueMicrotask agar dispatchEvent dipanggil di luar render cycle React
    queueMicrotask(() => {
      if (isExportingRef.current) return;
      dispatchTimeline({ progress: prog, isPlaying: playing, durationMs, isExporting: false });
    });

    const element = document.getElementById(elementId);
    if (element) {
      const targetTimeMs = Math.round(prog * durationMs);
      element.style.setProperty("--seek-time", `-${targetTimeMs}ms`);

      let styleEl = document.getElementById("timeline-player-style");
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "timeline-player-style";
        document.head.appendChild(styleEl);
      }

      if (!playing) {
        styleEl.innerHTML = `
          #${elementId}, #${elementId} * {
            animation-play-state: paused !important;
            animation-delay: -${targetTimeMs}ms !important;
            transition: none !important;
          }
        `;
      } else if (styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
    }
  }, [elementId, durationMs]);

  const animate = useCallback((currentTime) => {
    // Jika sedang export, batalkan animation loop
    if (isExportingRef.current) {
      setIsPlaying(false);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      return;
    }

    if (!lastTimeRef.current) lastTimeRef.current = currentTime;
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    const prevProgress = progressRef.current;
    let nextProgress = prevProgress + (deltaTime * speed) / durationMs;
    let playing = true;

    if (nextProgress >= 1) {
      if (isLooping) {
        nextProgress = nextProgress % 1;
      } else {
        nextProgress = 1;
        playing = false;
      }
    }

    progressRef.current = nextProgress;
    setProgress(nextProgress);

    if (!playing) {
      setIsPlaying(false);
    }

    broadcastTimelineState(nextProgress, playing);

    if (playing && !isExportingRef.current) {
      requestRef.current = requestAnimationFrame((t) => animateRef.current?.(t));
    }
  }, [speed, durationMs, isLooping, broadcastTimelineState]);

  useEffect(() => {
    animateRef.current = animate;
  }, [animate]);

  useEffect(() => {
    if (isPlaying && !isExportingRef.current) {
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame((t) => animateRef.current?.(t));
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (!isExportingRef.current) {
        broadcastTimelineState(progressRef.current, false);
      }
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, broadcastTimelineState]);

  // Keyboard shortcut (Space bar)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Spasi diabaikan di kolom ketik dan di elemen yang punya aksi spasi sendiri
      // (tombol, select, switch), supaya tidak memicu dua aksi sekaligus.
      if (
        e.code === "Space" &&
        !isTypingTarget(e.target) &&
        !isPressableTarget(e.target)
      ) {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSliderChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    setIsPlaying(false);
    progressRef.current = newProgress;
    setProgress(newProgress);
    broadcastTimelineState(newProgress, false);
  };

  const handleReset = () => {
    progressRef.current = 0;
    setProgress(0);
    broadcastTimelineState(0, isPlaying);
  };

  const currentFrame = Math.min(Math.floor(progress * totalFrames) + 1, totalFrames);
  const currentTimeSec = (progress * (durationMs / 1000)).toFixed(1);
  const totalTimeSec = (durationMs / 1000).toFixed(1);

  return (
    <div className="w-full bg-surface border border-border rounded-2xl px-4 py-2.5 flex items-center gap-3 select-none">
      <button
        type="button"
        onClick={() => setIsPlaying(!isPlaying)}
        className="p-2 rounded-xl bg-surface-secondary hover:bg-surface-hover text-foreground transition-all cursor-pointer shrink-0"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>

      <button
        type="button"
        onClick={handleReset}
        className="p-2 rounded-xl text-subtle hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer shrink-0"
      >
        <RotateCcw size={15} />
      </button>

      <div className="text-[11px] font-mono font-medium tabular-nums text-muted shrink-0 min-w-[70px] text-center">
        <span>{currentTimeSec}s</span> / <span>{totalTimeSec}s</span>
        <span className="text-[10px] opacity-60 block">{currentFrame}/{totalFrames}f</span>
      </div>

      <div className="flex-1 flex items-center relative">
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onChange={handleSliderChange}
          className="w-full h-1.5 bg-surface-secondary rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={() => setIsLooping(!isLooping)}
        className={cn(
          "p-2 rounded-xl transition-colors cursor-pointer shrink-0",
          isLooping ? "text-accent bg-accent-soft" : "text-muted hover:text-foreground"
        )}
      >
        <Repeat size={15} />
      </button>

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
          className="p-2 rounded-xl text-xs font-semibold text-muted hover:bg-surface-secondary flex items-center gap-1 cursor-pointer"
        >
          <Gauge size={14} />
          <span>{speed}x</span>
        </button>

        {showSpeedMenu && (
          <div className="absolute bottom-full mb-2 right-0 bg-surface dark:bg-surface-secondary border border-border rounded-xl p-1 shadow-lg flex flex-col gap-0.5 z-20 min-w-[70px]">
            {[0.5, 1, 1.5, 2].map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => {
                  setSpeed(sp);
                  setShowSpeedMenu(false);
                }}
                className={cn(
                  "px-3 py-1 text-xs text-left rounded-lg transition-colors cursor-pointer",
                  speed === sp ? "bg-accent text-accent-foreground font-bold" : "text-muted hover:bg-surface-secondary dark:hover:bg-surface-hover"
                )}
              >
                {sp}x
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}