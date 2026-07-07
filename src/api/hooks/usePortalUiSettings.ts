import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type { AppSettingsUpdateResultDto } from "../types";
import {
  DEFAULT_PORTAL_UI_SETTINGS,
  portalUiSettingsFingerprint,
  portalUiSettingsPresentInCategories,
  portalUiSettingsToAppSettings,
  readPortalUiSettingsFromStorage,
  resolvePortalUiSettingsFromSources,
  writePortalUiSettingsToStorage,
  type PortalUiSettings,
} from "../../config/portal-ui-settings";
import { flattenAppSettingsMap } from "../../config/loop/settings";
import { APP_SETTINGS_QUERY_KEY, useAppSettings } from "./useAppSettings";

export const PORTAL_UI_SETTINGS_QUERY_KEY = ["portal", "ui", "settings"] as const;

export type SavePortalUiSettingsResult = {
  settings: PortalUiSettings;
  persistedToServer: boolean;
};

function buildSettingsFromApi(categories: { settings: { key: string; value: string }[] }[]): PortalUiSettings {
  return resolvePortalUiSettingsFromSources(flattenAppSettingsMap(categories), readPortalUiSettingsFromStorage());
}

export function usePortalUiSettings(): {
  data: PortalUiSettings;
  isLoading: boolean;
  isError: boolean;
  fingerprint: string;
} {
  const apiQuery = useAppSettings();

  const mockQuery = useQuery({
    queryKey: PORTAL_UI_SETTINGS_QUERY_KEY,
    queryFn: () => readPortalUiSettingsFromStorage(),
    enabled: config.useMock,
    staleTime: 0,
  });

  const data = useMemo(() => {
    if (config.useMock) {
      return mockQuery.data ?? DEFAULT_PORTAL_UI_SETTINGS;
    }

    if (apiQuery.isLoading) {
      return DEFAULT_PORTAL_UI_SETTINGS;
    }

    if (apiQuery.isError || !apiQuery.data) {
      return readPortalUiSettingsFromStorage();
    }

    return buildSettingsFromApi(apiQuery.data);
  }, [mockQuery.data, apiQuery.isLoading, apiQuery.isError, apiQuery.data]);

  const fingerprint = useMemo(() => portalUiSettingsFingerprint(data), [data]);

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

export function useSavePortalUiSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: PortalUiSettings): Promise<SavePortalUiSettingsResult> => {
      writePortalUiSettingsToStorage(settings);

      if (config.useMock) {
        return { settings, persistedToServer: true };
      }

      const result = await api.put<AppSettingsUpdateResultDto>("/admin/app-settings", {
        settings: portalUiSettingsToAppSettings(settings),
      });

      queryClient.setQueryData(APP_SETTINGS_QUERY_KEY, result.categories);

      const persistedToServer = portalUiSettingsPresentInCategories(result.categories);
      const resolved = resolvePortalUiSettingsFromSources(flattenAppSettingsMap(result.categories), settings);

      return { settings: resolved, persistedToServer };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PORTAL_UI_SETTINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: APP_SETTINGS_QUERY_KEY });
    },
  });
}
