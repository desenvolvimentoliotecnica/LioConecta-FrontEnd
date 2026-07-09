import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import {
  mapUniLioQuestionDetailFromApi,
  mapUniLioQuestionsFromApi,
} from "../unilio/mapFromApi";
import {
  buildMockInstructorQuestions,
  buildMockModuleQuestions,
  buildMockMyQuestions,
  buildMockQuestionDetail,
} from "../../config/unilio/apiMockData";
import type { UniLioQuestionFilters } from "../../config/unilio/types";
import type { CreateUniLioQuestionRequest, ReplyUniLioQuestionRequest } from "../types";

function questionFiltersToParams(filters: UniLioQuestionFilters) {
  const params = new URLSearchParams();
  if (filters.courseId) params.set("courseId", filters.courseId);
  if (filters.status) params.set("status", filters.status);
  if (filters.unreadOnly) params.set("unreadOnly", "true");
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  return params;
}

export function useUniLioModuleQuestions(courseId: string, moduleId: string | null) {
  const query = useQuery({
    queryKey: ["unilio", "module-questions", courseId, moduleId],
    queryFn: async () =>
      mapUniLioQuestionsFromApi(
        await api.get(`/unilio/courses/${courseId}/modules/${moduleId}/questions`),
      ),
    enabled: !config.useMock && Boolean(courseId && moduleId),
    staleTime: 30_000,
  });

  const isFallback = config.useMock || query.isError;
  const data =
    config.useMock || query.isError
      ? mapUniLioQuestionsFromApi(
          moduleId ? buildMockModuleQuestions(courseId, moduleId) : buildMockMyQuestions(),
        )
      : (query.data ?? mapUniLioQuestionsFromApi(buildMockModuleQuestions(courseId, moduleId ?? "")));

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isFallback,
    refetch: query.refetch,
  };
}

export function useUniLioMyQuestions(filters: UniLioQuestionFilters = {}) {
  const query = useQuery({
    queryKey: ["unilio", "my-questions", filters],
    queryFn: async () => {
      const params = questionFiltersToParams(filters);
      const qs = params.toString();
      return mapUniLioQuestionsFromApi(
        await api.get(`/unilio/me/questions${qs ? `?${qs}` : ""}`),
      );
    },
    enabled: !config.useMock,
    staleTime: 30_000,
  });

  const isFallback = config.useMock || query.isError;
  const data =
    config.useMock || query.isError
      ? mapUniLioQuestionsFromApi(buildMockMyQuestions())
      : (query.data ?? mapUniLioQuestionsFromApi(buildMockMyQuestions()));

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isFallback,
    refetch: query.refetch,
  };
}

export function useUniLioInstructorQuestions(filters: UniLioQuestionFilters = {}) {
  const query = useQuery({
    queryKey: ["unilio", "instructor-questions", filters],
    queryFn: async () => {
      const params = questionFiltersToParams(filters);
      const qs = params.toString();
      return mapUniLioQuestionsFromApi(
        await api.get(`/unilio/instructor/questions${qs ? `?${qs}` : ""}`),
      );
    },
    enabled: !config.useMock,
    staleTime: 30_000,
  });

  const isFallback = config.useMock || query.isError;
  const data =
    config.useMock || query.isError
      ? mapUniLioQuestionsFromApi(buildMockInstructorQuestions())
      : (query.data ?? mapUniLioQuestionsFromApi(buildMockInstructorQuestions()));

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isFallback,
    refetch: query.refetch,
  };
}

export function useUniLioInstructorQuestionDetail(questionId: string | null) {
  const query = useQuery({
    queryKey: ["unilio", "instructor-question", questionId],
    queryFn: async () =>
      mapUniLioQuestionDetailFromApi(
        await api.get(`/unilio/instructor/questions/${questionId}`),
      ),
    enabled: !config.useMock && Boolean(questionId),
    staleTime: 15_000,
  });

  const isFallback = config.useMock || query.isError;
  const data =
    questionId && (config.useMock || query.isError)
      ? mapUniLioQuestionDetailFromApi(buildMockQuestionDetail(questionId))
      : query.data ?? null;

  return {
    data,
    isLoading: !config.useMock && query.isLoading,
    isFallback,
    refetch: query.refetch,
  };
}

export function useUniLioCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      courseId: string;
      moduleId?: string | null;
      body: string;
      visibility: "private" | "public";
      scopeCourse?: boolean;
    }) => {
      const request: CreateUniLioQuestionRequest = {
        body: payload.body,
        visibility: payload.visibility,
        moduleId: payload.scopeCourse ? null : payload.moduleId,
      };

      if (config.useMock) {
        return mapUniLioQuestionDetailFromApi({
          id: crypto.randomUUID(),
          courseId: payload.courseId,
          courseTitle: "Curso",
          moduleId: payload.scopeCourse ? null : payload.moduleId ?? null,
          moduleTitle: payload.scopeCourse ? null : "Módulo",
          authorPersonId: "seed-julio",
          authorName: "Você",
          body: payload.body,
          visibility: payload.visibility,
          status: "open",
          unread: false,
          createdAt: new Date().toISOString(),
          replies: [],
        });
      }

      const path =
        payload.scopeCourse || !payload.moduleId
          ? `/unilio/courses/${payload.courseId}/questions`
          : `/unilio/courses/${payload.courseId}/modules/${payload.moduleId}/questions`;

      return mapUniLioQuestionDetailFromApi(await api.post(path, request));
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["unilio", "module-questions"] });
      void queryClient.invalidateQueries({ queryKey: ["unilio", "my-questions"] });
      void queryClient.invalidateQueries({ queryKey: ["unilio", "instructor-questions"] });
      if (variables.moduleId) {
        void queryClient.invalidateQueries({
          queryKey: ["unilio", "module-questions", variables.courseId, variables.moduleId],
        });
      }
    },
  });
}

export function useUniLioQuestionReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { questionId: string; body: string }) => {
      const request: ReplyUniLioQuestionRequest = { body: payload.body };

      if (config.useMock) {
        return mapUniLioQuestionDetailFromApi({
          ...buildMockQuestionDetail(payload.questionId),
          status: "answered",
          unread: false,
          replies: [
            {
              id: crypto.randomUUID(),
              authorName: "Maria Silva",
              isInstructorReply: true,
              body: payload.body,
              createdAt: new Date().toISOString(),
            },
          ],
        });
      }

      return mapUniLioQuestionDetailFromApi(
        await api.post(`/unilio/instructor/questions/${payload.questionId}/reply`, request),
      );
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["unilio", "instructor-questions"] });
      void queryClient.invalidateQueries({ queryKey: ["unilio", "my-questions"] });
      void queryClient.invalidateQueries({ queryKey: ["unilio", "module-questions"] });
      void queryClient.invalidateQueries({
        queryKey: ["unilio", "instructor-question", variables.questionId],
      });
    },
  });
}

export function useUniLioMarkQuestionRead(role: "learner" | "instructor") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId: string) => {
      if (config.useMock) return;
      const path =
        role === "instructor"
          ? `/unilio/instructor/questions/${questionId}/read`
          : `/unilio/questions/${questionId}/read`;
      await api.patch(path);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["unilio"] });
    },
  });
}
