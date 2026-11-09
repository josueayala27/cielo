import { defineCloudflareConfig } from '@opennextjs/cloudflare'

/** OpenNext adapter config. Pages read data client-side from the API, so no incremental cache is needed. */
export default defineCloudflareConfig()
