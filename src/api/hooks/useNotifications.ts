import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import type { NotificationDto, PagedResult } from "../types";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (config.useMock) {
        return { items: [], nextCursor: null, hasMore: false } satisfies PagedResult<NotificationDto>;
      }
      return api.get<PagedResult<NotificationDto>>("/notifications?limit=20");
    },
    refetchInterval: config.useMock ? false : 60_000,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      if (config.useMock) {
        return 3;
      }
      const result = await api.get<{ count: number }>("/notifications/unread-count");
      return result.count;
    },
    refetchInterval: config.useMock ? false : 30_000,
  });
}
