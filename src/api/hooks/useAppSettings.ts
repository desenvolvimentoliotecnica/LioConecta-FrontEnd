import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  AppSettingCategoryDto,
  AppSettingsUpdateResultDto,
  BulkUpdateAppSettingsRequest,
} from "../types";

export const APP_SETTINGS_QUERY_KEY = ["admin", "app-settings"] as const;

export function useAppSettings() {
  return useQuery({
    queryKey: APP_SETTINGS_QUERY_KEY,
    queryFn: () => api.get<AppSettingCategoryDto[]>("/admin/app-settings"),
    enabled: !config.useMock,
  });
}

export function useUpdateAppSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: BulkUpdateAppSettingsRequest) =>
      api.put<AppSettingsUpdateResultDto>("/admin/app-settings", body),
    onSuccess: (result) => {
      queryClient.setQueryData(APP_SETTINGS_QUERY_KEY, result.categories);
    },
  });
}
