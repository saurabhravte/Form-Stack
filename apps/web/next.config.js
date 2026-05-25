/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@formstack/shared'],
  eslint: {
    dirs: ['src'],
  },
};

module.exports = nextConfig;
