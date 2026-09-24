/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracing: false,
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
