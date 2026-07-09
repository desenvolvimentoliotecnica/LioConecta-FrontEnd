import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapUniLioEventsFromApi } from "../unilio/mapFromApi";
import { buildMockEvents } from "../../config/unilio/apiMockData";

export function useUniLioEvents() {
  const query = useQuery({
    queryKey: ["unilio", "events"],
    queryFn: async () => mapUniLioEventsFromApi(await api.get("/unilio/events")),
    enabled: !config.useMock,
    staleTime: 60_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(
    () =>
      config.useMock || query.isError
        ? mapUniLioEventsFromApi(buildMockEvents())
        : (query.data ?? mapUniLioEventsFromApi(buildMockEvents())),
    [query.data, query.isError],
  );

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}
