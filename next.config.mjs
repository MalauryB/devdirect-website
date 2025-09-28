/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  ...(process.env.NODE_ENV === 'production' && {
    basePath: '/devdirect-website',
    assetPrefix: '/devdirect-website/',
  }),
  trailingSlash: true,
};

export default nextConfig;
