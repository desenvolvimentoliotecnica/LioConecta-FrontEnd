import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import type { AppSettingsUpdateResultDto } from "../types";
import {
  DEFAULT_BENEFICIOS_SETTINGS,
  parseBeneficiosSettingsFromAppSettings,
  beneficiosSettingsToAppSettings,
  type BeneficiosSettings,
} from "../../config/beneficios/settings";
import { flattenAppSettingsMap } from "../../config/loop/settings";
import { APP_SETTINGS_QUERY_KEY, useAppSettings } from "./useAppSettings";
import { BENEFITS_MANAGEMENT_QUERY_KEY } from "./useBenefitsManagement";

export const BENEFICIOS_SETTINGS_QUERY_KEY = ["beneficios", "settings"] as const;

function buildSettingsFromApi(categories: { settings: { key: string; value: string }[] }[]): BeneficiosSettings {
  return parseBeneficiosSettingsFromAppSettings(flattenAppSettingsMap(categories));
}

export function useBenefitsSettings(): {
  data: BeneficiosSettings;
  isLoading: boolean;
  isError: boolean;
} {
  const apiQuery = useAppSettings();

  if (apiQuery.isLoading) {
    return { data: DEFAULT_BENEFICIOS_SETTINGS, isLoading: true, isError: false };
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

export function useSaveBenefitsSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: BeneficiosSettings) => {
      const result = await api.put<AppSettingsUpdateResultDto>("/admin/app-settings", {
        settings: beneficiosSettingsToAppSettings(settings),
      });

      queryClient.setQueryData(APP_SETTINGS_QUERY_KEY, result.categories);
      return buildSettingsFromApi(result.categories);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BENEFICIOS_SETTINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: APP_SETTINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: BENEFITS_MANAGEMENT_QUERY_KEY });
    },
  });
}
