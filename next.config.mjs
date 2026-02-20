import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
    swSrc: "src/sw.ts",
    swDest: "public/sw.js",
});

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

export default withSerwist(nextConfig);
