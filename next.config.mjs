/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        optimizePackageImports: ['@/presentation/components/ui'],
    },
    images: {
        formats: ['image/avif', 'image/webp'],
    },
};

export default nextConfig;
