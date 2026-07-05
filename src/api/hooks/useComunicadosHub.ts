import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import type { ComunicadoHubDto } from "../types";

export const COMUNICADOS_HUB_QUERY_KEY = [...["comunicados"], "hub"] as const;

export function useComunicadosHub() {
  return useQuery({
    queryKey: COMUNICADOS_HUB_QUERY_KEY,
    queryFn: async (): Promise<ComunicadoHubDto | null> => {
      if (config.useMock) return null;
      return api.get<ComunicadoHubDto>("/comunicados/hub");
    },
    retry: config.useMock ? 0 : 1,
  });
}
