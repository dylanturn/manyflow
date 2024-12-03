/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to load these server-only modules on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        'sqlite3': false,
        'sqlite': false,
      }
      // Replace undici with native fetch in the browser
      config.resolve.alias = {
        ...config.resolve.alias,
        'undici': false,
      }
    }
    return config
  },
}

module.exports = nextConfig
