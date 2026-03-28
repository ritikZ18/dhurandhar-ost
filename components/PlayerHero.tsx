"use client";

import React, { useRef, useEffect } from "react";
import { Track, THEMES, ThemeKey, isAvailable } from "@/lib/tracks";
import { AudioEngine } from "@/hooks/useAudioEngine";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    track: Track | null;
    themeKey: ThemeKey;
    engine: AudioEngine;
    onNext: () => void;
    onPrev: () => void;
    shuffleOn: boolean;
    onToggleShuffle: () => void;
}

function fmtTime(s: number) {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function VinylDisc({ isPlaying, color, image }: { isPlaying: boolean; color: string; image?: string }) {
    const size = 340;
    const ctr = size / 2;
    const labelSize = 140;

    // Use a ref and rAF for truly continuous rotation (no resets on track changes)
    const rotationRef = useRef(0);
    const svgRef = useRef<SVGSVGElement>(null);
    const lastTimeRef = useRef(performance.now());

    useEffect(() => {
        let frameId: number;
        const animate = (time: number) => {
            const dt = time - lastTimeRef.current;
            lastTimeRef.current = time;

            if (isPlaying) {
                // Increment rotation based on time (approx 12 degrees per second)
                rotationRef.current = (rotationRef.current + (dt * 0.038)) % 360;
                if (svgRef.current) {
                    svgRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
                }
            }
            frameId = requestAnimationFrame(animate);
        };
        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, [isPlaying]);

    return (
        <div className="relative flex-shrink-0 w-[190px] h-[190px] lg:w-[340px] lg:h-[340px]">
            {/* The rotating vinyl disc */}
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox={`0 0 ${size} ${size}`}
                className="absolute inset-0"
                style={{ transform: `rotate(${rotationRef.current}deg)`, transition: isPlaying ? "none" : "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)" }}
            >
                <circle cx={ctr} cy={ctr} r={ctr - 2} fill="#0d0d0d" stroke={`${color}25`} strokeWidth="1.2" />

                {/* Outer Ring Color Glow — makes it less 'dark' */}
                <circle cx={ctr} cy={ctr} r={ctr - 10} fill="none" stroke={`${color}08`} strokeWidth="20" />

                {/* Grooves */}
                {[145, 137, 129, 121, 113, 105, 97, 89, 81].map((r) => (
                    <circle key={r} cx={ctr} cy={ctr} r={r} fill="none" stroke={`${color}0e`} strokeWidth="0.8" />
                ))}

                {/* Motion streaks & spectral reflections */}
                <path d={`M ${ctr - 120} ${ctr} A 120 120 0 0 1 ${ctr} ${ctr - 120}`} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeLinecap="round" />
                <path d={`M ${ctr + 135} ${ctr} A 135 135 0 0 0 ${ctr} ${ctr + 135}`} fill="none" stroke={`${color}15`} strokeWidth="1.5" strokeLinecap="round" />
                <path d={`M ${ctr - 90} ${ctr - 90} A 127 127 0 0 1 ${ctr + 90} ${ctr - 90}`} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                {/* Extra color flash arcs */}
                <path d={`M ${ctr - 155} ${ctr} A 155 155 0 0 1 ${ctr} ${ctr - 155}`} fill="none" stroke={`${color}12`} strokeWidth="3" opacity="0.4" />
                <path d={`M ${ctr + 155} ${ctr} A 155 155 0 0 0 ${ctr} ${ctr + 155}`} fill="none" stroke={`${color}08`} strokeWidth="5" opacity="0.2" />

                {/* Center label area border */}
                <circle cx={ctr} cy={ctr} r={labelSize / 2 + 4} fill="#111" />
                <circle cx={ctr} cy={ctr} r={labelSize / 2 + 2} fill="none" stroke={`${color}35`} strokeWidth="1.5" />

                {/* Spindle hole shadow */}
                <circle cx={ctr} cy={ctr} r="6.5" fill="#000" opacity="0.5" />
                <circle cx={ctr} cy={ctr} r="4.5" fill={color} opacity="0.8" />

                {/* Main high-gloss sheen — rotates with the disc */}
                <ellipse cx={ctr - 70} cy={ctr - 90} rx="50" ry="18" fill="white" opacity="0.04" transform={`rotate(-40 ${ctr - 70} ${ctr - 90})`} />
                <ellipse cx={ctr + 70} cy={ctr + 90} rx="30" ry="10" fill="white" opacity="0.02" transform={`rotate(-40 ${ctr + 70} ${ctr + 90})`} />
            </svg>

            {/* The static center image — label stays still while disc spins around it */}
            <div
                className="absolute rounded-full overflow-hidden pointer-events-none"
                style={{
                    width: `${(labelSize / size) * 100}%`,
                    height: `${(labelSize / size) * 100}%`,
                    top: `${((size - labelSize) / 2 / size) * 100}%`,
                    left: `${((size - labelSize) / 2 / size) * 100}%`,
                    zIndex: 5,
                    boxShadow: `0 0 25px rgba(0,0,0,0.6)`
                }}
            >
                {image ? (
                    <img src={image} alt="cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${color}50, #080808)` }} />
                )}
            </div>
        </div>
    );
}

export default function PlayerHero({ track, themeKey, engine, onNext, onPrev, shuffleOn, onToggleShuffle }: Props) {
    const th = THEMES[themeKey];
    const pct = engine.duration ? (engine.currentTime / engine.duration) * 100 : 0;
    const canPlay = !!track && isAvailable(track);

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!engine.duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        engine.seek(((e.clientX - rect.left) / rect.width) * engine.duration);
    };

    const handleVol = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        engine.setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
    };

    const togglePlay = async () => {
        if (!canPlay) return;
        if (engine.isPlaying) engine.pause();
        else await engine.play();
    };

    return (
        <section className="flex flex-col gap-4 lg:gap-6 px-6 lg:px-8 py-4 lg:py-8">

            {/* ── TOP: title + vinyl ── */}
            <div className="flex flex-col-reverse sm:flex-row items-center sm:items-center justify-between gap-4 sm:gap-5">

                {/* Text block */}
                <div className="flex flex-col justify-center gap-[4px] min-w-0 flex-1 text-center sm:text-left">
                    <p
                        className="font-mono text-[9px] tracking-[0.45em] uppercase"
                        style={{ color: th.p1, opacity: 0.8, transition: "color 0.9s ease" }}
                    >
                        | {th.label}
                    </p>

                    <AnimatePresence mode="wait">
                        <motion.h1
                            key={track?.title ?? "idle"}
                            className="font-bebas leading-[0.9] tracking-[0.015em] line-clamp-2"
                            style={{
                                fontSize: "clamp(28px, 4.5vw, 52px)",
                                color: th.text,
                                textShadow: `0 0 40px ${th.p1}25`,
                                transition: "color 0.9s ease",
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            {track ? track.title.toUpperCase() : "SELECT A TRACK"}
                        </motion.h1>
                    </AnimatePresence>

                    <p
                        className="font-mono text-[9px] tracking-[0.25em] uppercase leading-relaxed opacity-60"
                        style={{ color: th.muted, transition: "color 0.9s ease" }}
                    >
                        {track?.artist ?? "DHURANDHAR · THE REVENGE"}
                    </p>

                    {track && !isAvailable(track) && (
                        <p className="font-mono text-[9px] tracking-widest uppercase mt-1" style={{ color: "rgba(230,180,30,0.6)" }}>
                            ⚠ No audio file linked
                        </p>
                    )}
                </div>

                {/* Vinyl disc */}
                <VinylDisc isPlaying={engine.isPlaying} color={th.p1} image={track?.image} />
            </div>

            {/* ── VISUALIZER ── */}
            <div className="flex items-end gap-[3px] h-5 lg:h-6 mt-1 justify-center sm:justify-start">
                {Array.from({ length: 14 }, (_, i) => (
                    <div
                        key={i}
                        className="w-[2.5px] origin-bottom"
                        style={{
                            background: i < 5 ? th.p1 : i < 9 ? th.ac : th.p2,
                            height: engine.isPlaying
                                ? `${Math.max(2, Math.min(24, (engine.bassLevel + 0.03) * 24 + Math.sin(Date.now() * 0.0025 + i * 0.55) * 6))}px`
                                : "2px",
                            opacity: engine.isPlaying ? 0.65 : 0.1,
                            transition: "height 0.07s linear, background 0.9s ease",
                        }}
                    />
                ))}
            </div>

            {/* ── PROGRESS BAR ── */}
            <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] tabular-nums w-8 shrink-0" style={{ color: th.muted }}>
                    {fmtTime(engine.currentTime)}
                </span>
                <div
                    className="flex-1 h-[3px] cursor-pointer relative group"
                    style={{ background: `${th.p1}1e` }}
                    onClick={handleSeek}
                >
                    <div
                        className="absolute inset-y-0 left-0"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${th.p1}, ${th.ac})`, transition: "background 0.9s ease" }}
                    >
                        <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: th.ac, boxShadow: `0 0 8px ${th.ac}` }}
                        />
                    </div>
                </div>
                <span className="font-mono text-[11px] tabular-nums w-8 shrink-0 text-right" style={{ color: th.muted }}>
                    {track?.duration ?? "0:00"}
                </span>
            </div>

            {/* ── TRANSPORT ── */}
            <div className="flex items-center gap-4 lg:gap-5">
                {/* Shuffle */}
                <button onClick={onToggleShuffle} aria-label="Shuffle"
                    className="p-1 lg:p-2 transition-all duration-200 hover:scale-110"
                    style={{ color: shuffleOn ? th.p1 : th.muted, opacity: shuffleOn ? 1 : 0.5 }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                    </svg>
                </button>

                {/* Prev */}
                <button onClick={onPrev} aria-label="Previous"
                    className="p-1 lg:p-2 opacity-60 hover:opacity-100 transition-all hover:scale-110"
                    style={{ color: th.text }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
                    </svg>
                </button>

                {/* ▶ Play/Pause — prominent square */}
                <motion.button onClick={togglePlay}
                    aria-label={engine.isPlaying ? "Pause" : "Play"}
                    disabled={!canPlay}
                    whileHover={{ scale: canPlay ? 1.07 : 1 }}
                    whileTap={{ scale: 0.93 }}
                    className="flex items-center justify-center shrink-0"
                    style={{
                        width: "clamp(50px, 12vw, 58px)",
                        height: "clamp(50px, 12vw, 58px)",
                        background: canPlay ? th.p1 : `${th.p1}45`,
                        color: "#04000a",
                        boxShadow: canPlay ? `0 0 28px ${th.glow}, 0 0 6px ${th.glow}` : "none",
                        transition: "background 0.9s ease, box-shadow 0.9s ease",
                        borderRadius: 0,
                    }}
                >
                    {engine.isPlaying
                        ? <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                        : <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    }
                </motion.button>

                {/* Next */}
                <button onClick={onNext} aria-label="Next"
                    className="p-1 lg:p-2 opacity-60 hover:opacity-100 transition-all hover:scale-110"
                    style={{ color: th.text }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 4V8zM16 6h2v12h-2z" />
                    </svg>
                </button>

                {/* Volume */}
                <div className="flex items-center gap-2 ml-auto">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: th.muted }}>
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                    </svg>
                    <div className="w-20 h-[2px] cursor-pointer relative group" style={{ background: `${th.p1}1e` }} onClick={handleVol}>
                        <div className="absolute inset-y-0 left-0" style={{ width: `${engine.volume * 100}%`, background: th.p1, transition: "background 0.9s ease" }}>
                            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: th.p1 }} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
