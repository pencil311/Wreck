/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Domain engines and stores are server-only; keep the client bundle lean.
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs"]
  },
  // Serve the standalone gym hero as the landing page at "/".
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/gym.html" }]
    };
  }
};

export default nextConfig;
