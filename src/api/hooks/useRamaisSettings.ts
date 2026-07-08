import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import type { AppSettingsUpdateResultDto } from "../types";
import {
  DEFAULT_RAMAIS_SETTINGS,
  parseRamaisSettingsFromAppSettings,
  ramaisSettingsToAppSettings,
  type RamaisSettings,
} from "../../config/ramais/settings";
import { flattenAppSettingsMap } from "../../config/loop/settings";
import { APP_SETTINGS_QUERY_KEY, useAppSettings } from "./useAppSettings";

export const RAMAIS_SETTINGS_QUERY_KEY = ["ramais", "settings"] as const;

function buildSettingsFromApi(categories: { settings: { key: string; value: string }[] }[]): RamaisSettings {
  return parseRamaisSettingsFromAppSettings(flattenAppSettingsMap(categories));
}

export function useRamaisSettings(): {
  data: RamaisSettings;
  isLoading: boolean;
  isError: boolean;
} {
  const apiQuery = useAppSettings();

  if (apiQuery.isLoading) {
    return { data: DEFAULT_RAMAIS_SETTINGS, isLoading: true, isError: false };
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

export function useSaveRamaisSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: RamaisSettings) => {
      const result = await api.put<AppSettingsUpdateResultDto>("/admin/app-settings", {
        settings: ramaisSettingsToAppSettings(settings),
      });

      queryClient.setQueryData(APP_SETTINGS_QUERY_KEY, result.categories);
      return buildSettingsFromApi(result.categories);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RAMAIS_SETTINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: APP_SETTINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["ramais", "bootstrap"] });
    },
  });
}
