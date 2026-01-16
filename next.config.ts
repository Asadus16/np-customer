import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
      },
      // Allow AWS public IP for backend images
      ...(process.env.NEXT_PUBLIC_API_HOST
        ? [
            {
              protocol: 'http' as const,
              hostname: process.env.NEXT_PUBLIC_API_HOST.replace(/^https?:\/\//, '').split(':')[0],
            },
          ]
        : []),
    ],
  },
  // Proxy API requests to backend to avoid mixed content errors
  // This allows HTTPS frontend to communicate with HTTP backend
  async rewrites() {
    // Get backend URL from environment variable
    // Format: http://YOUR_AWS_IP:8000 or http://YOUR_AWS_IP:8000/api
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Extract host and protocol
    const urlMatch = backendUrl.match(/^(https?:\/\/)?([^\/]+)/);
    if (!urlMatch) {
      return [];
    }
    
    const backendProtocol = urlMatch[1] ? urlMatch[1].replace('://', '') : 'http';
    const backendHost = urlMatch[2];
    
    // Remove /api if it's already in the backend URL
    const backendPath = backendUrl.includes('/api') ? '' : '/api';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendProtocol}://${backendHost}${backendPath}/:path*`,
      },
    ];
  },
};

export default nextConfig;
