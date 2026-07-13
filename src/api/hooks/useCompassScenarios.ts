import { useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import type { CompassScenarioRowsPageDto, CompassScenariosDto } from "../types";

export type CompassScenariosFilters = {
  version?: string;
  scenario?: string;
  years?: string;
  period?: string;
};

export type CompassScenarioSortBy =
  | "sku"
  | "skuDescription"
  | "cliente"
  | "ung"
  | "entity"
  | "amount";

export type CompassScenarioSortDir = "asc" | "desc";

export type CompassScenarioRowFilters = CompassScenariosFilters & {
  search?: string;
  ung?: string;
  sku?: string;
  skuDescription?: string;
  cliente?: string;
  ungLabel?: string;
  entity?: string;
  sortBy?: CompassScenarioSortBy;
  sortDir?: CompassScenarioSortDir;
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
      description: "Peso financeiro por SKU (visão consolidada — sem cliente/UN).",
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
      {
        sku: "SKU_120070420",
        skuDescription: "PRODUTO EXEMPLO A",
        cliente: "CLI_16195",
        clienteNome: "BOMGOSTO IND",
        ung: "UN_7",
        ungNome: "DISTRIBUIDOR FOOD SERVICE",
        entity: "Total_CC",
        amount: 12540.5,
      },
      {
        sku: "SKU_120080883",
        skuDescription: "PRODUTO EXEMPLO B",
        cliente: "CLI_24236",
        clienteNome: "AB BR07",
        ung: "UN_10",
        ungNome: "Soluções B2B",
        entity: "Total_CC",
        amount: 8320.2,
      },
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
      {
        sku: "SKU_120070420",
        skuDescription: "PRODUTO EXEMPLO A",
        cliente: "CLI_16195",
        clienteNome: "BOMGOSTO IND",
        ung: "UN_7",
        ungNome: "DISTRIBUIDOR FOOD SERVICE",
        entity: "Global_CC",
        amount: 4200,
      },
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
      {
        sku: "SKU_120501011",
        skuDescription: "OVOM 1,5MM SEM VITAMINAS 25KG RTD",
        cliente: "NA_Cliente",
        clienteNome: "",
        ung: "NA_UNG",
        ungNome: "",
        entity: "Global_CC",
        amount: 12.45,
      },
    ],
    page: 1,
    pageSize: 25,
    totalCount: 421,
    totalAmount: 1873.094,
    totalPages: 17,
  },
};

function buildQueryString(
  filters: CompassScenarioRowFilters & { page?: number; pageSize?: number },
): string {
  const params = new URLSearchParams();
  if (filters.version) params.set("version", filters.version);
  if (filters.scenario) params.set("scenario", filters.scenario);
  if (filters.years) params.set("years", filters.years);
  if (filters.period) params.set("period", filters.period);
  if (filters.search) params.set("search", filters.search);
  if (filters.ung) params.set("ung", filters.ung);
  if (filters.sku) params.set("sku", filters.sku);
  if (filters.skuDescription) params.set("skuDescription", filters.skuDescription);
  if (filters.cliente) params.set("cliente", filters.cliente);
  if (filters.ungLabel) params.set("ungLabel", filters.ungLabel);
  if (filters.entity) params.set("entity", filters.entity);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortDir) params.set("sortDir", filters.sortDir);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function hasActiveRowFilters(filters: CompassScenarioRowFilters): boolean {
  return Boolean(
    filters.search?.trim() ||
      filters.sku?.trim() ||
      filters.skuDescription?.trim() ||
      filters.cliente?.trim() ||
      filters.ungLabel?.trim() ||
      filters.entity?.trim(),
  );
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

type RowsMode = "page" | "infinite";

export function useCompassScenarioRows(
  scenarioId: string | null,
  filters: CompassScenarioRowFilters,
  options: { mode: RowsMode; page?: number; pageSize?: number },
) {
  const pageSize = options.pageSize ?? 25;
  const page = options.page ?? 1;
  const infinite = options.mode === "infinite";
  const enabled = !config.useMock && Boolean(scenarioId);

  const pageQuery = useQuery({
    queryKey: ["compass", "scenarios", scenarioId, "rows", "page", filters, page, pageSize],
    queryFn: () =>
      api.get<CompassScenarioRowsPageDto>(
        `/compass/scenarios/${scenarioId}/rows${buildQueryString({ ...filters, page, pageSize })}`,
      ),
    enabled: enabled && !infinite,
    staleTime: 30_000,
  });

  const infiniteQuery = useInfiniteQuery({
    queryKey: ["compass", "scenarios", scenarioId, "rows", "infinite", filters, pageSize],
    queryFn: ({ pageParam }) =>
      api.get<CompassScenarioRowsPageDto>(
        `/compass/scenarios/${scenarioId}/rows${buildQueryString({
          ...filters,
          page: pageParam,
          pageSize,
        })}`,
      ),
    enabled: enabled && infinite,
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    staleTime: 30_000,
  });

  const isFallback = config.useMock || (infinite ? infiniteQuery.isError : pageQuery.isError);

  const data = useMemo((): CompassScenarioRowsPageDto | null => {
    if (!scenarioId) return null;
    if (config.useMock || isFallback) {
      return MOCK_ROWS[scenarioId] ?? null;
    }
    if (infinite) {
      const pages = infiniteQuery.data?.pages;
      if (!pages?.length) return null;
      const first = pages[0];
      return {
        ...first,
        items: pages.flatMap((p) => p.items),
        page: pages[pages.length - 1]?.page ?? first.page,
      };
    }
    return pageQuery.data ?? null;
  }, [scenarioId, isFallback, infinite, infiniteQuery.data, pageQuery.data]);

  return {
    data,
    isLoading:
      !config.useMock &&
      Boolean(scenarioId) &&
      (infinite ? infiniteQuery.isLoading : pageQuery.isLoading),
    isFetchingNextPage: infinite && !config.useMock && infiniteQuery.isFetchingNextPage,
    hasNextPage: infinite && !config.useMock && Boolean(infiniteQuery.hasNextPage),
    fetchNextPage: infiniteQuery.fetchNextPage,
    isError: !config.useMock && (infinite ? infiniteQuery.isError : pageQuery.isError),
    isFallback,
    refetch: infinite ? infiniteQuery.refetch : pageQuery.refetch,
  };
}
