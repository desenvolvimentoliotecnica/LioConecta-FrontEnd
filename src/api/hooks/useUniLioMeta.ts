import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapUniLioMetaFromApi } from "../unilio/mapFromApi";
import { UNILIO_API_MOCK_META } from "../../config/unilio/apiMockData";

export const UNILIO_META_QUERY_KEY = ["unilio", "meta"] as const;

export function useUniLioMeta() {
  const query = useQuery({
    queryKey: UNILIO_META_QUERY_KEY,
    queryFn: async () => mapUniLioMetaFromApi(await api.get("/unilio/meta")),
    enabled: !config.useMock,
    staleTime: 120_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(
    () => (config.useMock || query.isError ? mapUniLioMetaFromApi(UNILIO_API_MOCK_META) : (query.data ?? mapUniLioMetaFromApi(UNILIO_API_MOCK_META))),
    [query.data, query.isError],
  );

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}
