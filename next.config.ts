import type { NextConfig } from "next";

// NETLIFY=true is set automatically by Netlify's build environment.
// Locally (npm run dev), we skip output:'export' so the /api/audio route works.
const isNetlify = process.env.NETLIFY === "true";

const nextConfig: NextConfig = {
    ...(isNetlify ? { output: "export" } : {}),
    images: { unoptimized: true },
    trailingSlash: true,
};

export default nextConfig;
