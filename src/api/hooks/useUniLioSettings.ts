import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type { AppSettingsUpdateResultDto, UniLioBootstrapDto } from "../types";
import {
  DEFAULT_UNILIO_SETTINGS,
  unilioSettingsFingerprint,
  unilioSettingsPresentInCategories,
  unilioSettingsToAppSettings,
  flattenAppSettingsMap,
  parseUniLioSettingsFromBootstrap,
  readUniLioSettingsFromStorage,
  resolveUniLioSettingsFromSources,
  writeUniLioSettingsToStorage,
  type UniLioSettings,
} from "../../config/unilio/settings";
import { APP_SETTINGS_QUERY_KEY } from "./useAppSettings";

export const UNILIO_SETTINGS_QUERY_KEY = ["unilio", "settings"] as const;

export type SaveUniLioSettingsResult = {
  settings: UniLioSettings;
  persistedToServer: boolean;
};

export function useUniLioSettings(): {
  data: UniLioSettings;
  isLoading: boolean;
  isError: boolean;
  fingerprint: string;
} {
  const apiQuery = useQuery({
    queryKey: UNILIO_SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const bootstrap = await api.get<UniLioBootstrapDto>("/unilio/bootstrap");
      return parseUniLioSettingsFromBootstrap(bootstrap);
    },
    enabled: !config.useMock,
    staleTime: 60_000,
  });

  const mockQuery = useQuery({
    queryKey: [...UNILIO_SETTINGS_QUERY_KEY, "mock"] as const,
    queryFn: () => readUniLioSettingsFromStorage(),
    enabled: config.useMock,
    staleTime: 0,
  });

  const data = useMemo(() => {
    if (config.useMock) {
      return mockQuery.data ?? DEFAULT_UNILIO_SETTINGS;
    }
    if (apiQuery.isLoading) return DEFAULT_UNILIO_SETTINGS;
    if (apiQuery.isError || !apiQuery.data) return readUniLioSettingsFromStorage();
    return apiQuery.data;
  }, [mockQuery.data, apiQuery.isLoading, apiQuery.isError, apiQuery.data]);

  const fingerprint = useMemo(() => unilioSettingsFingerprint(data), [data]);

  if (config.useMock) {
    return { data, fingerprint, isLoading: mockQuery.isLoading, isError: mockQuery.isError };
  }

  return { data, fingerprint, isLoading: apiQuery.isLoading, isError: apiQuery.isError };
}

export function useSaveUniLioSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: UniLioSettings): Promise<SaveUniLioSettingsResult> => {
      writeUniLioSettingsToStorage(settings);

      if (config.useMock) {
        return { settings, persistedToServer: true };
      }

      const result = await api.put<AppSettingsUpdateResultDto>("/admin/app-settings", {
        settings: unilioSettingsToAppSettings(settings),
      });

      queryClient.setQueryData(APP_SETTINGS_QUERY_KEY, result.categories);

      const persistedToServer = unilioSettingsPresentInCategories(result.categories);
      const resolved = resolveUniLioSettingsFromSources(flattenAppSettingsMap(result.categories), settings);

      return { settings: resolved, persistedToServer };
    },
    onSuccess: (result) => {
      queryClient.setQueryData(UNILIO_SETTINGS_QUERY_KEY, result.settings);
      if (result.persistedToServer) {
        void queryClient.invalidateQueries({ queryKey: UNILIO_SETTINGS_QUERY_KEY });
      }
      void queryClient.invalidateQueries({ queryKey: APP_SETTINGS_QUERY_KEY });
    },
  });
}
