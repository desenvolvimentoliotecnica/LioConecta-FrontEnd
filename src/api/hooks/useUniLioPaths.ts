import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapUniLioPathDetailFromApi, mapUniLioPathsFromApi } from "../unilio/mapFromApi";
import { buildMockPathDetail, buildMockPaths } from "../../config/unilio/apiMockData";

export function useUniLioPaths() {
  const query = useQuery({
    queryKey: ["unilio", "paths"],
    queryFn: async () => mapUniLioPathsFromApi(await api.get("/unilio/paths")),
    enabled: !config.useMock,
    staleTime: 120_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(
    () =>
      config.useMock || query.isError
        ? mapUniLioPathsFromApi(buildMockPaths())
        : (query.data ?? mapUniLioPathsFromApi(buildMockPaths())),
    [query.data, query.isError],
  );

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}

export function useUniLioPathDetail(pathId: string | undefined) {
  const query = useQuery({
    queryKey: ["unilio", "path", pathId],
    queryFn: async () => mapUniLioPathDetailFromApi(await api.get(`/unilio/paths/${pathId}`)),
    enabled: !config.useMock && Boolean(pathId),
    staleTime: 60_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(() => {
    if (!pathId) return null;
    if (config.useMock || query.isError) {
      const mock = buildMockPathDetail(pathId);
      return mock ? mapUniLioPathDetailFromApi(mock) : null;
    }
    return query.data ?? null;
  }, [pathId, query.data, query.isError]);

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}
