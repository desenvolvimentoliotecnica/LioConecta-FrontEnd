import { useQuery } from "@tanstack/react-query";
import { api, ApiError, config } from "../client";
import type { MeDto } from "../types";
import { getStoredToken } from "./useAuth";

import { DEFAULT_PORTAL_AVATAR } from "../../utils/personAvatar";

export const ME_QUERY_KEY = ["me"] as const;
export const ME_AVATAR_UPDATED_EVENT = "lio:me-avatar-updated";

const DEV_AUTH_MODE = import.meta.env.VITE_AUTH_MODE === "dev";

const MOCK_ME: MeDto = {
  id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb103",
  slug: "leonardo-mendes",
  name: "Leonardo Sabino Mendes",
  email: "leonardo.mendes@liotecnica.com.br",
  title: "Desenvolvedor Sr.",
  photoUrl: DEFAULT_PORTAL_AVATAR,
  departmentName: "Sistemas",
  roles: ["Employee", "Manager", "Admin"],
  permissions: [
    { key: "portal.access", scope: "Global" },
    { key: "admin.settings.manage", scope: "Global" },
    { key: "rbac.roles.manage", scope: "Global" },
    { key: "rbac.assignments.manage", scope: "Global" },
    { key: "rbac.test_users.manage", scope: "Global" },
    { key: "analytics.view", scope: "Global" },
    { key: "loop.access", scope: "Global" },
    { key: "pulse.access", scope: "Global" },
    { key: "compass.access", scope: "Global" },
    { key: "unilio.access", scope: "Global" },
    { key: "benefits.manage", scope: "Global" },
    { key: "systems.manage", scope: "Global" },
    { key: "ramais.manage", scope: "Global" },
    { key: "facilities.menu.manage", scope: "Global" },
    { key: "admin.workers.manage", scope: "Global" },
    { key: "admin.email.manage", scope: "Global" },
    { key: "admin.totvs.manage", scope: "Global" },
    { key: "groups.read", scope: "Global" },
    { key: "groups.create", scope: "Global" },
    { key: "groups.approve", scope: "Global" },
  ],
  subjectType: "PortalUser",
  isTestUser: false,
};

export function useMe() {
  const hasToken = Boolean(getStoredToken());

  return useQuery({
    queryKey: ME_QUERY_KEY,
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
