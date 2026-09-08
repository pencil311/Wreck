/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Domain engines and stores are server-only; keep the client bundle lean.
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs"]
  }
};

export default nextConfig;
