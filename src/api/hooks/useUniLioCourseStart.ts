import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";

export function useUniLioCourseStart(courseId: string | undefined) {
  const queryClient = useQueryClient();
  const startedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!courseId || config.useMock || startedRef.current === courseId) {
      return;
    }

    startedRef.current = courseId;

    void api
      .post(`/unilio/courses/${courseId}/start`, {})
      .then(() => {
        void queryClient.invalidateQueries({ queryKey: ["unilio", "course", courseId] });
        void queryClient.invalidateQueries({ queryKey: ["unilio"] });
      })
      .catch(() => {
        startedRef.current = null;
      });
  }, [courseId, queryClient]);
}
