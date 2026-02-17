/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        optimizePackageImports: ['@/presentation/components/ui'],
    },
    images: {
        formats: ['image/avif', 'image/webp'],
    },
    transpilePackages: ['@react-pdf/renderer'],
};

export default nextConfig;
