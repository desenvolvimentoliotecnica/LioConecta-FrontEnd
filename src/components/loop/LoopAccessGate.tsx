import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useLoopSettings } from "../../api/hooks/useLoopSettings";
import { PERMISSIONS } from "../../config/rbac/permissions";
import { usePermissions } from "../../hooks/usePermissions";
import type { LoopFilters, LoopPeriod } from "../../config/loop/types";
import { ModuleAccessDenied } from "../auth/ModuleAccessDenied";

type LoopFiltersContextValue = {
  filters: LoopFilters;
  setPeriod: (period: LoopPeriod) => void;
  setTeamId: (teamId: string | undefined) => void;
  setProjectId: (projectId: string | undefined) => void;
  setStatus: (status: string | undefined) => void;
  setSearch: (search: string | undefined) => void;
  resetFilters: () => void;
};

const defaultFilters: LoopFilters = { period: "30d" };

const LoopFiltersContext = createContext<LoopFiltersContextValue | null>(null);

export function LoopFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<LoopFilters>(defaultFilters);

  const value = useMemo<LoopFiltersContextValue>(
    () => ({
      filters,
      setPeriod: (period) => setFilters((f) => ({ ...f, period })),
      setTeamId: (teamId) => setFilters((f) => ({ ...f, teamId: teamId || undefined })),
      setProjectId: (projectId) => setFilters((f) => ({ ...f, projectId: projectId || undefined })),
      setStatus: (status) => setFilters((f) => ({ ...f, status: status || undefined })),
      setSearch: (search) => setFilters((f) => ({ ...f, search: search || undefined })),
      resetFilters: () => setFilters(defaultFilters),
    }),
    [filters],
  );

  return <LoopFiltersContext.Provider value={value}>{children}</LoopFiltersContext.Provider>;
}

export function useLoopFilters(): LoopFiltersContextValue {
  const ctx = useContext(LoopFiltersContext);
  if (!ctx) throw new Error("useLoopFilters must be used within LoopFiltersProvider");
  return ctx;
}

export function LoopAccessGate({ children }: { children: ReactNode }) {
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const { data: settings, isLoading: settingsLoading } = useLoopSettings();

  if (permissionsLoading || settingsLoading) {
    return (
      <main className="main">
        <p className="loop-page__loading">Carregando módulo Loop…</p>
      </main>
    );
  }

  const granted = hasPermission(PERMISSIONS.loop.access) && settings?.enabled !== false;

  if (!granted) {
    return (
      <ModuleAccessDenied
        moduleName="Loop de Projetos"
        permissionKey={PERMISSIONS.loop.access}
        breadcrumb={
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Início</Link>
            <span className="breadcrumb__sep">/</span>
            <span className="breadcrumb__current">Loop de Projetos</span>
          </nav>
        }
      />
    );
  }

  return <LoopFiltersProvider>{children}</LoopFiltersProvider>;
}
