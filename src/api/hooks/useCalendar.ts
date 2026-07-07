import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, config } from "../client";
import type {
  CalendarBootstrapDto,
  CalendarConnectionTestResponse,
  CalendarEventDto,
  CalendarListItemDto,
  CalendarStatusDto,
  CafeteriaMenuDto,
  CreateCalendarEventRequest,
  LinkCalendarAccountRequest,
  TestCalendarConnectionRequest,
  UpdateCalendarEventRequest,
} from "../types";

export const CALENDAR_BOOTSTRAP_QUERY_KEY = ["calendar", "bootstrap"] as const;
export const CALENDAR_STATUS_QUERY_KEY = ["calendar", "status"] as const;
export const CALENDAR_LIST_QUERY_KEY = ["calendar", "calendars"] as const;

export function calendarEventsQueryKey(from: string, to: string, calendarIds: string[]) {
  return ["calendar", "events", from, to, calendarIds.join(",")] as const;
}

const DISABLED_BOOTSTRAP: CalendarBootstrapDto = {
  enabled: false,
  delegatedScopes: [],
  defaultView: "dayGridMonth",
  showBirthdays: true,
  showCafeteriaMenu: true,
  msalClientId: "",
  msalTenantId: "",
  msalAuthority: "",
};

export function useCalendarBootstrap() {
  return useQuery({
    queryKey: CALENDAR_BOOTSTRAP_QUERY_KEY,
    queryFn: async (): Promise<CalendarBootstrapDto> => {
      if (config.useMock) {
        return DISABLED_BOOTSTRAP;
      }
      return api.get<CalendarBootstrapDto>("/calendar/bootstrap");
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCalendarStatus() {
  const { data: bootstrap } = useCalendarBootstrap();

  return useQuery({
    queryKey: CALENDAR_STATUS_QUERY_KEY,
    queryFn: async (): Promise<CalendarStatusDto> => {
      if (config.useMock || !bootstrap?.enabled) {
        return { enabled: false, linked: false, needsConsent: false };
      }
      return api.get<CalendarStatusDto>("/calendar/status");
    },
    enabled: Boolean(bootstrap?.enabled) && !config.useMock,
  });
}

export function useCalendars(enabled: boolean) {
  return useQuery({
    queryKey: CALENDAR_LIST_QUERY_KEY,
    queryFn: async (): Promise<CalendarListItemDto[]> => {
      if (config.useMock) return [];
      return api.get<CalendarListItemDto[]>("/calendar/calendars");
    },
    enabled: enabled && !config.useMock,
  });
}

export function useCalendarEvents(
  from: string | null,
  to: string | null,
  calendarIds: string[],
  enabled: boolean,
) {
  return useQuery({
    queryKey: calendarEventsQueryKey(from ?? "", to ?? "", calendarIds),
    queryFn: async (): Promise<CalendarEventDto[]> => {
      if (config.useMock || !from || !to) return [];
      const params = new URLSearchParams({ from, to });
      calendarIds.forEach((id) => params.append("calendarIds", id));
      return api.get<CalendarEventDto[]>(`/calendar/events?${params.toString()}`);
    },
    enabled: enabled && Boolean(from && to) && !config.useMock,
  });
}

export function useCafeteriaMenu(date: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["calendar", "menu", date] as const,
    queryFn: async (): Promise<CafeteriaMenuDto | null> => {
      if (!date) return null;
      try {
        return await api.get<CafeteriaMenuDto>(`/calendar/menu/${date}`);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: enabled && Boolean(date),
  });
}

export function useLinkCalendarAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: LinkCalendarAccountRequest) => {
      if (config.useMock) return;
      await api.post("/calendar/link-account", body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CALENDAR_STATUS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: CALENDAR_LIST_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["calendar", "events"] });
    },
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCalendarEventRequest) => {
      if (config.useMock) {
        throw new Error("Calendário indisponível em modo mock.");
      }
      return api.post<CalendarEventDto>("/calendar/events", body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["calendar", "events"] });
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, body }: { eventId: string; body: UpdateCalendarEventRequest }) => {
      if (config.useMock) {
        throw new Error("Calendário indisponível em modo mock.");
      }
      return api.patch<CalendarEventDto>(`/calendar/events/${encodeURIComponent(eventId)}`, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["calendar", "events"] });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => {
      if (config.useMock) {
        throw new Error("Calendário indisponível em modo mock.");
      }
      return api.delete<void>(`/calendar/events/${encodeURIComponent(eventId)}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["calendar", "events"] });
    },
  });
}

export function useTestCalendarConnection() {
  return useMutation({
    mutationFn: (body: TestCalendarConnectionRequest = {}) =>
      api.post<CalendarConnectionTestResponse>("/admin/calendar/test", body),
  });
}
