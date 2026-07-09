import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapUniLioManagerTeamFromApi } from "../unilio/mapFromApi";
import { buildMockManagerTeam } from "../../config/unilio/apiMockData";

export function useUniLioManagerTeam() {
  const query = useQuery({
    queryKey: ["unilio", "manager", "team"],
    queryFn: async () => mapUniLioManagerTeamFromApi(await api.get("/unilio/manager/team")),
    enabled: !config.useMock,
    staleTime: 60_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(
    () =>
      config.useMock || query.isError
        ? mapUniLioManagerTeamFromApi(buildMockManagerTeam())
        : (query.data ?? mapUniLioManagerTeamFromApi(buildMockManagerTeam())),
    [query.data, query.isError],
  );

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}
