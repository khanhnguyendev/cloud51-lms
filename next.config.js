/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist'],
  logging: {
    fetches: {
      incomingRequests: {
        ignore: [/\api\/v1\/health/]
      },
      fullUrl: true
    }
  }
};

module.exports = nextConfig;
