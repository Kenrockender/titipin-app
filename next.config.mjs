/** @type {import('next').NextConfig} */
const nextConfig = {
  // firebase-admin's module format trips up Next's bundler in serverless
  // functions (ERR_REQUIRE_ESM) unless it's left as an external require.
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin"]
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "unpkg.com" }
    ]
  }
};
export default nextConfig;
