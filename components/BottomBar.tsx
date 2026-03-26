"use client";

import { Track, THEMES, ThemeKey } from "@/lib/tracks";

interface Props {
    track: Track | null;
    currentTime: number;
    duration: number;
    themeKey: ThemeKey;
}

function fmtTime(s: number) {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export default function BottomBar({ track, currentTime, duration, themeKey }: Props) {
    const th = THEMES[themeKey];
    const pct = duration ? (currentTime / duration) * 100 : 0;

    if (!track) return null;

    return (
        <div
            className="relative flex items-center gap-6 px-10 h-9 shrink-0"
            style={{
                borderTop: `1px solid ${th.p1}14`,
                background: `${th.bg}d0`,
                backdropFilter: "blur(20px)",
                transition: "background 0.9s ease, border-color 0.9s ease",
            }}
        >
            {/* Track title */}
            <span
                className="font-mono text-[9px] tracking-[0.25em] uppercase truncate max-w-[200px] opacity-50"
                style={{ color: th.text }}
            >
                {track.title}
            </span>

            {/* Mini progress bar */}
            <div
                className="flex-1 h-[1px] relative"
                style={{ background: `${th.p1}1a` }}
            >
                <div
                    className="absolute inset-y-0 left-0"
                    style={{
                        width: `${pct}%`,
                        background: `${th.p1}60`,
                        transition: "width 0.1s linear, background 0.9s ease",
                    }}
                />
            </div>

            {/* Time */}
            <span
                className="font-mono text-[9px] tabular-nums shrink-0 opacity-40"
                style={{ color: th.text }}
            >
                {fmtTime(currentTime)} / {track.duration}
            </span>
        </div>
    );
}
