/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracing: false,
  reactStrictMode: true,
  /** Removes the X-Powered-By header to prevent fingerprinting */
  poweredByHeader: false,
  /** Enables gzip/brotli compression for smaller payloads */
  compress: true,
  swcMinify: true,

  /**
   * Enterprise-Grade Security Headers
   * Implements defense-in-depth via HTTP response headers.
   * Covers: XSS, clickjacking, MIME sniffing, CORS, CSP, HSTS,
   * referrer policy, permissions policy, and CORP.
   */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking by denying iframe embedding
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing attacks
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Control referrer information sent with requests
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Enable browser XSS filtering (defense-in-depth for older browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Restrict browser features/APIs that aren't needed
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
          },
          // Enforce HTTPS with 2-year preload directive
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Content Security Policy: Only allow trusted sources
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://router.bynara.id https://generativelanguage.googleapis.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          // Cross-Origin-Opener-Policy: Isolate browsing context
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          // Cross-Origin-Resource-Policy: Restrict resource loading
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          // Prevent DNS prefetching to protect user privacy
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
          // Prevent Adobe Flash/Acrobat from loading data cross-domain
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
