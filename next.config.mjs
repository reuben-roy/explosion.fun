/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cms.explosion.fun'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cms.explosion.fun',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
