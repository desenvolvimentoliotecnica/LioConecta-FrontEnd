import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

type ModuleFocusContextValue = {
  focusMode: boolean;
  toggleFocusMode: () => void;
  setFocusMode: (value: boolean) => void;
  isModuleRoute: boolean;
};

const ModuleFocusContext = createContext<ModuleFocusContextValue | null>(null);

const FOCUSABLE_MODULE_PREFIXES = ["/loop", "/pulse", "/compass", "/unilio"] as const;

function isFocusableModulePath(pathname: string): boolean {
  if (pathname.startsWith("/unilio/curso/")) {
    return true;
  }

  return FOCUSABLE_MODULE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function ModuleFocusProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isModuleRoute = isFocusableModulePath(location.pathname);
  const [focusMode, setFocusModeState] = useState(false);

  useEffect(() => {
    if (!isModuleRoute && focusMode) {
      setFocusModeState(false);
    }
  }, [isModuleRoute, focusMode]);

  const setFocusMode = useCallback((value: boolean) => {
    setFocusModeState(value);
  }, []);

  const toggleFocusMode = useCallback(() => {
    setFocusModeState((current) => !current);
  }, []);

  const value = useMemo<ModuleFocusContextValue>(
    () => ({
      focusMode: isModuleRoute && focusMode,
      toggleFocusMode,
      setFocusMode,
      isModuleRoute,
    }),
    [focusMode, isModuleRoute, setFocusMode, toggleFocusMode],
  );

  return <ModuleFocusContext.Provider value={value}>{children}</ModuleFocusContext.Provider>;
}

export function useModuleFocus(): ModuleFocusContextValue {
  const ctx = useContext(ModuleFocusContext);
  if (!ctx) throw new Error("useModuleFocus must be used within ModuleFocusProvider");
  return ctx;
}
