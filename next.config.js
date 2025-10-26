/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages configuration
  outputFileTracingRoot: require('path').join(__dirname),
  output: 'export', // Static export for Cloudflare Pages
  images: {
    unoptimized: true, // Required for static export
  },
  // Fix webpack cache memory allocation issues
  webpack: (config, { isServer }) => {
    config.cache = false; // Disable webpack cache to prevent array buffer allocation errors
    return config;
  },
}

module.exports = nextConfig
