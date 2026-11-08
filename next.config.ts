import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Three 2 MB photos, with room for multipart metadata.
      bodySizeLimit: "7mb",
    },
  },
}

export default nextConfig
