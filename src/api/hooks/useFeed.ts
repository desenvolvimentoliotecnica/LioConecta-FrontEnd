import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, config } from "../client";
import type { CreatePostRequest, FeedPostDto, PagedResult } from "../types";
import { POST_TYPE_SOCIAL } from "../types";

export const FEED_QUERY_KEY = ["feed"] as const;

export function useFeed(limit = 20) {
  return useQuery({
    queryKey: [...FEED_QUERY_KEY, limit],
    queryFn: async (): Promise<PagedResult<FeedPostDto>> => {
      if (config.useMock) {
        return { items: [], hasMore: false, nextCursor: null };
      }
      return api.get<PagedResult<FeedPostDto>>(`/feed?limit=${limit}`);
    },
    staleTime: 30_000,
    retry: config.useMock ? 0 : 2,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string): Promise<FeedPostDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      const body: CreatePostRequest = {
        type: POST_TYPE_SOCIAL,
        content: content.trim(),
        metadata: null,
      };
      return api.post<FeedPostDto>("/feed/posts", body);
    },
    onSuccess: (post) => {
      queryClient.setQueryData<PagedResult<FeedPostDto>>(
        [...FEED_QUERY_KEY, 20],
        (current) => {
          if (!current) {
            return { items: [post], hasMore: false, nextCursor: null };
          }
          const withoutDuplicate = current.items.filter((item) => item.id !== post.id);
          return {
            ...current,
            items: [post, ...withoutDuplicate],
          };
        },
      );
    },
  });
}
