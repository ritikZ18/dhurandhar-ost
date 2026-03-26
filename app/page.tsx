"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Track, ThemeKey, allTracks, availableTracks, THEMES,
  trackSrc, FIRST_TRACK, FIRST_TRACK_IDX,
} from "@/lib/tracks";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import dynamic from "next/dynamic";
import Preloader from "@/components/Preloader";
import PlayerHero from "@/components/PlayerHero";
import TrackList from "@/components/TrackList";
import BottomBar from "@/components/BottomBar";

const ThemeCanvas = dynamic(() => import("@/components/ThemeCanvas"), { ssr: false });

export default function HomePage() {
  const [appVisible, setAppVisible] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [themeKey, setThemeKey] = useState<ThemeKey>("revenge");
  const [manualTheme, setManualTheme] = useState<ThemeKey | null>(null);
  const [shuffleOn, setShuffleOn] = useState(true);
  const [shuffleQueue, setShuffleQueue] = useState<number[]>([]);
  const bleedRef = useRef<HTMLDivElement>(null);
  const engine = useAudioEngine();

  // ── Theme transition ──
  const applyTheme = useCallback((key: ThemeKey) => {
    setThemeKey(key);
    const th = THEMES[key];
    if (!bleedRef.current) return;
    bleedRef.current.style.background = `radial-gradient(circle, ${th.p1}40 0%, transparent 70%)`;
    bleedRef.current.style.opacity = "1";
    bleedRef.current.style.transform = "scale(0)";
    bleedRef.current.style.transition = "transform 0.5s ease, opacity 0.4s ease";
    requestAnimationFrame(() => {
      if (!bleedRef.current) return;
      bleedRef.current.style.transform = "scale(1)";
      setTimeout(() => {
        if (!bleedRef.current) return;
        bleedRef.current.style.opacity = "0";
        bleedRef.current.style.transition = "opacity 0.4s ease";
      }, 400);
    });
  }, []);

  // ── Shuffle — pool is available tracks only ──
  const buildQueue = useCallback((fromIdx: number) => {
    const pool = availableTracks.map((t) => allTracks.indexOf(t));
    const q = pool.filter((i) => i !== fromIdx).sort(() => Math.random() - 0.5);
    q.unshift(fromIdx);
    setShuffleQueue(q);
    return q;
  }, []);

  // ── Load track ──
  const loadTrack = useCallback(async (track: Track, idx: number, autoplay = false) => {
    engine.pause();
    const src = trackSrc(track);
    if (engine.audioRef.current) {
      engine.audioRef.current.src = src || "";
      if (src) engine.audioRef.current.load();
    }
    setCurrentTrack(track);
    setCurrentIdx(idx);
    applyTheme(manualTheme ?? track.theme);

    // If shuffle is on and it's a first load, build the queue
    if (shuffleOn && shuffleQueue.length === 0) {
      buildQueue(idx);
    }

    if (autoplay && src) {
      try { await engine.play(); } catch (_) { }
    }
  }, [engine, manualTheme, applyTheme, shuffleOn, shuffleQueue.length, buildQueue]);

  const nextTrack = useCallback(() => {
    if (shuffleOn) {
      const q = shuffleQueue.length ? shuffleQueue : buildQueue(currentIdx);
      const pos = q.indexOf(currentIdx);
      const ni = q[(pos + 1) % q.length];
      loadTrack(allTracks[ni], ni, engine.isPlaying);
    } else {
      let idx = currentIdx;
      do { idx = (idx + 1) % allTracks.length; }
      while (!trackSrc(allTracks[idx]) && idx !== currentIdx);
      loadTrack(allTracks[idx], idx, engine.isPlaying);
    }
  }, [shuffleOn, shuffleQueue, currentIdx, buildQueue, loadTrack, engine.isPlaying]);

  const prevTrack = useCallback(() => {
    if (engine.currentTime > 3) { engine.seek(0); return; }
    let idx = currentIdx;
    do { idx = (idx - 1 + allTracks.length) % allTracks.length; }
    while (!trackSrc(allTracks[idx]) && idx !== currentIdx);
    loadTrack(allTracks[idx], idx, engine.isPlaying);
  }, [currentIdx, engine, loadTrack]);

  const toggleShuffle = () => { const n = !shuffleOn; setShuffleOn(n); if (n) buildQueue(currentIdx); };

  // Auto-advance on ended
  useEffect(() => {
    const el = engine.audioRef.current;
    if (!el) return;
    const fn = () => nextTrack();
    el.addEventListener("ended", fn);
    return () => el.removeEventListener("ended", fn);
  }, [nextTrack]);

  // Pre-buffer Didi during preloader
  const armed = useRef(false);
  useEffect(() => {
    if (armed.current || !engine.audioRef.current) return;
    armed.current = true;
    const src = trackSrc(FIRST_TRACK);
    if (src) { engine.audioRef.current.src = src; engine.audioRef.current.load(); }
  });

  const handleEnterApp = useCallback(async () => {
    setAppVisible(true);
    await loadTrack(FIRST_TRACK, FIRST_TRACK_IDX, true);
  }, [loadTrack]);

  const th = THEMES[themeKey];

  return (
    <>
      {/* Preloader — fullscreen until Enter */}
      {!appVisible && <Preloader onEnter={handleEnterApp} />}

      {/* Bleed overlay */}
      <div ref={bleedRef} className="theme-bleed" style={{ opacity: 0 }} />

      {/* ── SINGLE-PAGE APP SHELL — 100vh, no external scroll ── */}
      <div
        className="fixed inset-0 flex flex-col"
        style={{
          opacity: appVisible ? 1 : 0,
          transition: "opacity 0.8s ease",
          pointerEvents: appVisible ? "auto" : "none",
          background: th.bg,
        }}
      >
        {/* Atmospheric canvas */}
        <ThemeCanvas themeKey={themeKey} bassLevel={engine.bassLevel} isPlaying={engine.isPlaying} />

        {/* Top glow */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 75% 45% at 35% -5%, ${th.glow} 0%, transparent 70%)`,
            transition: "background 0.9s ease",
          }}
        />

        {/* ── NAV BAR ── */}
        <nav
          className="relative z-50 flex items-center justify-between px-10 h-14 shrink-0"
          style={{
            borderBottom: `1px solid ${th.p1}18`,
            background: `${th.bg}d0`,
            backdropFilter: "blur(20px)",
            transition: "background 0.9s ease, border-color 0.9s ease",
          }}
        >
          <div className="flex items-baseline gap-3">
            <span className="font-bebas text-[20px] tracking-[0.3em]" style={{ color: th.p1, transition: "color 0.9s ease" }}>
              DHURANDHAR
            </span>
            <span className="font-mono text-[9px] tracking-[0.22em] opacity-40" style={{ color: th.text }}>
              THE REVENGE / OST
            </span>
          </div>

          {/* Theme palette dots */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-[9px] tracking-[0.3em] opacity-35" style={{ color: th.text }}>MOOD</span>
            {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
              <button key={key} title={THEMES[key].label}
                onClick={() => { setManualTheme(key); applyTheme(key); }}
                className="w-[10px] h-[10px] rounded-full border transition-all duration-300"
                style={{
                  background: THEMES[key].p1,
                  borderColor: themeKey === key ? "#fff" : "rgba(255,255,255,0.12)",
                  boxShadow: themeKey === key ? `0 0 8px ${THEMES[key].p1}` : "none",
                  transform: themeKey === key ? "scale(1.5)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </nav>

        {/* ── MAIN CONTENT ROW ── */}
        <div className="relative z-10 flex flex-1 min-h-0">

          {/* LEFT: Player Hero — wider, vertically centered */}
          <div
            className="flex-1 flex flex-col justify-center overflow-hidden"
            style={{ borderRight: `1px solid ${th.p1}14` }}
          >
            <PlayerHero
              track={currentTrack}
              themeKey={themeKey}
              engine={engine}
              onNext={nextTrack}
              onPrev={prevTrack}
              shuffleOn={shuffleOn}
              onToggleShuffle={toggleShuffle}
            />
          </div>

          {/* RIGHT: TrackList — compact fixed width, internal scroll */}
          <div
            className="overflow-y-auto flex-shrink-0"
            style={{ width: 540, scrollbarGutter: "stable" }}
          >
            <TrackList
              currentTrack={currentTrack}
              themeKey={themeKey}
              isPlaying={engine.isPlaying}
              onSelect={(t, i) => loadTrack(t, i, true)}
            />
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <BottomBar
          track={currentTrack}
          currentTime={engine.currentTime}
          duration={engine.duration}
          themeKey={themeKey}
        />

        {/* Hidden audio element */}
        <audio ref={engine.audioRef as React.RefObject<HTMLAudioElement>} preload="auto" />
      </div>
    </>
  );
}
