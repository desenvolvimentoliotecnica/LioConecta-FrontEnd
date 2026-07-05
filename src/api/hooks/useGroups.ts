import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type { CreateGroupRequest, GroupDto, RejectGroupRequest } from "../types";

export const GROUPS_QUERY_KEY = ["groups"] as const;

export function useExploreGroups() {
  return useQuery({
    queryKey: [...GROUPS_QUERY_KEY, "explore"],
    queryFn: async (): Promise<GroupDto[]> => {
      if (config.useMock) return [];
      return api.get<GroupDto[]>("/groups/explore");
    },
    retry: config.useMock ? 0 : 1,
  });
}

export function useMyGroups() {
  return useQuery({
    queryKey: [...GROUPS_QUERY_KEY, "mine"],
    queryFn: async (): Promise<GroupDto[]> => {
      if (config.useMock) return [];
      return api.get<GroupDto[]>("/groups");
    },
    retry: config.useMock ? 0 : 1,
  });
}

export function usePendingGroups() {
  return useQuery({
    queryKey: [...GROUPS_QUERY_KEY, "pending"],
    queryFn: async (): Promise<GroupDto[]> => {
      if (config.useMock) return [];
      return api.get<GroupDto[]>("/groups/pending");
    },
    retry: config.useMock ? 0 : 1,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateGroupRequest): Promise<GroupDto> => {
      if (config.useMock) {
        return {
          id: crypto.randomUUID(),
          name: body.name,
          description: body.description,
          type: body.type,
          accessMode: body.accessMode,
          icon: body.icon,
          status: 0,
          isPrivate: body.accessMode === 2,
          owner: {
            id: "mock",
            slug: "maria-silva",
            name: "Maria Silva",
            photoUrl: "/avatar-maria-silva.png",
            isActive: true,
          },
          memberCount: 1,
          postCount: 0,
          isMember: true,
          createdAt: new Date().toISOString(),
        };
      }
      return api.post<GroupDto>("/groups", body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
    },
  });
}

export function useApproveGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<GroupDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      return api.post<GroupDto>(`/groups/${id}/approve`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
    },
  });
}

export function useRejectGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string | null }): Promise<GroupDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      const body: RejectGroupRequest = { reason };
      return api.post<GroupDto>(`/groups/${id}/reject`, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
    },
  });
}
