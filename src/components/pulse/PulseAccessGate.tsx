import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { canAccessPulseModule } from "../../api/auth";
import { useLoopSettings } from "../../api/hooks/useLoopSettings";
import { PERMISSIONS } from "../../config/rbac/permissions";
import { usePermissions } from "../../hooks/usePermissions";
import type { PulseFilters } from "../../config/pulse/types";
import { ModuleAccessDenied } from "../auth/ModuleAccessDenied";

type PulseFiltersContextValue = {
  filters: PulseFilters;
  setTeamId: (teamId: string | undefined) => void;
  setSprintId: (sprintId: string | undefined) => void;
  setStatus: (status: string | undefined) => void;
  setSearch: (search: string | undefined) => void;
  resetFilters: () => void;
};

const defaultFilters: PulseFilters = {};

const PulseFiltersContext = createContext<PulseFiltersContextValue | null>(null);

export function PulseFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<PulseFilters>(defaultFilters);

  const value = useMemo<PulseFiltersContextValue>(
    () => ({
      filters,
      setTeamId: (teamId) => setFilters((f) => ({ ...f, teamId: teamId || undefined })),
      setSprintId: (sprintId) => setFilters((f) => ({ ...f, sprintId: sprintId || undefined })),
      setStatus: (status) => setFilters((f) => ({ ...f, status: status || undefined })),
      setSearch: (search) => setFilters((f) => ({ ...f, search: search || undefined })),
      resetFilters: () => setFilters(defaultFilters),
    }),
    [filters],
  );

  return <PulseFiltersContext.Provider value={value}>{children}</PulseFiltersContext.Provider>;
}

export function usePulseFilters(): PulseFiltersContextValue {
  const ctx = useContext(PulseFiltersContext);
  if (!ctx) throw new Error("usePulseFilters must be used within PulseFiltersProvider");
  return ctx;
}

export function PulseAccessGate({ children }: { children: ReactNode }) {
  const { me, isLoading: permissionsLoading } = usePermissions();
  const { data: settings, isLoading: settingsLoading } = useLoopSettings();

  if (permissionsLoading || settingsLoading) {
    return (
      <main className="main">
        <p className="loop-page__loading">Carregando módulo Pulse…</p>
      </main>
    );
  }

  const granted = canAccessPulseModule(me, settings);

  if (!granted) {
    return (
      <ModuleAccessDenied
        moduleName="Pulse Ágil"
        permissionKey={`${PERMISSIONS.pulse.access} ou ${PERMISSIONS.loop.access}`}
        breadcrumb={
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Início</Link>
            <span className="breadcrumb__sep">/</span>
            <span className="breadcrumb__current">Pulse Ágil</span>
          </nav>
        }
      />
    );
  }

  return <PulseFiltersProvider>{children}</PulseFiltersProvider>;
}
