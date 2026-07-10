import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type {
  CreateGroupRequest,
  CreateGroupTopicReplyRequest,
  CreateGroupTopicRequest,
  CreateGroupWallPostRequest,
  CreateOwnershipTransferRequest,
  GroupDto,
  GroupMemberDto,
  GroupOwnershipTransferDto,
  GroupTopicDetailDto,
  GroupTopicDto,
  GroupWallPostDto,
  RejectGroupRequest,
  UpdateGroupMemberRoleRequest,
  UpdateGroupRequest,
} from "../types";

export const GROUPS_QUERY_KEY = ["groups"] as const;

function groupQueryKey(groupId: string) {
  return [...GROUPS_QUERY_KEY, groupId] as const;
}

function invalidateGroup(queryClient: ReturnType<typeof useQueryClient>, groupId: string) {
  void queryClient.invalidateQueries({ queryKey: groupQueryKey(groupId) });
  void queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
}

// ── Group listing / CRUD ─────────────────────────────────────────────────────

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

export function usePendingForMeGroups() {
  return useQuery({
    queryKey: [...GROUPS_QUERY_KEY, "pending-for-me"],
    queryFn: async (): Promise<GroupDto[]> => {
      if (config.useMock) return [];
      return api.get<GroupDto[]>("/groups/pending-for-me");
    },
    retry: config.useMock ? 0 : 1,
  });
}

export function useExpiredGroups(enabled = true) {
  return useQuery({
    queryKey: [...GROUPS_QUERY_KEY, "expired"],
    queryFn: async (): Promise<GroupDto[]> => {
      if (config.useMock) return [];
      return api.get<GroupDto[]>("/groups/expired");
    },
    enabled: enabled && !config.useMock,
    retry: config.useMock ? 0 : 1,
  });
}

export function useGroup(groupId: string | undefined) {
  return useQuery({
    queryKey: groupQueryKey(groupId ?? ""),
    queryFn: async (): Promise<GroupDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      return api.get<GroupDto>(`/groups/${groupId}`);
    },
    enabled: Boolean(groupId) && !config.useMock,
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
          icon: body.icon,
          status: 0,
          isPrivate: false,
          owner: {
            id: "mock",
            slug: "maria-silva",
            name: "Maria Silva",
            photoUrl: "/avatar-maria-silva.png",
            isActive: true,
          },
          memberCount: 1,
          postCount: 0,
          topicCount: 0,
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

export function useUpdateGroup(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateGroupRequest): Promise<GroupDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      return api.put<GroupDto>(`/groups/${groupId}`, body);
    },
    onSuccess: () => invalidateGroup(queryClient, groupId),
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string): Promise<void> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      await api.delete<void>(`/groups/${groupId}`);
    },
    onSuccess: (_data, groupId) => invalidateGroup(queryClient, groupId),
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
    onSuccess: (_data, id) => invalidateGroup(queryClient, id),
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
    onSuccess: (_data, { id }) => invalidateGroup(queryClient, id),
  });
}

export function useResubmitGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<GroupDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      return api.post<GroupDto>(`/groups/${id}/resubmit`);
    },
    onSuccess: (_data, id) => invalidateGroup(queryClient, id),
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<GroupDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      return api.post<GroupDto>(`/groups/${id}/join`);
    },
    onSuccess: (_data, id) => invalidateGroup(queryClient, id),
  });
}

export function useLeaveGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      await api.post<void>(`/groups/${id}/leave`);
    },
    onSuccess: (_data, id) => invalidateGroup(queryClient, id),
  });
}

// ── Members ──────────────────────────────────────────────────────────────────

export function useGroupMembers(groupId: string | undefined) {
  return useQuery({
    queryKey: [...groupQueryKey(groupId ?? ""), "members"],
    queryFn: async (): Promise<GroupMemberDto[]> => {
      if (config.useMock) return [];
      return api.get<GroupMemberDto[]>(`/groups/${groupId}/members`);
    },
    enabled: Boolean(groupId) && !config.useMock,
  });
}

export function useUpdateGroupMemberRole(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: UpdateGroupMemberRoleRequest["role"];
    }): Promise<GroupMemberDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      return api.patch<GroupMemberDto>(`/groups/${groupId}/members/${memberId}`, { role });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...groupQueryKey(groupId), "members"] });
    },
  });
}

// ── Wall ─────────────────────────────────────────────────────────────────────

export function useGroupWall(groupId: string | undefined) {
  return useQuery({
    queryKey: [...groupQueryKey(groupId ?? ""), "wall"],
    queryFn: async (): Promise<GroupWallPostDto[]> => {
      if (config.useMock) return [];
      return api.get<GroupWallPostDto[]>(`/groups/${groupId}/wall`);
    },
    enabled: Boolean(groupId) && !config.useMock,
  });
}

export function useCreateGroupWallPost(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateGroupWallPostRequest): Promise<GroupWallPostDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      return api.post<GroupWallPostDto>(`/groups/${groupId}/wall`, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...groupQueryKey(groupId), "wall"] });
      void queryClient.invalidateQueries({ queryKey: groupQueryKey(groupId) });
    },
  });
}

export function useDeleteGroupWallPost(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string): Promise<void> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      await api.delete<void>(`/groups/${groupId}/wall/${postId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...groupQueryKey(groupId), "wall"] });
    },
  });
}

export function useReactToGroupWallPost(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string): Promise<void> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      await api.post<void>(`/groups/${groupId}/wall/${postId}/reactions`, {
        reactionType: "like",
      });
    },
    onMutate: async (postId) => {
      const queryKey = [...groupQueryKey(groupId), "wall"] as const;
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<GroupWallPostDto[]>(queryKey);

      queryClient.setQueryData<GroupWallPostDto[]>(queryKey, (current) =>
        (current ?? []).map((post) =>
          post.id === postId
            ? {
                ...post,
                viewerReacted: !post.viewerReacted,
                reactionCount: Math.max(0, post.reactionCount + (post.viewerReacted ? -1 : 1)),
              }
            : post,
        ),
      );

      return { previous, queryKey };
    },
    onError: (_error, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: [...groupQueryKey(groupId), "wall"] });
    },
  });
}

// ── Topics ───────────────────────────────────────────────────────────────────

export function useGroupTopics(groupId: string | undefined) {
  return useQuery({
    queryKey: [...groupQueryKey(groupId ?? ""), "topics"],
    queryFn: async (): Promise<GroupTopicDto[]> => {
      if (config.useMock) return [];
      return api.get<GroupTopicDto[]>(`/groups/${groupId}/topics`);
    },
    enabled: Boolean(groupId) && !config.useMock,
  });
}

export function useGroupTopic(groupId: string | undefined, topicId: string | undefined) {
  return useQuery({
    queryKey: [...groupQueryKey(groupId ?? ""), "topics", topicId ?? ""],
    queryFn: async (): Promise<GroupTopicDetailDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      return api.get<GroupTopicDetailDto>(`/groups/${groupId}/topics/${topicId}`);
    },
    enabled: Boolean(groupId) && Boolean(topicId) && !config.useMock,
  });
}

export function useCreateGroupTopic(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateGroupTopicRequest): Promise<GroupTopicDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      return api.post<GroupTopicDto>(`/groups/${groupId}/topics`, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...groupQueryKey(groupId), "topics"] });
      void queryClient.invalidateQueries({ queryKey: groupQueryKey(groupId) });
    },
  });
}

export function useDeleteGroupTopic(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topicId: string): Promise<void> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      await api.delete<void>(`/groups/${groupId}/topics/${topicId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...groupQueryKey(groupId), "topics"] });
    },
  });
}

export function useCreateGroupTopicReply(groupId: string, topicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateGroupTopicReplyRequest) => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      return api.post(`/groups/${groupId}/topics/${topicId}/replies`, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...groupQueryKey(groupId), "topics", topicId],
      });
      void queryClient.invalidateQueries({ queryKey: [...groupQueryKey(groupId), "topics"] });
    },
  });
}

// ── Ownership transfers ──────────────────────────────────────────────────────

export function useCreateOwnershipTransfer(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateOwnershipTransferRequest): Promise<GroupOwnershipTransferDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      return api.post<GroupOwnershipTransferDto>(`/groups/${groupId}/ownership-transfers`, body);
    },
    onSuccess: () => invalidateGroup(queryClient, groupId),
  });
}

export function usePendingOwnershipTransfers() {
  return useQuery({
    queryKey: [...GROUPS_QUERY_KEY, "ownership-transfers", "pending-for-me"],
    queryFn: async (): Promise<GroupOwnershipTransferDto[]> => {
      if (config.useMock) return [];
      return api.get<GroupOwnershipTransferDto[]>("/groups/ownership-transfers/pending-for-me");
    },
    retry: config.useMock ? 0 : 1,
  });
}

export function useApproveOwnershipTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<GroupOwnershipTransferDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      return api.post<GroupOwnershipTransferDto>(`/groups/ownership-transfers/${id}/approve`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
    },
  });
}

export function useRejectOwnershipTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<GroupOwnershipTransferDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      return api.post<GroupOwnershipTransferDto>(`/groups/ownership-transfers/${id}/reject`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
    },
  });
}
