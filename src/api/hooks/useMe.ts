import { useQuery } from "@tanstack/react-query";
import { api, ApiError, config } from "../client";
import type { MeDto } from "../types";
import { getStoredToken } from "./useAuth";

const DEV_AUTH_MODE = import.meta.env.VITE_AUTH_MODE === "dev";

const MOCK_ME: MeDto = {
  id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb103",
  slug: "leonardo-mendes",
  name: "Leonardo Sabino Mendes",
  email: "leonardo.mendes@liotecnica.com.br",
  title: "Desenvolvedor Sr.",
  photoUrl: null,
  departmentName: "Sistemas",
  roles: ["Employee", "Manager", "Admin"],
};

export function useMe() {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: ["me"],
    queryFn: async (): Promise<MeDto> => {
      if (config.useMock || DEV_AUTH_MODE) {
        return MOCK_ME;
      }
      return api.get<MeDto>("/me");
    },
    enabled: config.useMock || DEV_AUTH_MODE || hasToken,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (config.useMock || DEV_AUTH_MODE) {
        return false;
      }
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
