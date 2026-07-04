/// <reference types="vite/client" />

declare module "*.html?raw" {
  const content: string;
  export default content;
}

declare module "*.css?inline" {
  const content: string;
  export default content;
}

declare global {
  interface Window {
    ProfilePage?: {
      init: () => void;
      setViewerRole: (role: string) => void;
    };
    OrgProfileModal?: {
      init: () => void;
    };
  }
}

export {};
