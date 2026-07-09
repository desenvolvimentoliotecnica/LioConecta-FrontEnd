import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapUniLioSkillsFromApi } from "../unilio/mapFromApi";
import { buildMockSkills } from "../../config/unilio/apiMockData";

export function useUniLioSkills() {
  const query = useQuery({
    queryKey: ["unilio", "skills"],
    queryFn: async () => mapUniLioSkillsFromApi(await api.get("/unilio/skills")),
    enabled: !config.useMock,
    staleTime: 120_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(
    () =>
      config.useMock || query.isError
        ? mapUniLioSkillsFromApi(buildMockSkills())
        : (query.data ?? mapUniLioSkillsFromApi(buildMockSkills())),
    [query.data, query.isError],
  );

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}
