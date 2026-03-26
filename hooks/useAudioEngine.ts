"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export interface AudioEngine {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    bassLevel: number;
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    volume: number;
    play: () => Promise<void>;
    pause: () => void;
    seek: (time: number) => void;
    setVolume: (v: number) => void;
    initContext: () => void;
}

export function useAudioEngine(): AudioEngine {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const rafRef = useRef<number>(0);
    const dataRef = useRef<Uint8Array | null>(null);

    const [bassLevel, setBassLevel] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolumeState] = useState(0.8);

    const initContext = useCallback(() => {
        if (audioCtxRef.current || !audioRef.current) return;
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            const source = ctx.createMediaElementSource(audioRef.current);
            source.connect(analyser);
            analyser.connect(ctx.destination);
            audioCtxRef.current = ctx;
            analyserRef.current = analyser;
            sourceRef.current = source;
            dataRef.current = new Uint8Array(analyser.frequencyBinCount);

            let smoothed = 0;
            const tick = () => {
                if (!analyserRef.current || !dataRef.current) return;
                analyserRef.current.getByteFrequencyData(dataRef.current);
                let sum = 0;
                for (let i = 0; i < 6; i++) sum += dataRef.current[i];
                const raw = sum / (6 * 255);
                smoothed = smoothed * 0.75 + raw * 0.25;
                setBassLevel(smoothed);
                rafRef.current = requestAnimationFrame(tick);
            };
            rafRef.current = requestAnimationFrame(tick);
        } catch (e) {
            console.warn("Web Audio API unavailable:", e);
        }
    }, []);

    const play = useCallback(async () => {
        if (!audioRef.current) return;
        initContext();
        if (audioCtxRef.current?.state === "suspended") {
            await audioCtxRef.current.resume();
        }
        await audioRef.current.play();
        setIsPlaying(true);
    }, [initContext]);

    const pause = useCallback(() => {
        audioRef.current?.pause();
        setIsPlaying(false);
    }, []);

    const seek = useCallback((time: number) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = time;
    }, []);

    const setVolume = useCallback((v: number) => {
        if (!audioRef.current) return;
        audioRef.current.volume = v;
        setVolumeState(v);
    }, []);

    useEffect(() => {
        const el = audioRef.current;
        if (!el) return;
        const onTime = () => setCurrentTime(el.currentTime);
        const onMeta = () => setDuration(el.duration || 0);
        const onPause = () => setIsPlaying(false);
        const onPlay = () => setIsPlaying(true);
        el.addEventListener("timeupdate", onTime);
        el.addEventListener("loadedmetadata", onMeta);
        el.addEventListener("pause", onPause);
        el.addEventListener("play", onPlay);
        return () => {
            el.removeEventListener("timeupdate", onTime);
            el.removeEventListener("loadedmetadata", onMeta);
            el.removeEventListener("pause", onPause);
            el.removeEventListener("play", onPlay);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return { audioRef, bassLevel, currentTime, duration, isPlaying, volume, play, pause, seek, setVolume, initContext };
}
