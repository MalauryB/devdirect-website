/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/devdirect-website',
  assetPrefix: '/devdirect-website/',
};

export default nextConfig;
