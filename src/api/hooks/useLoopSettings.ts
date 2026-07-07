import { useQuery } from "@tanstack/react-query";
import { config } from "../client";
import { useAppSettings } from "./useAppSettings";
import {
  DEFAULT_LOOP_SETTINGS,
  parseLoopSettingsFromAppSettings,
  readLoopSettingsFromStorage,
  type LoopSettings,
} from "../../config/loop/settings";

export const LOOP_SETTINGS_QUERY_KEY = ["loop", "settings"] as const;

function buildSettingsFromApi(categories: { settings: { key: string; value: string }[] }[]): LoopSettings {
  const map: Record<string, string> = {};
  for (const cat of categories) {
    for (const s of cat.settings) {
      map[s.key] = s.value;
    }
  }
  return parseLoopSettingsFromAppSettings(map);
}

export function useLoopSettings(): { data: LoopSettings; isLoading: boolean } {
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
    };
  }

  if (apiQuery.isLoading || !apiQuery.data) {
    return { data: readLoopSettingsFromStorage(), isLoading: apiQuery.isLoading };
  }

  return {
    data: buildSettingsFromApi(apiQuery.data),
    isLoading: false,
  };
}
