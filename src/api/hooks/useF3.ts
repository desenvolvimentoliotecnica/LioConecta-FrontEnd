import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  CreateFeedbackRequest,
  FeedbackDto,
  MoodMetricsDto,
  NewHirePersonDto,
  NewsItemDto,
  UpdateFeedbackRequest,
} from "../types";

export function useNews(limit = 30) {
  return useQuery({
    queryKey: ["feed", "news", limit],
    queryFn: () => api.get<NewsItemDto[]>(`/feed/news?limit=${limit}`),
    retry: config.useMock ? 0 : 1,
  });
}

export function useMoodMetrics() {
  return useQuery({
    queryKey: ["mood", "metrics"],
    queryFn: () => api.get<MoodMetricsDto>("/mood/metrics"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useNewHires(days = 30) {
  return useQuery({
    queryKey: ["people", "new-hires", days],
    queryFn: () => api.get<NewHirePersonDto[]>(`/people/new-hires?days=${days}`),
    retry: config.useMock ? 0 : 1,
  });
}

export function useFeedback(status?: string) {
  return useQuery({
    queryKey: ["feedback", status ?? "all"],
    queryFn: () => api.get<FeedbackDto[]>(`/feedback${status ? `?status=${encodeURIComponent(status)}` : ""}`),
    retry: config.useMock ? 0 : 1,
  });
}

export function useCreateFeedback() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateFeedbackRequest) => api.post<FeedbackDto>("/feedback", body),
    onSuccess: () => void client.invalidateQueries({ queryKey: ["feedback"] }),
  });
}

export function useUpdateFeedback() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateFeedbackRequest }) =>
      api.patch<FeedbackDto>(`/feedback/${id}`, body),
    onSuccess: () => void client.invalidateQueries({ queryKey: ["feedback"] }),
  });
}
