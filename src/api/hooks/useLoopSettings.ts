import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type { AppSettingsUpdateResultDto, LoopBootstrapDto } from "../types";
import {
  DEFAULT_LOOP_SETTINGS,
  flattenAppSettingsMap,
  loopSettingsFingerprint,
  loopSettingsPresentInCategories,
  loopSettingsToAppSettings,
  parseLoopSettingsFromBootstrap,
  readLoopSettingsFromStorage,
  resolveLoopSettingsFromSources,
  writeLoopSettingsToStorage,
  type LoopSettings,
} from "../../config/loop/settings";
import { APP_SETTINGS_QUERY_KEY } from "./useAppSettings";

export const LOOP_SETTINGS_QUERY_KEY = ["loop", "settings"] as const;

export type SaveLoopSettingsResult = {
  settings: LoopSettings;
  persistedToServer: boolean;
};

function settingsFingerprint(settings: LoopSettings): string {
  return loopSettingsFingerprint(settings);
}

export function useLoopSettings(): {
  data: LoopSettings;
  isLoading: boolean;
  isError: boolean;
  fingerprint: string;
} {
  const apiQuery = useQuery({
    queryKey: LOOP_SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const bootstrap = await api.get<LoopBootstrapDto>("/loop/bootstrap");
      return parseLoopSettingsFromBootstrap(bootstrap);
    },
    enabled: !config.useMock,
    staleTime: 60_000,
  });

  const mockQuery = useQuery({
    queryKey: [...LOOP_SETTINGS_QUERY_KEY, "mock"] as const,
    queryFn: () => readLoopSettingsFromStorage(),
    enabled: config.useMock,
    staleTime: 0,
  });

  const data = useMemo(() => {
    if (config.useMock) {
      return mockQuery.data ?? DEFAULT_LOOP_SETTINGS;
    }

    if (apiQuery.isLoading) {
      return DEFAULT_LOOP_SETTINGS;
    }

    if (apiQuery.isError || !apiQuery.data) {
      return readLoopSettingsFromStorage();
    }

    return apiQuery.data;
  }, [mockQuery.data, apiQuery.isLoading, apiQuery.isError, apiQuery.data]);

  const fingerprint = useMemo(() => settingsFingerprint(data), [data]);

  if (config.useMock) {
    return {
      data,
      fingerprint,
      isLoading: mockQuery.isLoading,
      isError: mockQuery.isError,
    };
  }

  return {
    data,
    fingerprint,
    isLoading: apiQuery.isLoading,
    isError: apiQuery.isError,
  };
}

export function useSaveLoopSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: LoopSettings): Promise<SaveLoopSettingsResult> => {
      writeLoopSettingsToStorage(settings);

      if (config.useMock) {
        return { settings, persistedToServer: true };
      }

      const result = await api.put<AppSettingsUpdateResultDto>("/admin/app-settings", {
        settings: loopSettingsToAppSettings(settings),
      });

      queryClient.setQueryData(APP_SETTINGS_QUERY_KEY, result.categories);

      const persistedToServer = loopSettingsPresentInCategories(result.categories);
      const resolved = resolveLoopSettingsFromSources(
        flattenAppSettingsMap(result.categories),
        settings,
      );

      return { settings: resolved, persistedToServer };
    },
    onSuccess: (result) => {
      queryClient.setQueryData(LOOP_SETTINGS_QUERY_KEY, result.settings);
      if (result.persistedToServer) {
        void queryClient.invalidateQueries({ queryKey: LOOP_SETTINGS_QUERY_KEY });
      }
      void queryClient.invalidateQueries({ queryKey: APP_SETTINGS_QUERY_KEY });
    },
  });
}
