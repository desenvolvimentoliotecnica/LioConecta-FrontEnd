import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapUniLioRecommendationsFromApi } from "../unilio/mapFromApi";
import { buildMockRecommendations } from "../../config/unilio/apiMockData";

export function useUniLioRecommendations() {
  const query = useQuery({
    queryKey: ["unilio", "recommendations"],
    queryFn: async () => mapUniLioRecommendationsFromApi(await api.get("/unilio/recommendations")),
    enabled: !config.useMock,
    staleTime: 60_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(
    () =>
      config.useMock || query.isError
        ? mapUniLioRecommendationsFromApi(buildMockRecommendations())
        : (query.data ?? mapUniLioRecommendationsFromApi(buildMockRecommendations())),
    [query.data, query.isError],
  );

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}
