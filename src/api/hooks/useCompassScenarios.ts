import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import type { CompassScenarioRowsPageDto, CompassScenariosDto } from "../types";

export type CompassScenariosFilters = {
  version?: string;
  scenario?: string;
  years?: string;
  period?: string;
};

export const SCENARIO_YEARS = ["FY26"] as const;
export const SCENARIO_PERIODS = ["Jan", "Feb", "May", "Jun"] as const;

const MOCK_SCENARIOS: CompassScenariosDto = {
  configured: true,
  message: null,
  filters: {
    version: "Oficial",
    scenario: "Orcado",
    years: "FY26",
    period: "Jan",
  },
  scenarios: [
    {
      id: "volume-toneladas",
      account: "Volume_Toneladas",
      name: "Volume (t)",
      description: "Volume em toneladas por SKU e cliente nas unidades comerciais.",
      rowCount: 11451,
      totalAmount: 3728084.13,
      status: "ativo",
    },
    {
      id: "volume-qtde-vendas",
      account: "Volume_Qtde_Vendas",
      name: "Volume (unidades)",
      description: "Volume em unidades de venda por SKU e cliente.",
      rowCount: 11451,
      totalAmount: 1490400,
      status: "ativo",
    },
    {
      id: "peso-financeiro",
      account: "Peso_Financeiro",
      name: "Peso financeiro",
      description: "Peso financeiro por SKU (visão consolidada, sem cliente).",
      rowCount: 421,
      totalAmount: 1873.094,
      status: "ativo",
    },
  ],
};

const MOCK_ROWS: Record<string, CompassScenarioRowsPageDto> = {
  "volume-toneladas": {
    scenarioId: "volume-toneladas",
    account: "Volume_Toneladas",
    name: "Volume (t)",
    configured: true,
    message: null,
    filters: MOCK_SCENARIOS.filters,
    items: [
      { sku: "SKU_120070420", cliente: "PENNACCHI", ung: "UN_7", entity: "Total_CC", amount: 12540.5 },
      { sku: "SKU_120080883", cliente: "BOMBONZAO", ung: "UN_7", entity: "Total_CC", amount: 8320.2 },
    ],
    page: 1,
    pageSize: 25,
    totalCount: 11451,
    totalAmount: 3728084.13,
    totalPages: 459,
  },
  "volume-qtde-vendas": {
    scenarioId: "volume-qtde-vendas",
    account: "Volume_Qtde_Vendas",
    name: "Volume (unidades)",
    configured: true,
    message: null,
    filters: MOCK_SCENARIOS.filters,
    items: [
      { sku: "SKU_120070420", cliente: "PENNACCHI", ung: "UN_7", entity: "Global_CC", amount: 4200 },
    ],
    page: 1,
    pageSize: 25,
    totalCount: 11451,
    totalAmount: 1490400,
    totalPages: 459,
  },
  "peso-financeiro": {
    scenarioId: "peso-financeiro",
    account: "Peso_Financeiro",
    name: "Peso financeiro",
    configured: true,
    message: null,
    filters: MOCK_SCENARIOS.filters,
    items: [
      { sku: "SKU_120070420", cliente: "NA_Cliente", ung: "NA_UNG", entity: "Global_CC", amount: 12.45 },
    ],
    page: 1,
    pageSize: 25,
    totalCount: 421,
    totalAmount: 1873.094,
    totalPages: 17,
  },
};

function buildQueryString(
  filters: CompassScenariosFilters & { search?: string; ung?: string; page?: number; pageSize?: number },
): string {
  const params = new URLSearchParams();
  if (filters.version) params.set("version", filters.version);
  if (filters.scenario) params.set("scenario", filters.scenario);
  if (filters.years) params.set("years", filters.years);
  if (filters.period) params.set("period", filters.period);
  if (filters.search) params.set("search", filters.search);
  if (filters.ung) params.set("ung", filters.ung);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useCompassScenarios(filters: CompassScenariosFilters = {}) {
  const query = useQuery({
    queryKey: ["compass", "scenarios", filters],
    queryFn: () =>
      api.get<CompassScenariosDto>(`/compass/scenarios${buildQueryString(filters)}`),
    enabled: !config.useMock,
    staleTime: 60_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(() => {
    if (config.useMock) return MOCK_SCENARIOS;
    if (query.isError) return MOCK_SCENARIOS;
    return query.data ?? null;
  }, [query.data, query.isError]);

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
    refetch: query.refetch,
  };
}

export function useCompassScenarioRows(
  scenarioId: string | null,
  filters: CompassScenariosFilters & { search?: string; ung?: string },
  page: number,
  pageSize = 25,
) {
  const query = useQuery({
    queryKey: ["compass", "scenarios", scenarioId, "rows", filters, page, pageSize],
    queryFn: () =>
      api.get<CompassScenarioRowsPageDto>(
        `/compass/scenarios/${scenarioId}/rows${buildQueryString({ ...filters, page, pageSize })}`,
      ),
    enabled: !config.useMock && Boolean(scenarioId),
    staleTime: 30_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(() => {
    if (!scenarioId) return null;
    if (config.useMock || query.isError) {
      return MOCK_ROWS[scenarioId] ?? null;
    }
    return query.data ?? null;
  }, [scenarioId, query.data, query.isError]);

  return {
    data,
    isLoading: !config.useMock && Boolean(scenarioId) && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
    refetch: query.refetch,
  };
}
