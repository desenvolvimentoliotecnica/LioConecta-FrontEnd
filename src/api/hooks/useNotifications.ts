import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api, config } from "../client";
import { hasPortalSession } from "../hubAuth";
import type { NotificationDto, PagedResult } from "../types";
import { subscribeToNotificationHub } from "../notificationHub";
import {
  NOTIFICATIONS_QUERY_KEY,
  NOTIFICATIONS_UNREAD_QUERY_KEY,
} from "../../utils/notifications";

export function useNotifications(limit = 50) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, limit],
    queryFn: async () => {
      if (config.useMock) {
        return { items: [], nextCursor: null, hasMore: false } satisfies PagedResult<NotificationDto>;
      }
      return api.get<PagedResult<NotificationDto>>(`/notifications?limit=${limit}`);
    },
    refetchInterval: config.useMock ? false : 60_000,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY,
    queryFn: async () => {
      if (config.useMock) {
        return 0;
      }
      return api.get<number>("/notifications/unread-count");
    },
    refetchInterval: config.useMock ? false : 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (config.useMock) return;
      await api.patch(`/notifications/${id}/read`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY });

      const previousLists = queryClient.getQueriesData<PagedResult<NotificationDto>>({
        queryKey: NOTIFICATIONS_QUERY_KEY,
      });
      const previousUnread = queryClient.getQueryData<number>(NOTIFICATIONS_UNREAD_QUERY_KEY);

      queryClient.setQueriesData<PagedResult<NotificationDto>>(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (current) => {
          if (!current) return current;
          return {
            ...current,
            items: current.items.map((notification) =>
              notification.id === id ? { ...notification, isRead: true } : notification,
            ),
          };
        },
      );

      queryClient.setQueryData<number>(NOTIFICATIONS_UNREAD_QUERY_KEY, (current) =>
        Math.max(0, (current ?? 0) - 1),
      );

      return { previousLists, previousUnread };
    },
    onError: (_error, _id, context) => {
      for (const [queryKey, data] of context?.previousLists ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
      if (context?.previousUnread !== undefined) {
        queryClient.setQueryData(NOTIFICATIONS_UNREAD_QUERY_KEY, context.previousUnread);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (config.useMock) return;
      await api.post("/notifications/read-all");
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY });

      const previousLists = queryClient.getQueriesData<PagedResult<NotificationDto>>({
        queryKey: NOTIFICATIONS_QUERY_KEY,
      });
      const previousUnread = queryClient.getQueryData<number>(NOTIFICATIONS_UNREAD_QUERY_KEY);

      queryClient.setQueriesData<PagedResult<NotificationDto>>(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (current) => {
          if (!current) return current;
          return {
            ...current,
            items: current.items.map((notification) => ({ ...notification, isRead: true })),
          };
        },
      );
      queryClient.setQueryData<number>(NOTIFICATIONS_UNREAD_QUERY_KEY, 0);

      return { previousLists, previousUnread };
    },
    onError: (_error, _vars, context) => {
      for (const [queryKey, data] of context?.previousLists ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
      if (context?.previousUnread !== undefined) {
        queryClient.setQueryData(NOTIFICATIONS_UNREAD_QUERY_KEY, context.previousUnread);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY });
    },
  });
}

export function useNotificationHubSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (config.useMock || !hasPortalSession()) return;

    return subscribeToNotificationHub(() => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY });
    });
  }, [queryClient]);
}
