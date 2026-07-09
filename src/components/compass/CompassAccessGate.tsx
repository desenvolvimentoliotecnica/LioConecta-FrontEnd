import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useCompassSettings } from "../../api/hooks/useCompassSettings";
import { PERMISSIONS } from "../../config/rbac/permissions";
import { usePermissions } from "../../hooks/usePermissions";
import type { CompassFilters } from "../../config/compass/types";
import { ModuleAccessDenied } from "../auth/ModuleAccessDenied";

type CompassFiltersContextValue = {
  filters: CompassFilters;
  setDiretoria: (diretoria: string | undefined) => void;
  setUnidade: (unidade: string | undefined) => void;
  setFamilia: (familia: string | undefined) => void;
  setTipo: (tipo: string | undefined) => void;
  setSearch: (search: string | undefined) => void;
  resetFilters: () => void;
};

const defaultFilters: CompassFilters = {};

const CompassFiltersContext = createContext<CompassFiltersContextValue | null>(null);

export function CompassFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<CompassFilters>(defaultFilters);

  const value = useMemo<CompassFiltersContextValue>(
    () => ({
      filters,
      setDiretoria: (diretoria) => setFilters((f) => ({ ...f, diretoria: diretoria || undefined })),
      setUnidade: (unidade) => setFilters((f) => ({ ...f, unidade: unidade || undefined })),
      setFamilia: (familia) => setFilters((f) => ({ ...f, familia: familia || undefined })),
      setTipo: (tipo) => setFilters((f) => ({ ...f, tipo: tipo || undefined })),
      setSearch: (search) => setFilters((f) => ({ ...f, search: search || undefined })),
      resetFilters: () => setFilters(defaultFilters),
    }),
    [filters],
  );

  return <CompassFiltersContext.Provider value={value}>{children}</CompassFiltersContext.Provider>;
}

export function useCompassFilters(): CompassFiltersContextValue {
  const ctx = useContext(CompassFiltersContext);
  if (!ctx) throw new Error("useCompassFilters must be used within CompassFiltersProvider");
  return ctx;
}

export function CompassAccessGate({ children }: { children: ReactNode }) {
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const { data: settings, isLoading: settingsLoading } = useCompassSettings();

  if (permissionsLoading || settingsLoading) {
    return (
      <main className="main">
        <p className="compass-page__loading">Carregando módulo Compass…</p>
      </main>
    );
  }

  const granted = hasPermission(PERMISSIONS.compass.access) && settings?.enabled !== false;

  if (!granted) {
    return (
      <ModuleAccessDenied
        moduleName="Compass IBP"
        permissionKey={PERMISSIONS.compass.access}
        breadcrumb={
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Início</Link>
            <span className="breadcrumb__sep">/</span>
            <span className="breadcrumb__current">Compass IBP</span>
          </nav>
        }
      />
    );
  }

  return <CompassFiltersProvider>{children}</CompassFiltersProvider>;
}
