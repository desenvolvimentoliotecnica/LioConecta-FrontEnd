import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type { AppSettingsUpdateResultDto } from "../types";
import {
  DEFAULT_LOOP_SETTINGS,
  flattenAppSettingsMap,
  loopSettingsToAppSettings,
  parseLoopSettingsFromAppSettings,
  readLoopSettingsFromStorage,
  writeLoopSettingsToStorage,
  type LoopSettings,
} from "../../config/loop/settings";
import { APP_SETTINGS_QUERY_KEY, useAppSettings } from "./useAppSettings";

export const LOOP_SETTINGS_QUERY_KEY = ["loop", "settings"] as const;

function buildSettingsFromApi(categories: { settings: { key: string; value: string }[] }[]): LoopSettings {
  return parseLoopSettingsFromAppSettings(flattenAppSettingsMap(categories), false);
}

export function useLoopSettings(): {
  data: LoopSettings;
  isLoading: boolean;
  isError: boolean;
} {
  const apiQuery = useAppSettings();

  const mockQuery = useQuery({
    queryKey: LOOP_SETTINGS_QUERY_KEY,
    queryFn: () => readLoopSettingsFromStorage(),
    enabled: config.useMock,
    staleTime: 0,
  });

  if (config.useMock) {
    return {
      data: mockQuery.data ?? DEFAULT_LOOP_SETTINGS,
      isLoading: mockQuery.isLoading,
      isError: mockQuery.isError,
    };
  }

  if (apiQuery.isLoading) {
    return { data: DEFAULT_LOOP_SETTINGS, isLoading: true, isError: false };
  }

  if (apiQuery.isError || !apiQuery.data) {
    return {
      data: readLoopSettingsFromStorage(),
      isLoading: false,
      isError: apiQuery.isError,
    };
  }

  return {
    data: buildSettingsFromApi(apiQuery.data),
    isLoading: false,
    isError: false,
  };
}

export function useSaveLoopSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: LoopSettings) => {
      writeLoopSettingsToStorage(settings);

      if (config.useMock) {
        return settings;
      }

      const result = await api.put<AppSettingsUpdateResultDto>("/admin/app-settings", {
        settings: loopSettingsToAppSettings(settings),
      });

      queryClient.setQueryData(APP_SETTINGS_QUERY_KEY, result.categories);
      return buildSettingsFromApi(result.categories);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LOOP_SETTINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: APP_SETTINGS_QUERY_KEY });
    },
  });
}
