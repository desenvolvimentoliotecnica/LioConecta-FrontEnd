import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type { AppSettingCategoryDto, AppSettingsUpdateResultDto, CompassBootstrapDto } from "../types";
import {
  DEFAULT_COMPASS_SETTINGS,
  compassSettingsFingerprint,
  compassSettingsPresentInCategories,
  compassSettingsToAppSettings,
  flattenAppSettingsHasValueMap,
  flattenAppSettingsMap,
  parseCompassSettingsFromAppSettings,
  parseCompassSettingsFromBootstrap,
  readCompassSettingsFromStorage,
  resolveCompassSettingsFromSources,
  writeCompassSettingsToStorage,
  type CompassSettings,
} from "../../config/compass/settings";
import { APP_SETTINGS_QUERY_KEY } from "./useAppSettings";

export const COMPASS_SETTINGS_QUERY_KEY = ["compass", "settings"] as const;

export type SaveCompassSettingsResult = {
  settings: CompassSettings;
  persistedToServer: boolean;
};

function settingsFingerprint(settings: CompassSettings): string {
  return compassSettingsFingerprint(settings);
}

function mergeBootstrapAndAppSettings(
  bootstrap: CompassBootstrapDto | undefined,
  categories: AppSettingCategoryDto[] | undefined,
): CompassSettings {
  const fromBootstrap = bootstrap
    ? parseCompassSettingsFromBootstrap(bootstrap)
    : DEFAULT_COMPASS_SETTINGS;

  if (!categories?.length) {
    return fromBootstrap;
  }

  const map = flattenAppSettingsMap(categories);
  const hasValueMap = flattenAppSettingsHasValueMap(categories);
  const fromApp = parseCompassSettingsFromAppSettings(map, false, hasValueMap);

  return {
    ...fromApp,
    enabled: fromBootstrap.enabled,
    allowedRoles: fromBootstrap.allowedRoles,
    allowedEmails: fromBootstrap.allowedEmails,
  };
}

export function useCompassSettings(): {
  data: CompassSettings;
  isLoading: boolean;
  isError: boolean;
  fingerprint: string;
} {
  const apiQuery = useQuery({
    queryKey: COMPASS_SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const [bootstrap, categories] = await Promise.all([
        api.get<CompassBootstrapDto>("/compass/bootstrap"),
        api.get<AppSettingCategoryDto[]>("/admin/app-settings").catch(() => [] as AppSettingCategoryDto[]),
      ]);
      return mergeBootstrapAndAppSettings(bootstrap, categories);
    },
    enabled: !config.useMock,
    staleTime: 60_000,
  });

  const mockQuery = useQuery({
    queryKey: [...COMPASS_SETTINGS_QUERY_KEY, "mock"] as const,
    queryFn: () => readCompassSettingsFromStorage(),
    enabled: config.useMock,
    staleTime: 0,
  });

  const data = useMemo(() => {
    if (config.useMock) {
      return mockQuery.data ?? DEFAULT_COMPASS_SETTINGS;
    }

    if (apiQuery.isLoading) {
      return DEFAULT_COMPASS_SETTINGS;
    }

    if (apiQuery.isError || !apiQuery.data) {
      return readCompassSettingsFromStorage();
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

export function useSaveCompassSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: CompassSettings): Promise<SaveCompassSettingsResult> => {
      writeCompassSettingsToStorage(settings);

      if (config.useMock) {
        return { settings, persistedToServer: true };
      }

      const result = await api.put<AppSettingsUpdateResultDto>("/admin/app-settings", {
        settings: compassSettingsToAppSettings(settings),
      });

      queryClient.setQueryData(APP_SETTINGS_QUERY_KEY, result.categories);

      const persistedToServer = compassSettingsPresentInCategories(result.categories);
      const resolved = resolveCompassSettingsFromSources(
        flattenAppSettingsMap(result.categories),
        settings,
        flattenAppSettingsHasValueMap(result.categories),
      );

      return {
        settings: {
          ...resolved,
          enabled: settings.enabled,
          allowedRoles: settings.allowedRoles,
          allowedEmails: settings.allowedEmails,
        },
        persistedToServer,
      };
    },
    onSuccess: (result) => {
      queryClient.setQueryData(COMPASS_SETTINGS_QUERY_KEY, result.settings);
      if (result.persistedToServer) {
        void queryClient.invalidateQueries({ queryKey: COMPASS_SETTINGS_QUERY_KEY });
      }
      void queryClient.invalidateQueries({ queryKey: APP_SETTINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["compass", "scenarios"] });
    },
  });
}
