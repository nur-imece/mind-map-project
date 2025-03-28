/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: string
  // Add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 