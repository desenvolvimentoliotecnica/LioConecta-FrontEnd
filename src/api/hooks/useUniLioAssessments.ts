import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapUniLioAssessmentsFromApi } from "../unilio/mapFromApi";
import { buildMockAssessments } from "../../config/unilio/apiMockData";

export function useUniLioAssessments() {
  const query = useQuery({
    queryKey: ["unilio", "assessments"],
    queryFn: async () => mapUniLioAssessmentsFromApi(await api.get("/unilio/assessments")),
    enabled: !config.useMock,
    staleTime: 60_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(
    () =>
      config.useMock || query.isError
        ? mapUniLioAssessmentsFromApi(buildMockAssessments())
        : (query.data ?? mapUniLioAssessmentsFromApi(buildMockAssessments())),
    [query.data, query.isError],
  );

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}
