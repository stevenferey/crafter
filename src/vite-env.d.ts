/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_DONATION_BTC?: string;
  readonly VITE_DONATION_ETH?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_INDEXABLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
