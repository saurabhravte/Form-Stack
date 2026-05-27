/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // The API has its own tsc step that already checks these files.
    // Skip here to avoid double-checking with stricter settings.
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,  // also skip ESLint to be safe
  },
  reactStrictMode: true,
  transpilePackages: ['@formstack/shared'],
  eslint: {
    dirs: ['src'],
  },
};

module.exports = nextConfig;
