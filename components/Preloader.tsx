"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    onEnter: () => void;
}

const TITLE_CHARS = "DHURANDHAR".split("");

export default function Preloader({ onEnter }: Props) {
    const [phase, setPhase] = useState<"silent" | "line" | "title">("silent");
    const [entered, setEntered] = useState(false);
    const fireRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);

    // ── Fire canvas ──────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = fireRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize();
        window.addEventListener("resize", resize);

        interface Ember { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; r: number; g: number; b: number; flicker: number; }
        const embers: Ember[] = [];

        const spawn = () => {
            const cx = canvas.width / 2;
            const x = cx + (Math.random() - 0.5) * canvas.width * 0.85;
            const maxLife = 100 + Math.random() * 150;
            const pick = Math.random();
            const [r, g, b] = pick < 0.35
                ? [150 + Math.random() * 60, 8 + Math.random() * 18, 0]
                : pick < 0.7
                    ? [220 + Math.random() * 35, 70 + Math.random() * 60, 0]
                    : [255, 195 + Math.random() * 60, 20 + Math.random() * 50];
            embers.push({ x, y: canvas.height + 8, vx: (Math.random() - 0.5) * 1.4, vy: -(1.6 + Math.random() * 3.0), life: maxLife, maxLife, size: 1.2 + Math.random() * 3.8, r, g, b, flicker: Math.random() * Math.PI * 2 });
        };

        let frame = 0;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (frame % 2 === 0) for (let i = 0; i < 12; i++) spawn();
            frame++;

            // Bottom flame glow
            for (let i = 0; i < 4; i++) {
                const cx = canvas.width / 2;
                const g = ctx.createRadialGradient(cx + Math.sin(frame * 0.025 + i) * 80, canvas.height, 0, cx, canvas.height, canvas.width * (0.35 + i * 0.12));
                const alpha = 0.06 - i * 0.012;
                g.addColorStop(0, `rgba(210,40,0,${alpha})`);
                g.addColorStop(0.5, `rgba(130,12,0,${alpha * 0.5})`);
                g.addColorStop(1, "transparent");
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            for (let i = embers.length - 1; i >= 0; i--) {
                const e = embers[i];
                e.life--;
                if (e.life <= 0) { embers.splice(i, 1); continue; }
                e.x += e.vx + Math.sin(frame * 0.04 + e.flicker) * 0.28;
                e.y += e.vy;
                e.flicker += 0.07;
                const lr = e.life / e.maxLife;
                const alpha = lr < 0.15 ? (lr / 0.15) * 0.8 : lr > 0.75 ? ((1 - lr) / 0.25) * 0.8 : 0.8;
                const r = e.size * (0.4 + lr * 0.6);
                // Glow
                const gg = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r * 5);
                gg.addColorStop(0, `rgba(${e.r},${e.g},${e.b},${alpha * 0.28})`);
                gg.addColorStop(1, "transparent");
                ctx.fillStyle = gg;
                ctx.fillRect(e.x - r * 5, e.y - r * 5, r * 10, r * 10);
                // Core
                ctx.beginPath();
                ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${e.r},${e.g},${e.b},${alpha})`;
                ctx.fill();
            }
            rafRef.current = requestAnimationFrame(draw);
        };
        rafRef.current = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
    }, []);

    // ── Phase timing ─────────────────────────────────────────────────────
    useEffect(() => {
        const t1 = setTimeout(() => setPhase("line"), 1000);
        const t2 = setTimeout(() => setPhase("title"), 2300);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    const handleEnter = () => {
        setEntered(true);
        setTimeout(onEnter, 800);
    };

    return (
        <AnimatePresence>
            {!entered && (
                <motion.div
                    className="fixed inset-0 z-[9999] bg-black overflow-hidden"
                    exit={{ opacity: 0, scale: 1.05, filter: "blur(16px)" }}
                    transition={{ duration: 0.85, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    {/* Fire canvas */}
                    <canvas ref={fireRef} className="absolute inset-0 pointer-events-none" style={{ mixBlendMode: "screen" }} />

                    {/* Centre vignette for legibility */}
                    <div className="absolute inset-0 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse 65% 55% at 50% 42%, transparent 0%, rgba(0,0,0,0.72) 100%)" }} />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center select-none">

                        {/* ── Phase: line ── left-to-right horizontal rule */}
                        <AnimatePresence>
                            {phase !== "silent" && (
                                <motion.div
                                    className="absolute"
                                    style={{ width: "min(360px, 84vw)", height: "1px", top: "calc(50% - 112px)", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)" }}
                                    initial={{ scaleX: 0, originX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1] }}
                                />
                            )}
                        </AnimatePresence>

                        {/* ── Phase: title ── */}
                        <AnimatePresence>
                            {phase === "title" && (
                                <div className="flex flex-col items-center gap-0">

                                    {/* DHURANDHAR — Cinematic blur-in and convergence */}
                                    <div className="relative flex flex-col items-center">
                                        {/* Massive back glow behind title to spread orange across screen */}
                                        <motion.div
                                            className="absolute inset-0 z-[-1]"
                                            style={{
                                                background: "radial-gradient(circle, rgba(210,60,0,0.4) 0%, transparent 75%)",
                                                filter: "blur(70px)",
                                                width: "180%",
                                                height: "180%",
                                                left: "-40%",
                                                top: "-40%"
                                            }}
                                            initial={{ opacity: 0, scale: 0.7 }}
                                            animate={{ opacity: 1, scale: 1.15 }}
                                            transition={{ delay: 0.4, duration: 3.0, ease: "easeOut" }}
                                        />

                                        <motion.h1
                                            className="font-bebas text-white leading-none px-4"
                                            style={{
                                                fontSize: "clamp(68px, 15vw, 118px)",
                                                letterSpacing: "0.2em",
                                                textShadow: "0 0 55px rgba(210,60,0,1), 0 0 120px rgba(180,30,0,0.6)",
                                            }}
                                            initial={{ opacity: 0, letterSpacing: "0.6em", filter: "blur(25px)", scale: 0.95 }}
                                            animate={{ opacity: 1, letterSpacing: "0.08em", filter: "blur(0px)", scale: 1 }}
                                            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                                        >
                                            DHURANDHAR
                                        </motion.h1>
                                    </div>

                                    {/* THE REVENGE — subtle fade in */}
                                    <motion.div
                                        className="flex"
                                        style={{ marginTop: "-6px" }}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.2, duration: 1.0, ease: "easeOut" }}
                                    >
                                        {"THE REVENGE".split("").map((char, i) => (
                                            <span
                                                key={i}
                                                className="font-bebas leading-none"
                                                style={{
                                                    fontSize: "clamp(22px, 5vw, 42px)",
                                                    letterSpacing: "0.35em",
                                                    color: "rgba(225,85,30,0.88)",
                                                    textShadow: "0 0 18px rgba(200,50,0,0.7)",
                                                }}
                                            >{char === " " ? "\u00A0" : char}</span>
                                        ))}
                                    </motion.div>

                                    {/* Divider rule */}
                                    <motion.div
                                        style={{ width: "min(340px, 80vw)", height: "1px", margin: "20px 0", background: "linear-gradient(90deg, transparent, rgba(200,60,0,0.55), transparent)" }}
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 1.6, duration: 1.0, ease: [0.76, 0, 0.24, 1] }}
                                    />

                                    {/* OST label */}
                                    <motion.p
                                        className="font-mono uppercase tracking-[0.5em] text-[10px]"
                                        style={{ color: "rgba(255,255,255,0.3)" }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 2.0, duration: 0.8 }}
                                    >Original Soundtrack</motion.p>

                                    {/* Credit — Highlighted Shashwat Sachdev */}
                                    <motion.p
                                        className="font-cormorant italic tracking-[0.18em] text-[14px] mt-2 font-medium"
                                        style={{
                                            color: "rgba(255,180,100,0.7)",
                                            textShadow: "0 0 12px rgba(255,100,0,0.3)"
                                        }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 2.2, duration: 1.0 }}
                                    >Music by <span style={{ color: "rgba(255,210,130,1)" }}>Shashwat Sachdev</span></motion.p>

                                    {/* Enter CTA */}
                                    <motion.button
                                        onClick={handleEnter}
                                        className="mt-12 font-mono uppercase tracking-[0.45em] text-[11px] bg-transparent border-none outline-none cursor-pointer transition-all duration-300"
                                        style={{ color: "rgba(255,140,70,0.65)" }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 3.2, duration: 1.2 }}
                                        whileHover={{ color: "rgba(255,190,110,1)", textShadow: "0 0 14px rgba(255,140,50,0.8)", y: -2 }}
                                    >
                                        &#9654;&nbsp;&nbsp;Enter
                                    </motion.button>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
