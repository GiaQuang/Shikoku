/**
 * @format
 * @type {import('next').NextConfig}
 */

const nextConfig = {
    images: { unoptimized: true },
    reactStrictMode: false, // Tắt StrictMode
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
    experimental: {
        optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
    },
    productionBrowserSourceMaps: false,
    trailingSlash: false,
};

module.exports = nextConfig;
