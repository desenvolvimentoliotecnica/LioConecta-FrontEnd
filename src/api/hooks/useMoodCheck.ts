import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, config } from "../client";
import type { MoodLevel } from "../../config/mood-feedback";
import { MOOD_LEVEL_API, MOOD_LEVEL_FROM_API } from "../../config/mood-feedback";

export const MOOD_TODAY_QUERY_KEY = ["mood", "today"] as const;

export interface MoodTodayDto {
  hasRegistered: boolean;
  mood: number | null;
  recordedAt: string | null;
}

export interface RegisterMoodResultDto {
  mood: number;
  recordedAt: string;
}

export function useMoodToday() {
  return useQuery({
    queryKey: MOOD_TODAY_QUERY_KEY,
    queryFn: async (): Promise<{ registered: boolean; mood: MoodLevel | null; recordedAt: string | null }> => {
      if (config.useMock) {
        return { registered: false, mood: null, recordedAt: null };
      }
      const data = await api.get<MoodTodayDto>("/mood/today");
      return {
        registered: data.hasRegistered,
        mood: data.mood != null ? MOOD_LEVEL_FROM_API[data.mood] ?? null : null,
        recordedAt: data.recordedAt,
      };
    },
    staleTime: 60_000,
    retry: config.useMock ? 0 : 2,
  });
}

export function useRegisterMood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mood: MoodLevel): Promise<RegisterMoodResultDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      return api.post<RegisterMoodResultDto>("/mood", { mood: MOOD_LEVEL_API[mood] });
    },
    onSuccess: (_result, mood) => {
      queryClient.setQueryData(MOOD_TODAY_QUERY_KEY, {
        registered: true,
        mood,
        recordedAt: new Date().toISOString(),
      });
    },
  });
}

export function isMoodAlreadyRegisteredError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409;
}
