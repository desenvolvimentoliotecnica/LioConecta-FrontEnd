import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { canAccessLoopModule } from "../../api/auth";
import { useLoopSettings } from "../../api/hooks/useLoopSettings";
import { useMe } from "../../api/hooks/useMe";
import type { LoopFilters, LoopPeriod } from "../../config/loop/types";

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
  const { data: me, isLoading: meLoading } = useMe();
  const { data: settings, isLoading: settingsLoading } = useLoopSettings();

  if (meLoading || settingsLoading) {
    return (
      <main className="main">
        <p className="loop-page__loading">Carregando módulo Loop…</p>
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
            <span className="breadcrumb__current">Loop de Projetos</span>
          </nav>
          <h1 className="page-header__title">Acesso restrito</h1>
          <p className="page-header__desc">
            O módulo Loop de Projetos não está disponível para seu perfil. Solicite acesso ao administrador
            ou verifique as permissões em{" "}
            <Link to="/admin/configuracoes-backend?category=loop">Configurações do Backend → Loop</Link>.
          </p>
        </header>
      </main>
    );
  }

  return <LoopFiltersProvider>{children}</LoopFiltersProvider>;
}
