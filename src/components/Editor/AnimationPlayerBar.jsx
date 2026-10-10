"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/UI/IconButton";
import { isPressableTarget, isTypingTarget } from "@/lib/keyboard";
import { TIMELINE_EVENT, dispatchTimeline } from "@/characters/_core/useTimeline";
import { Slider } from "@heroui/react";

export function AnimationPlayerBar({
  elementId = "character-workspace",
  durationMs,
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isLooping, setIsLooping] = useState(true);

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
    let nextProgress = prevProgress + deltaTime / durationMs;
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
  }, [durationMs, isLooping, broadcastTimelineState]);

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

  const handleSliderChange = (newProgress) => {
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

  const currentTimeSec = (progress * (durationMs / 1000)).toFixed(1);
  const totalTimeSec = (durationMs / 1000).toFixed(1);

  return (
    <div className="w-full bg-surface border border-border rounded-2xl px-4 py-2.5 flex items-center gap-3 select-none">
      <IconButton
        label={isPlaying ? "Pause" : "Play"}
        tooltip={isPlaying ? "Pause (Space)" : "Play (Space)"}
        variant="tertiary"
        onPress={() => setIsPlaying(!isPlaying)}
        className="text-foreground shrink-0"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </IconButton>

      <IconButton
        label="Restart"
        onPress={handleReset}
        className="text-muted hover:text-foreground shrink-0"
      >
        <RotateCcw size={16} />
      </IconButton>

      <div className="text-[11px] font-mono font-medium tabular-nums text-muted shrink-0 whitespace-nowrap">
        {currentTimeSec}s / {totalTimeSec}s
      </div>

      {/* Slider HeroUI. Geser timeline hanya mengubah tampilan, tidak masuk undo. */}
      <Slider
        aria-label="Timeline"
        minValue={0}
        maxValue={1}
        step={0.001}
        formatOptions={{ style: "percent" }}
        value={progress}
        onChange={handleSliderChange}
        className="flex-1"
      >
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>

      <IconButton
        label="Loop"
        tooltip={isLooping ? "Loop: on" : "Loop: off"}
        aria-pressed={isLooping}
        onPress={() => setIsLooping(!isLooping)}
        className={cn(
          "shrink-0",
          isLooping ? "text-accent bg-accent-soft" : "text-muted hover:text-foreground"
        )}
      >
        <Repeat size={16} />
      </IconButton>
    </div>
  );
}