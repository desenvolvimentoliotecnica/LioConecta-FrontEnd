import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { setNetworkErrorTracker, setTokenProvider } from "../api/client";
import { getStoredToken } from "../api/hooks/useAuth";
import { AppErrorBoundary } from "../components/telemetry/AppErrorBoundary";
import { TelemetryProvider } from "../components/telemetry/TelemetryProvider";
import { EmailComposeProvider } from "../components/email/EmailComposeProvider";
import { setTelemetryTokenProvider, trackNetworkError } from "../telemetry";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const DEV_AUTH_MODE = import.meta.env.VITE_AUTH_MODE === "dev";

const nullTokenProvider = async () => null;
const portalTokenProvider = async () => getStoredToken();

/** Wire token before any child query fires (useEffect runs too late / after paint). */
function installTokenProviders(provider: () => Promise<string | null>) {
  setTokenProvider(provider);
  setTelemetryTokenProvider(provider);
}

installTokenProviders(DEV_AUTH_MODE ? nullTokenProvider : portalTokenProvider);

function DevAuthBridge({ children }: { children: ReactNode }) {
  useEffect(() => {
    installTokenProviders(nullTokenProvider);
    setNetworkErrorTracker(trackNetworkError);
  }, []);
  return <>{children}</>;
}

function PortalAuthBridge({ children }: { children: ReactNode }) {
  // Reaffirm synchronously on render so Strict Mode / remounts never leave the default null provider.
  installTokenProviders(portalTokenProvider);

  useEffect(() => {
    installTokenProviders(portalTokenProvider);
    setNetworkErrorTracker(trackNetworkError);
  }, []);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const content = DEV_AUTH_MODE ? (
    <DevAuthBridge>{children}</DevAuthBridge>
  ) : (
    <PortalAuthBridge>{children}</PortalAuthBridge>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TelemetryProvider>
        <AppErrorBoundary>
          <EmailComposeProvider>{content}</EmailComposeProvider>
        </AppErrorBoundary>
      </TelemetryProvider>
    </QueryClientProvider>
  );
}
