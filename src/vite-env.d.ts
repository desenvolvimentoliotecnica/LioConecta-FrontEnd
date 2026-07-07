/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_USE_MOCK: string;
  readonly VITE_OBSERVABILITY_ENABLED?: string;
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
