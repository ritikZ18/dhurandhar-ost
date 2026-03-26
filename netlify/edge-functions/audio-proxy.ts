// netlify/edge-functions/audio-proxy.ts
// Route: /api/audio?id=DRIVE_FILE_ID
//
// Solves 3 problems with using Google Drive as audio host:
//   1. CORS — Drive has no Access-Control-Allow-Origin header; proxy adds it
//   2. Virus-scan redirect — large files get HTML warning page; proxy retries with cookie token
//   3. Content-Disposition: attachment — Drive forces download; proxy strips this header
//
// Uses standard Web API types (Request, Response) — available in Netlify Edge runtime.
// No @netlify/edge-functions package needed at runtime.

export default async function handler(req: Request) {
    const url = new URL(req.url);
    const fileId = url.searchParams.get("id");

    if (!fileId || !/^[a-zA-Z0-9_-]{10,}$/.test(fileId)) {
        return new Response("Missing or invalid file ID", { status: 400 });
    }

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, HEAD",
                "Access-Control-Allow-Headers": "Range",
            },
        });
    }

    const rangeHeader = req.headers.get("Range");
    const fetchHeaders: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (compatible; AudioProxy/1.0)",
    };
    if (rangeHeader) fetchHeaders["Range"] = rangeHeader;

    const driveUrl = `https://drive.google.com/uc?export=download&confirm=t&id=${fileId}`;

    try {
        let res = await fetch(driveUrl, { headers: fetchHeaders, redirect: "follow" });

        // If Drive returned a virus-scan HTML page, retry with extracted confirm cookie
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
            return new Response(`Upstream error ${res.status}`, { status: 502 });
        }

        // Build response — copy safe headers, strip Content-Disposition, add CORS
        const out = new Headers();
        for (const h of ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"]) {
            const v = res.headers.get(h);
            if (v) out.set(h, v);
        }
        if (!out.get("content-type")?.startsWith("audio/")) {
            out.set("content-type", "audio/mpeg");
        }
        out.set("Access-Control-Allow-Origin", "*");
        out.set("Access-Control-Allow-Methods", "GET, HEAD");
        out.set("Access-Control-Allow-Headers", "Range");
        out.set("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
        out.set("Cache-Control", "public, max-age=3600");

        return new Response(res.body, { status: rangeHeader ? 206 : res.status, headers: out });
    } catch (err) {
        console.error("[audio-proxy] error:", err);
        return new Response("Proxy error", { status: 500 });
    }
}

// Netlify reads this plain object to wire up the route
export const config = { path: "/api/audio" };
