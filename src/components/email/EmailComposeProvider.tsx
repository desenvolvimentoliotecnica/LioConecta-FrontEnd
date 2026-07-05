import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { EmailComposeOpenOptions } from "../../api/types";
import { EmailComposeModal } from "./EmailComposeModal";

type EmailComposeContextValue = {
  openCompose: (options: EmailComposeOpenOptions) => void;
  closeCompose: () => void;
};

const EmailComposeContext = createContext<EmailComposeContextValue | null>(null);

export function installEmailComposeBridge(openCompose: (options: EmailComposeOpenOptions) => void) {
  window.LioEmailCompose = { open: openCompose };
}

export function EmailComposeProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<EmailComposeOpenOptions | undefined>();

  const openCompose = useCallback((next: EmailComposeOpenOptions) => {
    setOptions(next);
    setOpen(true);
  }, []);

  const closeCompose = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    installEmailComposeBridge(openCompose);
    return () => {
      delete window.LioEmailCompose;
    };
  }, [openCompose]);

  const value = useMemo(
    () => ({
      openCompose,
      closeCompose,
    }),
    [openCompose, closeCompose],
  );

  return (
    <EmailComposeContext.Provider value={value}>
      {children}
      <EmailComposeModal open={open} onClose={closeCompose} defaults={options} />
    </EmailComposeContext.Provider>
  );
}

export function useEmailCompose(): EmailComposeContextValue {
  const context = useContext(EmailComposeContext);
  if (!context) {
    throw new Error("useEmailCompose must be used within EmailComposeProvider");
  }
  return context;
}

declare global {
  interface Window {
    LioEmailCompose?: {
      open: (options: EmailComposeOpenOptions) => void;
    };
  }
}

export {};
