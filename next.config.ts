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
    // Priority: BACKEND_URL (server-only) > NEXT_PUBLIC_API_URL (can be used by both)
    // Format: http://YOUR_AWS_IP:8000 (with or without /api - we'll handle it)
    // Default to localhost:8000 for development if not set
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // If no backend URL is set, don't add rewrites (will cause errors)
    if (!backendUrl) {
      console.warn('⚠️  BACKEND_URL or NEXT_PUBLIC_API_URL not set. API rewrites disabled.');
      return [];
    }
    
    // Parse the URL properly
    let backendBase: string;
    
    try {
      // If it's a full URL, extract base URL
      if (backendUrl.startsWith('http://') || backendUrl.startsWith('https://')) {
        const url = new URL(backendUrl);
        // Remove trailing /api if present (we'll add it back in the destination)
        let path = url.pathname;
        if (path.endsWith('/api')) {
          path = path.replace(/\/api\/?$/, '');
        }
        backendBase = `${url.protocol}//${url.host}${path}`;
      } else {
        // If it's just a host, assume http
        backendBase = `http://${backendUrl}`;
      }
      
      console.log(`✅ API Rewrite configured: /api/* -> ${backendBase}/api/*`);
      console.log(`   Using: ${process.env.BACKEND_URL ? 'BACKEND_URL' : 'NEXT_PUBLIC_API_URL'}`);
    } catch (error) {
      console.error('❌ Error parsing backend URL:', error);
      // Fallback if URL parsing fails
      backendBase = backendUrl.replace(/\/api\/?$/, '');
      if (!backendBase.startsWith('http://') && !backendBase.startsWith('https://')) {
        backendBase = `http://${backendBase}`;
      }
    }
    
    // Always add /api to the destination since frontend uses /api prefix
    return [
      {
        source: '/api/:path*',
        destination: `${backendBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
