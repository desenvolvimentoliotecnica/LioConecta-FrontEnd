import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { refreshCorrelationOnNavigation } from "./sessionCorrelation";
import { trackPageLeave, trackPageView } from "./telemetryClient";

export function usePageViewTracking() {
  const location = useLocation();
  const enteredAtRef = useRef(Date.now());
  const previousPathRef = useRef<string | null>(null);
  const referrerPathRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const previousPath = previousPathRef.current;

    if (previousPath && previousPath !== location.pathname) {
      trackPageLeave(previousPath, Date.now() - enteredAtRef.current);
    }

    refreshCorrelationOnNavigation();
    trackPageView(location.pathname, referrerPathRef.current);

    previousPathRef.current = location.pathname;
    referrerPathRef.current = location.pathname;
    enteredAtRef.current = Date.now();
  }, [location.pathname]);
}
