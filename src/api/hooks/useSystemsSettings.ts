import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import type { AppSettingsUpdateResultDto } from "../types";
import {
  DEFAULT_SYSTEMS_SETTINGS,
  parseSystemsSettingsFromAppSettings,
  systemsSettingsToAppSettings,
  type SystemsSettings,
} from "../../config/systems/settings";
import { flattenAppSettingsMap } from "../../config/loop/settings";
import { APP_SETTINGS_QUERY_KEY, useAppSettings } from "./useAppSettings";

export const SYSTEMS_SETTINGS_QUERY_KEY = ["systems", "settings"] as const;

function buildSettingsFromApi(categories: { settings: { key: string; value: string }[] }[]): SystemsSettings {
  return parseSystemsSettingsFromAppSettings(flattenAppSettingsMap(categories));
}

export function useSystemsSettings(): {
  data: SystemsSettings;
  isLoading: boolean;
  isError: boolean;
} {
  const apiQuery = useAppSettings();

  if (apiQuery.isLoading) {
    return { data: DEFAULT_SYSTEMS_SETTINGS, isLoading: true, isError: false };
  }

  if (apiQuery.isError || !apiQuery.data) {
    return {
      data: { allowedRoles: [], allowedEmails: [] },
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

export function useSaveSystemsSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: SystemsSettings) => {
      const result = await api.put<AppSettingsUpdateResultDto>("/admin/app-settings", {
        settings: systemsSettingsToAppSettings(settings),
      });

      queryClient.setQueryData(APP_SETTINGS_QUERY_KEY, result.categories);
      return buildSettingsFromApi(result.categories);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SYSTEMS_SETTINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: APP_SETTINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["systems", "bootstrap"] });
    },
  });
}
