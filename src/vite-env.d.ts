/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_USE_MOCK: string;
  readonly VITE_OBSERVABILITY_ENABLED?: string;
  /** URL base da SPA Compass standalone (ex.: http://localhost:5174). */
  readonly VITE_COMPASS_APP_URL?: string;
  /** URL base da SPA UniLio standalone (ex.: http://localhost:5176). */
  readonly VITE_UNILIO_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  ProfilePage?: {
    init: () => void | Promise<void>;
    setViewerRole?: (role: string) => void;
    bumpLoadGeneration?: () => void;
  };
}
