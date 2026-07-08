import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { canAccessCompassModule } from "../../api/auth";
import { useCompassSettings } from "../../api/hooks/useCompassSettings";
import { useMe } from "../../api/hooks/useMe";
import type { CompassFilters } from "../../config/compass/types";

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
  const { data: me, isLoading: meLoading } = useMe();
  const { data: settings, isLoading: settingsLoading } = useCompassSettings();

  if (meLoading || settingsLoading) {
    return (
      <main className="main">
        <p className="compass-page__loading">Carregando módulo Compass…</p>
      </main>
    );
  }

  if (!canAccessCompassModule(me, settings)) {
    return (
      <main className="main">
        <header className="page-header">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Início</Link>
            <span className="breadcrumb__sep">/</span>
            <span className="breadcrumb__current">Compass IBP</span>
          </nav>
          <h1 className="page-header__title">Acesso restrito</h1>
          <p className="page-header__desc">
            O módulo Compass IBP não está disponível para seu perfil. Solicite acesso ao administrador ou verifique as
            permissões em{" "}
            <Link to="/admin/configuracoes-backend?category=compass">Configurações do Backend → Compass</Link>.
          </p>
        </header>
      </main>
    );
  }

  return <CompassFiltersProvider>{children}</CompassFiltersProvider>;
}
