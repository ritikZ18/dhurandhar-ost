"use client";

import { Track, THEMES, ThemeKey, TRACK_GROUPS, allTracks, isAvailable } from "@/lib/tracks";

interface Props {
    currentTrack: Track | null;
    themeKey: ThemeKey;
    isPlaying: boolean;
    onSelect: (track: Track, index: number) => void;
}

export default function TrackList({ currentTrack, themeKey, isPlaying, onSelect }: Props) {
    const th = THEMES[themeKey];

    return (
        <section className="relative z-10 px-4 pb-24">
            {/* Heading */}
            <div className="flex items-baseline gap-4 mb-8">
                <h2 className="font-bebas text-4xl tracking-[0.15em]" style={{ color: th.text, transition: "color 0.9s ease" }}>
                    TRACKLIST
                </h2>
                <div className="flex-1 h-[1px]" style={{ background: `${th.p1}18` }} />
                <span className="font-mono text-[10px] tracking-[0.3em]" style={{ color: th.muted }}>
                    26 TRACKS · 5 THEMES
                </span>
            </div>

            {TRACK_GROUPS.map((group) => {
                const gTh = THEMES[group.theme];
                const groupOffset = allTracks.findIndex((t) => t === group.tracks[0]);

                return (
                    <div key={group.theme} className="mb-8">
                        {/* Group header */}
                        <div className="flex items-center gap-3 mb-2 py-2 sticky top-0 z-10"
                            style={{ background: `linear-gradient(to bottom, ${gTh.bg}f4, ${gTh.bg}00)` }}
                        >
                            <div className="w-[2px] h-5" style={{ background: gTh.p1 }} />
                            <span className="font-bebas text-[14px] tracking-[0.4em]" style={{ color: gTh.p1 }}>
                                {gTh.label}
                            </span>
                            <div className="flex-1 h-[1px]" style={{ background: `${gTh.p1}15` }} />
                            <span className="font-mono text-[10px]" style={{ color: gTh.muted }}>{group.tracks.length}</span>
                        </div>

                        {group.tracks.map((track, localIdx) => {
                            const globalIdx = groupOffset + localIdx;
                            const isActive = currentTrack === track;
                            const available = isAvailable(track);

                            return (
                                <div
                                    key={track.title + globalIdx}
                                    onClick={() => available && onSelect(track, globalIdx)}
                                    className="group flex items-center gap-4 py-[11px] px-4 transition-colors duration-150"
                                    style={{
                                        borderLeft: isActive ? `2px solid ${gTh.p1}` : "2px solid transparent",
                                        background: isActive ? `${gTh.p1}0a` : "transparent",
                                        cursor: available ? "pointer" : "not-allowed",
                                        opacity: available ? 1 : 0.38,
                                    }}
                                >
                                    {/* Track number */}
                                    <span
                                        className="font-mono text-[11px] text-center shrink-0 w-7"
                                        style={{ color: isActive ? gTh.p1 : gTh.muted }}
                                    >
                                        {String(globalIdx + 1).padStart(2, "0")}
                                    </span>

                                    {/* Cover art thumbnail */}
                                    <div
                                        className="shrink-0 flex items-center justify-center overflow-hidden"
                                        style={{ width: 36, height: 36, background: `${gTh.p1}14` }}
                                    >
                                        {track.image ? (
                                            <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
                                        ) : (
                                            /* Vinyl stub */
                                            <svg width="22" height="22" viewBox="0 0 22 22">
                                                <circle cx="11" cy="11" r="10" fill="#111" stroke={`${gTh.p1}30`} strokeWidth="0.8" />
                                                <circle cx="11" cy="11" r="6" fill="none" stroke={`${gTh.p1}20`} strokeWidth="0.7" />
                                                <circle cx="11" cy="11" r="2" fill={gTh.p1} opacity="0.5" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex flex-col gap-[2px] min-w-0 flex-1">
                                        <span
                                            className="font-rajdhani text-[15px] font-semibold truncate leading-tight"
                                            style={{ color: isActive ? gTh.p1 : th.text, transition: "color 0.9s ease" }}
                                        >
                                            {track.title}
                                        </span>
                                        <span className="text-[12px] font-light truncate" style={{ color: gTh.muted }}>
                                            {track.artist}
                                        </span>
                                    </div>

                                    {/* Playing animation */}
                                    {isActive && isPlaying && (
                                        <div className="flex gap-[2px] items-end h-4 shrink-0">
                                            {[10, 16, 10].map((h, i) => (
                                                <div key={i} className="w-[2px] origin-bottom animate-pulse"
                                                    style={{ background: gTh.p1, height: `${h}px`, animationDelay: `${i * 0.18}s` }} />
                                            ))}
                                        </div>
                                    )}

                                    {/* Duration */}
                                    <span className="font-mono text-[11px] shrink-0 text-right w-10" style={{ color: gTh.muted }}>
                                        {track.duration}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </section>
    );
}
