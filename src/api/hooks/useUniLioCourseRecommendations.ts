import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapUniLioRecommendationsFromApi } from "../unilio/mapFromApi";
import { buildMockCourseRecommendations } from "../../config/unilio/apiMockData";

export function useUniLioCourseRecommendations(courseId: string | undefined, enabled: boolean) {
  const query = useQuery({
    queryKey: ["unilio", "course-recommendations", courseId],
    queryFn: async () =>
      mapUniLioRecommendationsFromApi(
        await api.get(`/unilio/courses/${courseId}/recommendations`),
      ),
    enabled: !config.useMock && enabled && Boolean(courseId),
    staleTime: 0,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(() => {
    if (!courseId) return { items: [] };
    if (config.useMock || query.isError) {
      return mapUniLioRecommendationsFromApi(buildMockCourseRecommendations(courseId));
    }
    return query.data ?? mapUniLioRecommendationsFromApi(buildMockCourseRecommendations(courseId));
  }, [courseId, query.data, query.isError]);

  return {
    data,
    isLoading: !config.useMock && enabled && query.isLoading,
    isFallback,
  };
}
