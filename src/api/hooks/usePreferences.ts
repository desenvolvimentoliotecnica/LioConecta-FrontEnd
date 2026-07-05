import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import { DEFAULT_BOOKMARK_IDS } from "../../config/bookmarks";
import type { UpdatePreferencesRequest, UserPreferencesDto } from "../types";

export const PREFERENCES_QUERY_KEY = ["preferences"] as const;

export function usePreferences() {
  return useQuery({
    queryKey: PREFERENCES_QUERY_KEY,
    queryFn: () => api.get<UserPreferencesDto>("/me/preferences"),
    retry: config.useMock ? 0 : 1,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePreferencesRequest) =>
      api.put<UserPreferencesDto>("/me/preferences", body),
    onSuccess: (data) => {
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, data);
    },
  });
}

export function useToggleBookmark() {
  const { data: preferences } = usePreferences();
  const update = useUpdatePreferences();

  const toggle = (bookmarkId: string) => {
    const current =
      preferences?.bookmarks && preferences.bookmarks.length > 0
        ? preferences.bookmarks
        : DEFAULT_BOOKMARK_IDS;
    const next = current.includes(bookmarkId)
      ? current.filter((id) => id !== bookmarkId)
      : [...current, bookmarkId];

    update.mutate({ bookmarks: next });
  };

  const isSaved = (bookmarkId: string) => {
    const current =
      preferences?.bookmarks && preferences.bookmarks.length > 0
        ? preferences.bookmarks
        : DEFAULT_BOOKMARK_IDS;
    return current.includes(bookmarkId);
  };

  return { toggle, isSaved, isPending: update.isPending };
}
