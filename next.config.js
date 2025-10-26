/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages configuration
  outputFileTracingRoot: require('path').join(__dirname),
}

module.exports = nextConfig
