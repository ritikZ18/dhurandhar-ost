import { NextRequest, NextResponse } from "next/server";

// Next.js API route — mirrors the Netlify edge function for local `npm run dev`
// In production (Netlify), the edge function at netlify/edge-functions/audio-proxy.ts
// handles this route instead.

export async function GET(request: NextRequest) {
    const fileId = request.nextUrl.searchParams.get("id");

    if (!fileId || !/^[a-zA-Z0-9_-]{10,}$/.test(fileId)) {
        return new NextResponse("Missing or invalid file ID", { status: 400 });
    }

    const rangeHeader = request.headers.get("Range");
    const fetchHeaders: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (compatible; AudioProxy/1.0)",
    };
    if (rangeHeader) fetchHeaders["Range"] = rangeHeader;

    try {
        let res = await fetch(
            `https://drive.google.com/uc?export=download&confirm=t&id=${fileId}`,
            { headers: fetchHeaders, redirect: "follow" }
        );

        // Virus-scan page check
        const ct = res.headers.get("content-type") ?? "";
        if (ct.includes("text/html")) {
            const setCookie = res.headers.get("set-cookie") ?? "";
            const m = setCookie.match(/download_warning[^=]*=([^;]+)/);
            const token = m ? m[1] : "t";
            res = await fetch(
                `https://drive.google.com/uc?export=download&confirm=${token}&id=${fileId}`,
                { headers: fetchHeaders, redirect: "follow" }
            );
        }

        if (!res.ok && res.status !== 206) {
            return new NextResponse(`Drive error ${res.status}`, { status: 502 });
        }

        const out = new Headers();
        for (const h of ["content-type", "content-length", "content-range", "accept-ranges", "etag"]) {
            const v = res.headers.get(h);
            if (v) out.set(h, v);
        }
        if (!out.get("content-type")?.startsWith("audio/")) out.set("content-type", "audio/mpeg");
        out.set("Access-Control-Allow-Origin", "*");
        out.set("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
        out.set("Cache-Control", "public, max-age=3600");

        return new NextResponse(res.body, { status: rangeHeader ? 206 : res.status, headers: out });
    } catch (err) {
        console.error("[api/audio]", err);
        return new NextResponse("Proxy error", { status: 500 });
    }
}

export const dynamic = "force-dynamic";
