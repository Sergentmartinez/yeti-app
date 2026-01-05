/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.annecy-ville.fr',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.nationalgeographic.fr',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};
export default nextConfig;
