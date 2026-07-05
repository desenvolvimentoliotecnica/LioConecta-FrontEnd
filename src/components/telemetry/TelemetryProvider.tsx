import { useEffect, type ReactNode } from "react";
import {
  initTelemetryClient,
  setTelemetryTokenProvider,
  shutdownTelemetryClient,
  trackApplicationError,
  trackUnhandledRejection,
} from "../../telemetry";

type Props = {
  children: ReactNode;
  getAccessToken?: () => Promise<string | null>;
};

export function TelemetryProvider({ children, getAccessToken }: Props) {
  useEffect(() => {
    if (getAccessToken) {
      setTelemetryTokenProvider(getAccessToken);
    }

    initTelemetryClient();

    const onError = (event: ErrorEvent) => {
      trackApplicationError({
        message: event.message || "Unhandled script error",
        routeTemplate: window.location.pathname,
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      trackUnhandledRejection(event.reason);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      shutdownTelemetryClient();
    };
  }, [getAccessToken]);

  return children;
}
