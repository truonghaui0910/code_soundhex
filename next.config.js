/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'storage.automusic.win',
            },
            {
                protocol: 'https',
                hostname: 'i.scdn.co',
            },
            {
                protocol: 'https',
                hostname: 'mosaic.scdn.co',
            },
        ],
        unoptimized: true, // Disable optimization for Docker
    },
    // output: 'standalone', // Better for Docker deployment
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Disable telemetry
    experimental: {
        instrumentationHook: false,
    },

    // Tối ưu minification
    swcMinify: true,
};

module.exports = nextConfig;
