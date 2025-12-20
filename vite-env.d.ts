/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_REAL_API: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_URL: string
  readonly GEMINI_API_KEY: string
  readonly NODE_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
