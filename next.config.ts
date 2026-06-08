import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'feira.casa',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/carrinho', destination: '/cart', permanent: true },
      { source: '/receitas', destination: '/recipe', permanent: true },
      { source: '/receitas/:id', destination: '/recipe/:id', permanent: true },
      { source: '/feiras', destination: '/fairs', permanent: true },
      { source: '/feiras/:id', destination: '/fairs/:id', permanent: true },
      { source: '/logincliente', destination: '/login/b2c', permanent: true },
      { source: '/cadastro/:path*', destination: '/signup/:path*', permanent: true },
      { source: '/register/:path*', destination: '/signup/:path*', permanent: true },
    ];
  },
};

export default nextConfig;
