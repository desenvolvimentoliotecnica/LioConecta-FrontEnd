import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../client";
import type {
  CopyMenuDayRequest,
  CopyMenuWeekRequest,
  DailyMenuDto,
  MenuEditorBootstrapDto,
  SaveDailyMenuRequest,
  SendMenuEmailRequest,
  SendMenuEmailResponse,
  WeeklyMenuDto,
} from "../types";
import { createEmptyDailyMenu, getWeekDates } from "../../config/facilities/menu";

export const DAILY_MENU_QUERY_KEY = ["facilities", "menu", "day"] as const;
export const WEEKLY_MENU_QUERY_KEY = ["facilities", "menu", "week"] as const;
export const MENU_BOOTSTRAP_QUERY_KEY = ["facilities", "menu", "bootstrap"] as const;

export function dailyMenuQueryKey(date: string) {
  return [...DAILY_MENU_QUERY_KEY, date] as const;
}

export function weeklyMenuQueryKey(weekStart: string) {
  return [...WEEKLY_MENU_QUERY_KEY, weekStart] as const;
}

async function fetchDailyMenu(date: string): Promise<DailyMenuDto | null> {
  try {
    return await api.get<DailyMenuDto>(`/calendar/menu/${date}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

async function fetchWeeklyMenu(weekStart: string): Promise<WeeklyMenuDto> {
  const data = await api.get<WeeklyMenuDto>(`/facilities/menu/week?start=${weekStart}`);
  const dates = getWeekDates(weekStart);
  const byDate = new Map(data.days.map((day) => [day.date, day]));

  return {
    weekStart: data.weekStart ?? weekStart,
    days: dates.map((date) => byDate.get(date) ?? createEmptyDailyMenu(date)),
  };
}

export function useDailyMenu(date: string | null, enabled = true) {
  return useQuery({
    queryKey: dailyMenuQueryKey(date ?? ""),
    queryFn: () => fetchDailyMenu(date!),
    enabled: enabled && Boolean(date),
  });
}

export function useWeeklyMenu(weekStart: string | null, enabled = true) {
  return useQuery({
    queryKey: weeklyMenuQueryKey(weekStart ?? ""),
    queryFn: () => fetchWeeklyMenu(weekStart!),
    enabled: enabled && Boolean(weekStart),
  });
}

export function useMenuEditorBootstrap() {
  return useQuery({
    queryKey: MENU_BOOTSTRAP_QUERY_KEY,
    queryFn: () => api.get<MenuEditorBootstrapDto>("/facilities/menu/bootstrap"),
    staleTime: 60_000,
  });
}

export function useSaveDailyMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, body }: { date: string; body: SaveDailyMenuRequest }) =>
      api.put<DailyMenuDto>(`/facilities/menu/${date}`, body),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: dailyMenuQueryKey(data.date) });
      void queryClient.invalidateQueries({ queryKey: WEEKLY_MENU_QUERY_KEY });
    },
  });
}

export function useCopyMenuDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetDate, body }: { targetDate: string; body: CopyMenuDayRequest }) =>
      api.post<DailyMenuDto>(`/facilities/menu/${targetDate}/copy-from`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WEEKLY_MENU_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DAILY_MENU_QUERY_KEY });
    },
  });
}

export function useCopyMenuWeek() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      targetWeekStart,
      body,
    }: {
      targetWeekStart: string;
      body: CopyMenuWeekRequest;
    }) =>
      api.post<WeeklyMenuDto>("/facilities/menu/week/copy-from", {
        ...body,
        targetWeekStart,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WEEKLY_MENU_QUERY_KEY });
    },
  });
}

export function useDeleteDailyMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (date: string) => api.delete<void>(`/facilities/menu/${date}`),
    onSuccess: (_data, date) => {
      void queryClient.invalidateQueries({ queryKey: dailyMenuQueryKey(date) });
      void queryClient.invalidateQueries({ queryKey: WEEKLY_MENU_QUERY_KEY });
    },
  });
}

export function useSendMenuEmail() {
  return useMutation({
    mutationFn: (body: SendMenuEmailRequest) =>
      api.post<SendMenuEmailResponse>("/facilities/menu/week/send-email", body),
  });
}
