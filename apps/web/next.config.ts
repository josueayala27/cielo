import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // The shared contracts package ships TypeScript source.
  transpilePackages: ['@cielo/contracts'],
  poweredByHeader: false,
}

export default nextConfig

// Exposes Cloudflare bindings to `next dev` (no-op in production builds).
void initOpenNextCloudflareForDev()
