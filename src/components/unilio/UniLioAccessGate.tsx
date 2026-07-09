import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { canAccessUniLioModule } from "../../api/auth";
import { useUniLioSettings } from "../../api/hooks/useUniLioSettings";
import { useMe } from "../../api/hooks/useMe";
import type { UniLioFilters } from "../../config/unilio/types";

type UniLioFiltersContextValue = {
  filters: UniLioFilters;
  setArea: (area: string | undefined) => void;
  setDepartment: (department: string | undefined) => void;
  setContentType: (contentType: string | undefined) => void;
  setStatus: (status: string | undefined) => void;
  setSearch: (search: string | undefined) => void;
  setPeriod: (period: string | undefined) => void;
  resetFilters: () => void;
};

const defaultFilters: UniLioFilters = {};

const UniLioFiltersContext = createContext<UniLioFiltersContextValue | null>(null);

export function UniLioFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<UniLioFilters>(defaultFilters);

  const value = useMemo<UniLioFiltersContextValue>(
    () => ({
      filters,
      setArea: (area) => setFilters((f) => ({ ...f, area: area || undefined })),
      setDepartment: (department) => setFilters((f) => ({ ...f, department: department || undefined })),
      setContentType: (contentType) => setFilters((f) => ({ ...f, contentType: contentType || undefined })),
      setStatus: (status) => setFilters((f) => ({ ...f, status: status || undefined })),
      setSearch: (search) => setFilters((f) => ({ ...f, search: search || undefined })),
      setPeriod: (period) => setFilters((f) => ({ ...f, period: period || undefined })),
      resetFilters: () => setFilters(defaultFilters),
    }),
    [filters],
  );

  return <UniLioFiltersContext.Provider value={value}>{children}</UniLioFiltersContext.Provider>;
}

export function useUniLioFilters(): UniLioFiltersContextValue {
  const ctx = useContext(UniLioFiltersContext);
  if (!ctx) throw new Error("useUniLioFilters must be used within UniLioFiltersProvider");
  return ctx;
}

export function UniLioAccessGate({ children }: { children: ReactNode }) {
  const { data: me, isLoading: meLoading } = useMe();
  const { data: settings, isLoading: settingsLoading } = useUniLioSettings();

  if (meLoading || settingsLoading) {
    return (
      <main className="main">
        <p className="unilio-page__loading">Carregando módulo UniLio…</p>
      </main>
    );
  }

  if (!canAccessUniLioModule(me, settings)) {
    return (
      <main className="main">
        <header className="page-header">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Início</Link>
            <span className="breadcrumb__sep">/</span>
            <span className="breadcrumb__current">UniLio</span>
          </nav>
          <h1 className="page-header__title">Acesso restrito</h1>
          <p className="page-header__desc">
            O portal UniLio não está disponível para seu perfil. Solicite acesso ao administrador ou verifique as
            permissões em{" "}
            <Link to="/admin/configuracoes-backend?category=unilio">Configurações do Backend → UniLio</Link>.
          </p>
        </header>
      </main>
    );
  }

  return <UniLioFiltersProvider>{children}</UniLioFiltersProvider>;
}
