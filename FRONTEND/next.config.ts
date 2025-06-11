import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // Permettre l'accès depuis n'importe quelle adresse IP
    experimental: {
        serverComponentsExternalPackages: [],
    },
    // Configuration pour supporter les adresses IP
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Access-Control-Allow-Origin",
                        value: "*",
                    },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET, POST, PUT, DELETE, OPTIONS",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "Content-Type, Authorization",
                    },
                ],
            },
        ]
    },
}

export default nextConfig
