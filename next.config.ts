import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Ensure we are using standard SSR (not 'export')
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'threejs.org' },
      { protocol: 'https', hostname: '**.firebasedatabase.app' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' }
    ],
  },
};

export default nextConfig;
