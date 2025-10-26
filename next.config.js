/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages configuration
  outputFileTracingRoot: require('path').join(__dirname),
  output: 'export', // Static export for Cloudflare Pages
  images: {
    unoptimized: true, // Required for static export
  },
}

module.exports = nextConfig
