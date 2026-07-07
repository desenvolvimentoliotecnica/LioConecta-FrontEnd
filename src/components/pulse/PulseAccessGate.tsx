import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { canAccessLoopModule } from "../../api/auth";
import { useLoopSettings } from "../../api/hooks/useLoopSettings";
import { useMe } from "../../api/hooks/useMe";
import type { PulseFilters } from "../../config/pulse/types";

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
  const { data: me, isLoading: meLoading } = useMe();
  const { data: settings, isLoading: settingsLoading } = useLoopSettings();

  if (meLoading || settingsLoading) {
    return (
      <main className="main">
        <p className="loop-page__loading">Carregando módulo Pulse…</p>
      </main>
    );
  }

  if (!canAccessLoopModule(me, settings)) {
    return (
      <main className="main">
        <header className="page-header">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Início</Link>
            <span className="breadcrumb__sep">/</span>
            <span className="breadcrumb__current">Pulse Ágil</span>
          </nav>
          <h1 className="page-header__title">Acesso restrito</h1>
          <p className="page-header__desc">
            O módulo Pulse Ágil compartilha as permissões do Loop de Projetos. Solicite acesso ao administrador
            ou verifique as permissões em{" "}
            <Link to="/admin/configuracoes-backend?category=loop">Configurações do Backend → Loop</Link>.
          </p>
        </header>
      </main>
    );
  }

  return <PulseFiltersProvider>{children}</PulseFiltersProvider>;
}
