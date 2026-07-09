import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapUniLioComplianceFromApi } from "../unilio/mapFromApi";
import { buildMockCompliance } from "../../config/unilio/apiMockData";

export function useUniLioCompliance() {
  const query = useQuery({
    queryKey: ["unilio", "compliance"],
    queryFn: async () => mapUniLioComplianceFromApi(await api.get("/unilio/compliance")),
    enabled: !config.useMock,
    staleTime: 60_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(
    () =>
      config.useMock || query.isError
        ? mapUniLioComplianceFromApi(buildMockCompliance())
        : (query.data ?? mapUniLioComplianceFromApi(buildMockCompliance())),
    [query.data, query.isError],
  );

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}
