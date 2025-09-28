/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  ...(process.env.NODE_ENV === 'production' && {
    basePath: '/memory-website',
    assetPrefix: '/memory-website/',
  }),
  trailingSlash: true,
};

export default nextConfig;
