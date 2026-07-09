import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiUpload, config } from "../client";
import type {
  CreateCommentRequest,
  CreatePollRequest,
  CreatePostRequest,
  CommentDto,
  FeedPostDto,
  MeDto,
  PagedResult,
  PollDto,
  UploadPostMediaResponseDto,
} from "../types";
import { POST_TYPE_POLL, POST_TYPE_SOCIAL } from "../types";

export const FEED_QUERY_KEY = ["feed"] as const;
export const FEED_LIKE_REACTION = "like";

function updatePostInFeedCache(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  updater: (post: FeedPostDto) => FeedPostDto,
) {
  queryClient.setQueryData<PagedResult<FeedPostDto>>([...FEED_QUERY_KEY, 20], (current) => {
    if (!current) return current;
    return {
      ...current,
      items: current.items.map((post) => (post.id === postId ? updater(post) : post)),
    };
  });
}

function removePostFromFeedCache(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
) {
  queryClient.setQueryData<PagedResult<FeedPostDto>>([...FEED_QUERY_KEY, 20], (current) => {
    if (!current) return current;
    return {
      ...current,
      items: current.items.filter((post) => post.id !== postId),
    };
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      await api.delete<void>(`/feed/posts/${postId}`);
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });
      const previous = queryClient.getQueryData<PagedResult<FeedPostDto>>([...FEED_QUERY_KEY, 20]);
      removePostFromFeedCache(queryClient, postId);
      return { previous };
    },
    onError: (_error, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData([...FEED_QUERY_KEY, 20], context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}

export function useAddPostComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, text }: { postId: string; text: string }): Promise<CommentDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      const body: CreateCommentRequest = { text: text.trim() };
      return api.post<CommentDto>(`/feed/posts/${postId}/comments`, body);
    },
    onMutate: async ({ postId, text }) => {
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });
      const previous = queryClient.getQueryData<PagedResult<FeedPostDto>>([...FEED_QUERY_KEY, 20]);
      const trimmed = text.trim();
      const me = queryClient.getQueryData<MeDto>(["me"]);

      updatePostInFeedCache(queryClient, postId, (post) => ({
        ...post,
        commentCount: post.commentCount + 1,
        comments: [
          ...post.comments,
          {
            id: `optimistic-${Date.now()}`,
            text: trimmed,
            author: {
              id: me?.id ?? "optimistic",
              slug: me?.slug ?? "maria-silva",
              name: me?.name ?? "Você",
              title: me?.title,
              photoUrl: me?.photoUrl ?? null,
              departmentName: me?.departmentName,
              isActive: true,
            },
            createdAt: new Date().toISOString(),
          },
        ],
      }));

      return { previous };
    },
    onSuccess: (comment, { postId }) => {
      updatePostInFeedCache(queryClient, postId, (post) => {
        const withoutOptimistic = post.comments.filter((c) => !c.id.startsWith("optimistic-"));
        const alreadyPresent = withoutOptimistic.some((c) => c.id === comment.id);
        return {
          ...post,
          comments: alreadyPresent ? withoutOptimistic : [...withoutOptimistic, comment],
        };
      });
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData([...FEED_QUERY_KEY, 20], context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}

export const PHOTO_COMMENTS_QUERY_KEY = ["feed", "photo-comments"] as const;

export function postMediaCommentsQueryKey(postId: string, mediaUrl: string) {
  return [...PHOTO_COMMENTS_QUERY_KEY, postId, mediaUrl] as const;
}

export function usePostMediaComments(postId: string | null, mediaUrl: string | null) {
  return useQuery({
    queryKey: postMediaCommentsQueryKey(postId ?? "", mediaUrl ?? ""),
    queryFn: async (): Promise<CommentDto[]> => {
      if (config.useMock || !postId || !mediaUrl) {
        return [];
      }

      const params = new URLSearchParams({ mediaUrl });
      const response = await api.get<{ items: CommentDto[] }>(
        `/feed/posts/${postId}/media/comments?${params.toString()}`,
      );
      return response.items ?? [];
    },
    enabled: Boolean(postId && mediaUrl && !config.useMock),
    staleTime: 15_000,
  });
}

export function useAddPostMediaComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      mediaUrl,
      text,
    }: {
      postId: string;
      mediaUrl: string;
      text: string;
    }): Promise<CommentDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }

      return api.post<CommentDto>(`/feed/posts/${postId}/media/comments`, {
        text: text.trim(),
        mediaUrl,
      });
    },
    onMutate: async ({ postId, mediaUrl, text }) => {
      const queryKey = postMediaCommentsQueryKey(postId, mediaUrl);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CommentDto[]>(queryKey);
      const me = queryClient.getQueryData<MeDto>(["me"]);
      const trimmed = text.trim();

      queryClient.setQueryData<CommentDto[]>(queryKey, (current) => [
        ...(current ?? []),
        {
          id: `optimistic-${Date.now()}`,
          text: trimmed,
          author: {
            id: me?.id ?? "optimistic",
            slug: me?.slug ?? "maria-silva",
            name: me?.name ?? "Você",
            title: me?.title,
            photoUrl: me?.photoUrl ?? null,
            departmentName: me?.departmentName,
            isActive: true,
          },
          createdAt: new Date().toISOString(),
        },
      ]);

      return { previous, queryKey };
    },
    onSuccess: (comment, { postId, mediaUrl }, context) => {
      const queryKey = context?.queryKey ?? postMediaCommentsQueryKey(postId, mediaUrl);
      queryClient.setQueryData<CommentDto[]>(queryKey, (current) => {
        const withoutOptimistic = (current ?? []).filter((item) => !item.id.startsWith("optimistic-"));
        const alreadyPresent = withoutOptimistic.some((item) => item.id === comment.id);
        return alreadyPresent ? withoutOptimistic : [...withoutOptimistic, comment];
      });
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
  });
}

export function useTogglePostLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      await api.post<void>(`/feed/posts/${postId}/reactions`, {
        reactionType: FEED_LIKE_REACTION,
      });
    },
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });
      const previous = queryClient.getQueryData<PagedResult<FeedPostDto>>([...FEED_QUERY_KEY, 20]);

      updatePostInFeedCache(queryClient, postId, (post) => {
        const liked = post.viewerReaction?.toLowerCase() === FEED_LIKE_REACTION;
        return {
          ...post,
          viewerReaction: liked ? null : FEED_LIKE_REACTION,
          reactionCount: Math.max(0, post.reactionCount + (liked ? -1 : 1)),
        };
      });

      return { previous };
    },
    onError: (_error, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData([...FEED_QUERY_KEY, 20], context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}

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
    mutationFn: async (input: {
      content: string;
      mediaUrl?: string | null;
      mediaType?: string | null;
      mediaItems?: Array<{ url: string; mediaType: string }>;
    }): Promise<FeedPostDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }

      const mediaItems =
        input.mediaItems?.filter((item) => item.url.trim()) ??
        (input.mediaUrl && input.mediaUrl.trim()
          ? [
              {
                url: input.mediaUrl.trim(),
                mediaType: input.mediaType?.trim() || "image",
              },
            ]
          : []);

      const metadata: Record<string, unknown> | null =
        mediaItems.length > 0
          ? {
              mediaUrl: mediaItems[0].url,
              mediaType: mediaItems[0].mediaType,
              mediaItems,
            }
          : null;

      const body: CreatePostRequest = {
        type: POST_TYPE_SOCIAL,
        content: input.content.trim(),
        metadata,
      };
      return api.post<FeedPostDto>("/feed/posts", body);
    },
    onSuccess: (post) => {
      prependPostToFeedCache(queryClient, post);
    },
  });
}

export function useUploadPostMedia() {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadPostMediaResponseDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — upload indisponível");
      }

      const formData = new FormData();
      formData.append("file", file);
      return apiUpload<UploadPostMediaResponseDto>("/feed/posts/media/upload", formData);
    },
  });
}

function prependPostToFeedCache(
  queryClient: ReturnType<typeof useQueryClient>,
  post: FeedPostDto,
) {
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
}

export function useCreatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePollRequest): Promise<FeedPostDto> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }

      const metadata: Record<string, unknown> = {
        options: input.options.map((option) => option.trim()).filter(Boolean),
      };

      if (input.heroImageUrl) {
        metadata.heroImageUrl = input.heroImageUrl;
      }

      if (input.endsAt) {
        metadata.endsAt = input.endsAt;
      }

      const body: CreatePostRequest = {
        type: POST_TYPE_POLL,
        content: input.question.trim(),
        metadata,
      };

      return api.post<FeedPostDto>("/feed/posts", body);
    },
    onSuccess: (post) => {
      prependPostToFeedCache(queryClient, post);
    },
  });
}

export function useVotePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      optionId,
    }: {
      postId: string;
      optionId: string;
    }): Promise<void> => {
      if (config.useMock) {
        throw new Error("Mock mode — API call skipped");
      }
      await api.post<void>(`/feed/posts/${postId}/poll/vote`, { optionId });
    },
    onMutate: async ({ postId, optionId }) => {
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });
      const previous = queryClient.getQueryData<PagedResult<FeedPostDto>>([...FEED_QUERY_KEY, 20]);

      updatePostInFeedCache(queryClient, postId, (post) => {
        if (!post.poll) return post;
        return {
          ...post,
          poll: applyOptimisticVote(post.poll, optionId),
        };
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData([...FEED_QUERY_KEY, 20], context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}

function applyOptimisticVote(poll: PollDto, optionId: string): PollDto {
  return {
    ...poll,
    hasViewerVoted: true,
    options: poll.options.map((option) => ({
      ...option,
      voteCount: option.id === optionId ? option.voteCount + 1 : option.voteCount,
      isSelectedByViewer: option.id === optionId,
    })),
  };
}
