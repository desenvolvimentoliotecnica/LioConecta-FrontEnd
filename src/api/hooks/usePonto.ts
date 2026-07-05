import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import type { PontoPeriodSettingsDto, PontoResponseDto } from "../types";

export const PONTO_QUERY_KEY = ["ponto"] as const;
export const PONTO_PERIODS_QUERY_KEY = ["ponto", "periods"] as const;

export function usePontoPeriods() {
  return useQuery({
    queryKey: PONTO_PERIODS_QUERY_KEY,
    queryFn: () => api.get<PontoPeriodSettingsDto>("/rh/ponto/periods"),
    retry: config.useMock ? 0 : 1,
  });
}

export function usePonto(month: number, year: number) {
  return useQuery({
    queryKey: [...PONTO_QUERY_KEY, year, month],
    queryFn: () =>
      api.get<PontoResponseDto>(`/rh/ponto?month=${month}&year=${year}`),
    retry: config.useMock ? 0 : 1,
  });
}
