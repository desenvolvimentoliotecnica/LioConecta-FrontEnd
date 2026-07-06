import { useQuery } from "@tanstack/react-query";
import { api, config } from "../client";
import type { BirthdayPersonDto } from "../types";

export function useBirthdays(days = 365) {
  return useQuery({
    queryKey: ["people", "birthdays", days],
    queryFn: async (): Promise<BirthdayPersonDto[]> => {
      if (config.useMock) {
        return [];
      }
      return api.get<BirthdayPersonDto[]>(`/people/birthdays?days=${days}`);
    },
    staleTime: 5 * 60 * 1000,
    retry: config.useMock ? 0 : 2,
  });
}
