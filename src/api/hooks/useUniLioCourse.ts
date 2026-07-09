import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapUniLioCourseFromApi } from "../unilio/mapFromApi";
import { buildMockCourse } from "../../config/unilio/apiMockData";

export function useUniLioCourse(courseId: string | undefined) {
  const query = useQuery({
    queryKey: ["unilio", "course", courseId],
    queryFn: async () => mapUniLioCourseFromApi(await api.get(`/unilio/courses/${courseId}`)),
    enabled: !config.useMock && Boolean(courseId),
    staleTime: 60_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(() => {
    if (!courseId) return null;
    if (config.useMock || query.isError) {
      const mock = buildMockCourse(courseId);
      return mock ? mapUniLioCourseFromApi(mock) : null;
    }
    return query.data ?? null;
  }, [courseId, query.data, query.isError]);

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}
