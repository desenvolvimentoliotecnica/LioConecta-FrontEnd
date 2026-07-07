import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import type { AppSettingsUpdateResultDto } from "../types";
import {
  DEFAULT_MENU_EDITOR_SETTINGS,
  menuEditorSettingsToAppSettings,
  parseMenuEditorSettingsFromAppSettings,
  type MenuEditorSettings,
} from "../../config/facilities/menu";
import { flattenAppSettingsMap } from "../../config/loop/settings";
import { APP_SETTINGS_QUERY_KEY, useAppSettings } from "./useAppSettings";

export const MENU_EDITOR_SETTINGS_QUERY_KEY = ["facilities", "menu", "settings"] as const;

function buildSettingsFromApi(categories: { settings: { key: string; value: string }[] }[]): MenuEditorSettings {
  return parseMenuEditorSettingsFromAppSettings(flattenAppSettingsMap(categories));
}

export function useMenuEditorSettings(): {
  data: MenuEditorSettings;
  isLoading: boolean;
  isError: boolean;
} {
  const apiQuery = useAppSettings();

  if (apiQuery.isLoading) {
    return { data: DEFAULT_MENU_EDITOR_SETTINGS, isLoading: true, isError: false };
  }

  if (apiQuery.isError || !apiQuery.data) {
    return {
      data: { allowedRoles: [], allowedEmails: [], emailRecipients: [] },
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

export function useSaveMenuEditorSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: MenuEditorSettings) => {
      const result = await api.put<AppSettingsUpdateResultDto>("/admin/app-settings", {
        settings: menuEditorSettingsToAppSettings(settings),
      });

      queryClient.setQueryData(APP_SETTINGS_QUERY_KEY, result.categories);
      return buildSettingsFromApi(result.categories);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MENU_EDITOR_SETTINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: APP_SETTINGS_QUERY_KEY });
    },
  });
}
