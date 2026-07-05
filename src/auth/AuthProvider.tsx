import { MsalProvider } from "@azure/msal-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { setNetworkErrorTracker, setTokenProvider } from "../api/client";
import { AppErrorBoundary } from "../components/telemetry/AppErrorBoundary";
import { TelemetryProvider } from "../components/telemetry/TelemetryProvider";
import { setTelemetryTokenProvider, trackNetworkError } from "../telemetry";
import { isMsalEnabled, loginRequest, msalInstance } from "./msalConfig";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function DevAuthBridge({ children }: { children: ReactNode }) {
  useEffect(() => {
    const provider = async () => null;
    setTokenProvider(provider);
    setTelemetryTokenProvider(provider);
    setNetworkErrorTracker(trackNetworkError);
  }, []);
  return <>{children}</>;
}

function MsalAuthBridge({ children }: { children: ReactNode }) {
  useEffect(() => {
    const instance = msalInstance;
    if (!instance) return;

    void instance.initialize().then(async () => {
      const accounts = instance.getAllAccounts();
      if (accounts.length === 0) {
        await instance.loginRedirect(loginRequest);
        return;
      }

      instance.setActiveAccount(accounts[0]);
    });

    setTokenProvider(async () => {
      const account = instance.getActiveAccount() ?? instance.getAllAccounts()[0];
      if (!account) return null;

      try {
        const result = await instance.acquireTokenSilent({
          ...loginRequest,
          account,
        });
        return result.accessToken;
      } catch {
        await instance.acquireTokenRedirect(loginRequest);
        return null;
      }
    });

    setTelemetryTokenProvider(async () => {
      const account = instance.getActiveAccount() ?? instance.getAllAccounts()[0];
      if (!account) return null;

      try {
        const result = await instance.acquireTokenSilent({
          ...loginRequest,
          account,
        });
        return result.accessToken;
      } catch {
        return null;
      }
    });

    setNetworkErrorTracker(trackNetworkError);
  }, []);

  if (!msalInstance) {
    return <DevAuthBridge>{children}</DevAuthBridge>;
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const content = isMsalEnabled() ? (
    <MsalAuthBridge>{children}</MsalAuthBridge>
  ) : (
    <DevAuthBridge>{children}</DevAuthBridge>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TelemetryProvider>
        <AppErrorBoundary>{content}</AppErrorBoundary>
      </TelemetryProvider>
    </QueryClientProvider>
  );
}
