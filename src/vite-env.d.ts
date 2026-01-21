/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TEST_BE_URL: string;
  readonly VITE_BE_URL: string;
  readonly VITE_ENV: string;
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_RAZORPAY_API_KEY: string;
  readonly VITE_AGORA_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
