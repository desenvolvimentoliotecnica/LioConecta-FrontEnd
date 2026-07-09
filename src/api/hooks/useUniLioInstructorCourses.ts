import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import { mapUniLioInstructorCoursesFromApi } from "../unilio/mapFromApi";
import { buildMockInstructorCourses } from "../../config/unilio/apiMockData";

export function useUniLioInstructorCourses() {
  const query = useQuery({
    queryKey: ["unilio", "instructor", "courses"],
    queryFn: async () => mapUniLioInstructorCoursesFromApi(await api.get("/unilio/instructor/courses")),
    enabled: !config.useMock,
    staleTime: 60_000,
  });

  const isFallback = config.useMock || query.isError;

  const data = useMemo(
    () =>
      config.useMock || query.isError
        ? mapUniLioInstructorCoursesFromApi(buildMockInstructorCourses())
        : (query.data ?? mapUniLioInstructorCoursesFromApi(buildMockInstructorCourses())),
    [query.data, query.isError],
  );

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isError: !config.useMock && query.isError,
    isFallback,
  };
}
