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

function DevAuthBridge({ children }: { children: ReactNode }) {
  useEffect(() => {
    const provider = async () => null;
    setTokenProvider(provider);
    setTelemetryTokenProvider(provider);
    setNetworkErrorTracker(trackNetworkError);
  }, []);
  return <>{children}</>;
}

function PortalAuthBridge({ children }: { children: ReactNode }) {
  useEffect(() => {
    const provider = async () => getStoredToken();
    setTokenProvider(provider);
    setTelemetryTokenProvider(provider);
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
