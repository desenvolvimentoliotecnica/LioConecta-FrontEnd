import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
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

/** Open to all users — provides filters context without access gate. */
export function PulseAccessGate({ children }: { children: ReactNode }) {
  return <PulseFiltersProvider>{children}</PulseFiltersProvider>;
}
