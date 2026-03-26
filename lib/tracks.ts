// Streaming URL — best for audio in browser (no export param = direct inline)
export const DRIVE_BASE = "https://drive.google.com/uc?id=";

export type ThemeKey = "revenge" | "emotional" | "romantic" | "party" | "urban";

export interface Track {
    id: string;           // Google Drive share URL or bare file ID
    title: string;
    artist: string;
    duration: string;
    theme: ThemeKey;
    image?: string;       // Optional cover art — Google Drive URL or local path
}

export interface ThemeConfig {
    p1: string; bg: string; bg2: string;
    p2: string; ac: string; glow: string;
    text: string; muted: string; label: string;
}

export const THEMES: Record<ThemeKey, ThemeConfig> = {
    revenge: {
        p1: "#b01414", p2: "#e03a00", ac: "#d45030",
        bg: "#060004", bg2: "#0e0000",
        glow: "rgba(176,20,20,0.35)",
        text: "#ffe8e0", muted: "#6a4040", label: "DARK REVENGE",
    },
    emotional: {
        p1: "#3a30e0", p2: "#8040e8", ac: "#9a90d8",
        bg: "#01010c", bg2: "#050418",
        glow: "rgba(58,48,224,0.3)",
        text: "#ece8ff", muted: "#404070", label: "SUFI EMOTIONAL",
    },
    romantic: {
        p1: "#b83070", p2: "#d88aaa", ac: "#e8c0cc",
        bg: "#080006", bg2: "#150010",
        glow: "rgba(184,48,112,0.3)",
        text: "#fff0f5", muted: "#704055", label: "SOFT ROMANTIC",
    },
    party: {
        p1: "#a89000", p2: "#00a898", ac: "#cc0088",
        bg: "#050400", bg2: "#0c0b00",
        glow: "rgba(168,144,0,0.35)",
        text: "#fffae8", muted: "#706038", label: "PARTY ENERGY",
    },
    urban: {
        p1: "#007899", p2: "#289ab0", ac: "#70c8d8",
        bg: "#000508", bg2: "#000b12",
        glow: "rgba(0,120,153,0.3)",
        text: "#e8f4f8", muted: "#305060", label: "URBAN FUSION",
    },
};

/** Extract bare file ID from any Google Drive URL, or return as-is */
export function extractDriveId(idOrUrl: string): string {
    const m1 = idOrUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (m1) return m1[1];
    const m2 = idOrUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m2) return m2[1];
    return idOrUrl;
}

/** Returns audio src URL through the proxy, or "" if no valid ID */
export function trackSrc(track: Track): string {
    const id = extractDriveId(track.id);
    if (!id) return "";
    // Always proxy through /api/audio — this works:
    //   locally: Next.js API route at app/api/audio/route.ts
    //   on Netlify: edge function at netlify/edge-functions/audio-proxy.ts
    return `/api/audio?id=${id}`;
}

/** True if this track has a real Drive ID and can be played */
export function isAvailable(track: Track): boolean {
    return trackSrc(track) !== "";
}

export const TRACK_GROUPS: { theme: ThemeKey; tracks: Track[] }[] = [
    {
        theme: "revenge",
        tracks: [
            { id: "https://drive.google.com/file/d/1b6j0j5TeJBbTgFOkNGKk5fggexl6S7aw/view?usp=sharing", title: "Dhurandhar Title Track", artist: "Shashwat Sachdev", duration: "3:20", theme: "revenge", image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW3T2mbO-YrvYk-cgO7aQn-ib3VmoQNv2vbg&s' },
            { id: "https://drive.google.com/file/d/19W_3IhWFQYXGRxQS0ifMIg43pIgRRJJB/view?usp=sharing", title: "Didi (Sher-E-Baloch)", artist: "Shashwat, Nabil, Sons of Yusuf", duration: "3:40", theme: "revenge", image: 'https://static.toiimg.com/thumb/msid-129697759,width-1280,height-720,imgsize-34928,resizemode-4,overlay-toi_sw,pt-32,y_pad-600/photo.jpg' },
            { id: "https://drive.google.com/file/d/1oZUvx_eVUCZ1ELGFJiddoHpCO5T-CnOw/view?usp=sharing", title: "Run Down The City", artist: "Asha Bhosle, R.D. Burman, Reble", duration: "2:52", theme: "revenge", image: 'https://i.ytimg.com/vi/cuHjDqw-5xM/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLD9ZD7Glk2EzSDWFg9tJ7YCCEQcZQ' },
            { id: "https://drive.google.com/file/d/1DjtwlJyuTg61Sign9RQDEA11jBD_Uo3L/view?usp=sharing", title: "Ez-Ez", artist: "Shashwat Sachdev", duration: "3:10", theme: "revenge", image: '' },
            { id: "https://drive.google.com/file/d/1AjS2Gh87bE50zrfx3nV_9zgtnDcvFUMh/view?usp=sharing", title: "Gehra Hua", artist: "Shashwat Sachdev", duration: "4:28", theme: "revenge", image: '' },
            { id: "https://drive.google.com/file/d/1L5TzJI0Ej_9PBTb7vKgYyeNUfS3QGUCq/view?usp=sharing", title: "Ishq Jalakar – Karvaan", artist: "Shashwat Sachdev", duration: "3:25", theme: "revenge", image: '' },
        ],
    },
    {
        theme: "emotional",
        tracks: [
            { id: "https://drive.google.com/file/d/1Q3-NXj7u0ZfkUllFLoJECp7AwXVkeO6k/view?usp=sharing", title: "Aakhri Ishq", artist: "Jubin Nautiyal, Irshad Kamil", duration: "3:45", theme: "emotional", image: '' },
            { id: "https://drive.google.com/file/d/18vDVxzTfboVL6x3YHPAIsWznC7dHGqzs/view?usp=sharing", title: "Jaan Se Guzarte Hain", artist: "Nusrat Fateh Ali Khan, Khan Saab", duration: "4:10", theme: "emotional", image: '' },
            { id: "https://drive.google.com/file/d/1SZQoCIecgJhMRPrQR62GqW3Tzvs15Rxh/view?usp=sharing", title: "Tere Ishq Ne", artist: "Jyoti Nooran, Kumaar", duration: "4:22", theme: "emotional", image: '' },
            { id: "https://drive.google.com/file/d/1VAtWVFLfFFPV7aTpPOeYc9TFlpJRxgVB/view?usp=sharing", title: "Phir Se", artist: "Arijit Singh, Irshad Kamil", duration: "4:30", theme: "emotional", image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyPUncgQGERRobaq0_OVRVqT2XYO3F8BnfPA&s' },
            { id: "https://drive.google.com/file/d/1rjuwQMVsMHXz_5cfSTEsAqZ9AfDlG6H1/view?usp=sharing", title: "Destiny – Mann Atkeya", artist: "Vaibhav G, Shahzad A, Token", duration: "3:50", theme: "emotional", image: '' },
        ],
    },
    {
        theme: "romantic",
        tracks: [
            { id: "https://drive.google.com/file/d/1HyNf4It7uY0Pqe2F8mo2DEFTNVn7zkhb/view?usp=sharing", title: "Main Aur Tu", artist: "Jasmine Sandlas, Reble", duration: "3:44", theme: "romantic", image: '' },
            { id: "https://drive.google.com/file/d/1Dv_1I4HWoZRi6E7qvtmMgf_OFekzJ6-C/view?usp=sharing", title: "Jaiye Sajana", artist: "Jasmine Sandlas, Satinder Sartaaj", duration: "3:26", theme: "romantic", image: '' },
            { id: "https://drive.google.com/file/d/1Jix0wushs58PEWxn3psf9jxUkCm9xDnV/view?usp=sharing", title: "Hum Pyaar Karne Wale", artist: "Anuradha Paudwal, Udit Narayan", duration: "3:34", theme: "romantic", image: '' },
            { id: "https://drive.google.com/file/d/1N3pQpyAC7iTfccKcHUGBoqs6wD5x7oKh/view?usp=sharing", title: "Vaari Jaavan", artist: "Jyoti Nooran, Jasmine S, Reble", duration: "3:52", theme: "romantic", image: 'https://i.ytimg.com/vi/Nc4X9PR84R4/maxresdefault.jpg' },
            { id: "https://drive.google.com/file/d/15ayJwyTjdOH1TCLH7PiN4bUZUiN3RKMH/view?usp=sharing", title: "Kanhaiyya", artist: "Jubin Nautiyal, Nawab S", duration: "4:10", theme: "romantic", image: '' },
        ],
    },
    {
        theme: "party",
        tracks: [
            { id: "https://drive.google.com/file/d/1nxWZM9N5g4A-5lfSOGzM-fuvzPhiskB_/view?usp=sharing", title: "Aari Aari", artist: "Bombay Rockers, Jasmine S, Token", duration: "3:18", theme: "party", image: 'https://pbs.twimg.com/media/HDwS72XakAAVZlE.jpg' },
            { id: "https://drive.google.com/file/d/1JnDRWCPQ2zZkO8MzEJI6YRaWR90CyzBH/view?usp=sharing", title: "Rang De Lal (Oye O Oye)", artist: "Kalyanji-Anandji, Jasmine, Afsana", duration: "3:28", theme: "party", image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg7OaQsNDZe_-2at-1qZaibpiC0tTu9q4byg&s' },
            { id: "https://drive.google.com/file/d/15SeprGa2Xu-PRlLZvNnTlLRr6sQpAYAJ/view?usp=sharing", title: "Tamma Tamma", artist: "Bappi Lahiri, Anuradha Paudwal", duration: "3:56", theme: "party", image: '' },
            { id: "https://drive.google.com/file/d/1OWsrkyAxWP3v9xXROlt_UPVYUqYfcice/view?usp=sharing", title: "Naal Nachna", artist: "Afsana Khan, Reble, Irshad", duration: "2:50", theme: "party", image: 'https://i.ytimg.com/vi/P4UnrmPFPA4/maxresdefault.jpg' },
            { id: "https://drive.google.com/file/d/1njMjpqRQ0ehMAZKfiM2EZm5xqhJFNmcl/view?usp=sharing", title: "Ramba Ho", artist: "Madhubanti Bagchi", duration: "2:42", theme: "party", image: 'https://i.scdn.co/image/ab67616d0000b27305076f623489e8c8eb5e9ed4' },
            { id: "https://drive.google.com/file/d/1wzLoRvO7DaReVI1i549OnJT7trBAYTPZ/view?usp=sharing", title: "Lutt Le Gaya", artist: "Shashwat S, Simran Choudhary", duration: "2:38", theme: "party", image: 'https://i.ytimg.com/vi/hMUM2IKOG-c/sddefault.jpg' },
            // { id: "https://drive.google.com/file/d/1wzLoRvO7DaReVI1i549OnJT7trBAYTPZ/view?usp=sharing", title: "Fliberachie", artist: "Shashwat S, Simran Choudhary", duration: "2:38", theme: "party", image: '' },
        ],
    },
    {
        theme: "urban",
        tracks: [
            { id: "https://drive.google.com/file/d/1e6ryAouuc0iS3fXGZw8rkNfeW67-tLfN/view?usp=sharing", title: "Move – Yeh Ishq Ishq", artist: "Shashwat Sachdev", duration: "3:05", theme: "urban", image: 'https://cdn.esquireindia.co.in/editor-images/2025-11-18T06%3A24%3A38.632Z-file-image-2025-07-06t135956-1751790858.jpg' },
            { id: "https://drive.google.com/file/d/1ElUSLSuuci6M3T-1NFV1DzFsbUAOBGuJ/view?usp=sharing", title: "Bekasi", artist: "RD Burman, Kishore Kumar", duration: "3:08", theme: "urban", image: 'https://akm-img-a-in.tosshub.com/indiatoday/images/story/202603/dhurandhar-2-box-office-day-7-fastest-rs-1-000-crore-grosser-worldwide--eyes-kalki-252144649-16x9_0.jpg?VersionId=c6CvN4E6FXynRhGGnEnkPEK85z4OasUu' },
            { id: "https://drive.google.com/file/d/1MWrE924w3K5cLXhBusyXzYA_8uIIZie_/view?usp=sharing", title: "Shararat", artist: "Jasmine S, Madhubanti B, Krystle", duration: "3:32", theme: "urban", image: 'https://i.ytimg.com/vi/Gayw5AQvWcQ/hqdefault.jpg' },
            { id: "https://drive.google.com/file/d/1PT9CdVsaQiIpAs6f5BuVVhcwTxUew63d/view?usp=sharing", title: "Teri Ni Kararan", artist: "Shashwat Sachdev", duration: "3:15", theme: "urban", image: 'https://i.scdn.co/image/ab67616d0000b2738cc87c6a432b992eb465cbba' },
        ],
    },
];

export const allTracks: Track[] = TRACK_GROUPS.flatMap((g) => g.tracks);
export const availableTracks: Track[] = allTracks.filter(isAvailable);

/** The "first song" — always start here */
export const FIRST_TRACK = allTracks.find((t) => t.title === "Didi (Sher-E-Baloch)") ?? allTracks[0];
export const FIRST_TRACK_IDX = allTracks.indexOf(FIRST_TRACK);
