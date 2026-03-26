"use client";

import { useEffect, useRef } from "react";
import { ThemeKey, THEMES } from "@/lib/tracks";

interface Props {
    themeKey: ThemeKey;
    bassLevel: number;
    isPlaying: boolean;
}

export default function ThemeCanvas({ themeKey, bassLevel, isPlaying }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const particlesRef = useRef<Particle[]>([]);

    interface Particle {
        x: number; y: number;
        vx: number; vy: number;
        r: number; phase: number; col: string;
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const th = THEMES[themeKey];

        let cw = 0, ch = 0;
        function initParticles() {
            const count = themeKey === "party" ? 0 : themeKey === "urban" ? 30 : 40;
            particlesRef.current = Array.from({ length: count }, () => ({
                x: Math.random() * cw, y: Math.random() * ch,
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15,
                r: 60 + Math.random() * 100,
                phase: Math.random() * Math.PI * 2,
                col: [th.p1, th.p2, th.ac][Math.floor(Math.random() * 3)],
            }));
        }

        const resize = () => {
            cw = canvas.width = window.innerWidth;
            ch = canvas.height = window.innerHeight;
            initParticles();
        };
        window.addEventListener("resize", resize);
        resize();

        function drawBase(t: number) {
            ctx!.clearRect(0, 0, cw, ch);
            const grad = ctx!.createRadialGradient(cw / 2, -ch * 0.05, 0, cw / 2, ch / 2, ch * 1.3);
            grad.addColorStop(0, th.bg2 + "ff");
            grad.addColorStop(0.6, th.bg + "ff");
            grad.addColorStop(1, "#000000ff");
            ctx!.fillStyle = grad;
            ctx!.fillRect(0, 0, cw, ch);
        }

        // ── REVENGE: film burn grain + diagonal light leaks ──
        function drawRevenge(t: number, bl: number) {
            // Diagonal light leaks — very subtle
            for (let i = 0; i < 3; i++) {
                const x = ((t * 18 + i * 340) % (cw + 500)) - 250;
                const g = ctx!.createLinearGradient(x, 0, x + 180, ch);
                g.addColorStop(0, "transparent");
                g.addColorStop(0.5, `rgba(160,15,15,${0.025 + bl * 0.04})`);
                g.addColorStop(1, "transparent");
                ctx!.fillStyle = g;
                ctx!.fillRect(x, 0, 180, ch);
            }
            // Bottom vignette bleed
            const bv = ctx!.createRadialGradient(cw / 2, ch, 0, cw / 2, ch, cw * 0.7);
            bv.addColorStop(0, `rgba(120,0,0,${0.08 + bl * 0.07})`);
            bv.addColorStop(1, "transparent");
            ctx!.fillStyle = bv;
            ctx!.fillRect(0, 0, cw, ch);
        }

        // ── EMOTIONAL: volumetric fog, indigo ──
        function drawEmotional(t: number, bl: number) {
            for (let i = 0; i < 4; i++) {
                const yOff = ch * 0.35 + i * 90;
                ctx!.beginPath();
                ctx!.moveTo(0, yOff);
                for (let x = 0; x <= cw; x += 12) {
                    const y = yOff + Math.sin(x * 0.005 + t * (0.12 + i * 0.07) + i * 1.2) * 22 * (1 + bl * 1.5);
                    ctx!.lineTo(x, y);
                }
                ctx!.lineTo(cw, ch); ctx!.lineTo(0, ch); ctx!.closePath();
                ctx!.fillStyle = `rgba(40,32,180,${0.03 - i * 0.006})`;
                ctx!.fill();
            }
            // Top aurora
            const tg = ctx!.createRadialGradient(cw / 2, 0, 0, cw / 2, 0, cw * 0.55);
            tg.addColorStop(0, `rgba(70,55,210,${0.1 + bl * 0.08})`);
            tg.addColorStop(1, "transparent");
            ctx!.fillStyle = tg; ctx!.fillRect(0, 0, cw, ch);
        }

        // ── ROMANTIC: slow bokeh blobs ──
        function drawRomantic(t: number, bl: number) {
            particlesRef.current.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < -p.r) p.x = cw + p.r;
                if (p.x > cw + p.r) p.x = -p.r;
                if (p.y < -p.r) p.y = ch + p.r;
                if (p.y > ch + p.r) p.y = -p.r;
                const alpha = (Math.sin(t * 0.15 + p.phase) * 0.5 + 0.5) * (0.04 + bl * 0.02);
                const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
                g.addColorStop(0, p.col + Math.floor(alpha * 255).toString(16).padStart(2, "0"));
                g.addColorStop(1, "transparent");
                ctx!.fillStyle = g; ctx!.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
            });
        }

        // ── PARTY: controlled grid-line strobe ──
        function drawParty(t: number, bl: number) {
            const gridA = Math.sin(t * 0.8) * 0.5 + 0.5;
            ctx!.save();
            ctx!.strokeStyle = `rgba(168,144,0,${0.04 + gridA * 0.03 + bl * 0.025})`;
            ctx!.lineWidth = 0.5;
            const gs = 70;
            for (let x = 0; x < cw; x += gs) { ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, ch); ctx!.stroke(); }
            for (let y = 0; y < ch; y += gs) { ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(cw, y); ctx!.stroke(); }
            // Horizontal accent lines
            ctx!.strokeStyle = `rgba(0,168,152,${0.03 + bl * 0.04})`;
            const bands = [ch * 0.3, ch * 0.6];
            bands.forEach(by => {
                ctx!.beginPath(); ctx!.moveTo(0, by + Math.sin(t * 0.4) * 4); ctx!.lineTo(cw, by + Math.sin(t * 0.4) * 4);
                ctx!.stroke();
            });
            ctx!.restore();
            // Subtle top gold wash
            const tg = ctx!.createRadialGradient(cw * 0.5, 0, 0, cw * 0.5, 0, ch * 0.7);
            tg.addColorStop(0, `rgba(120,100,0,${0.06 + bl * 0.05})`);
            tg.addColorStop(1, "transparent");
            ctx!.fillStyle = tg; ctx!.fillRect(0, 0, cw, ch);
        }

        // ── URBAN: near-static noise + city bokeh ──
        function drawUrban(t: number, bl: number) {
            ctx!.save();
            ctx!.strokeStyle = `rgba(0,100,130,${0.04 + bl * 0.025})`;
            ctx!.lineWidth = 0.5;
            const gs = 55;
            for (let x = 0; x < cw; x += gs) { ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, ch); ctx!.stroke(); }
            for (let y = 0; y < ch; y += gs) { ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(cw, y); ctx!.stroke(); }
            ctx!.restore();
            // City bokeh lights
            particlesRef.current.forEach(p => {
                p.x += p.vx * 0.3; p.y += p.vy * 0.3;
                if (p.x < -p.r) p.x = cw + p.r; if (p.x > cw + p.r) p.x = -p.r;
                if (p.y < -p.r) p.y = ch + p.r; if (p.y > ch + p.r) p.y = -p.r;
                const alpha = (Math.sin(t * 0.1 + p.phase) * 0.5 + 0.5) * 0.035;
                const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 0.6);
                g.addColorStop(0, `rgba(0,153,187,${alpha})`);
                g.addColorStop(1, "transparent");
                ctx!.fillStyle = g; ctx!.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
            });
            const lg = ctx!.createRadialGradient(cw * 0.25, 0, 0, cw * 0.25, 0, ch * 0.9);
            lg.addColorStop(0, `rgba(0,80,110,${0.08 + bl * 0.06})`);
            lg.addColorStop(1, "transparent");
            ctx!.fillStyle = lg; ctx!.fillRect(0, 0, cw, ch);
        }

        const animate = (ts: number) => {
            const t = ts / 1000;
            const bl = bassLevel;
            drawBase(t);
            if (themeKey === "revenge") drawRevenge(t, bl);
            else if (themeKey === "emotional") drawEmotional(t, bl);
            else if (themeKey === "romantic") drawRomantic(t, bl);
            else if (themeKey === "party") drawParty(t, bl);
            else if (themeKey === "urban") drawUrban(t, bl);
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", resize);
        };
    }, [themeKey]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none"
            aria-hidden="true"
        />
    );
}
