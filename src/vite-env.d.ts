/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_FEATURE_FLAG: string
  readonly VITE_ANALYTICS_KEY: string
  // add more as needed...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
