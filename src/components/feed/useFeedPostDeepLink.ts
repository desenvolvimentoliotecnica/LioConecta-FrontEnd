import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api, config } from "../../api/client";
import { FEED_QUERY_KEY } from "../../api/hooks/useFeed";
import type { FeedPostDto, PagedResult } from "../../api/types";

export const FEED_POST_QUERY_PARAM = "post";
export const FEED_POST_FOCUS_EVENT = "lio:focus-feed-post";
const FEED_HIGHLIGHT_CLASS = "card--feed-highlight";

export function extractFeedPostIdFromHref(href: string): string | null {
  const raw = href.trim();
  if (!raw) return null;

  const query = raw.startsWith("/?")
    ? raw.slice(2)
    : raw.startsWith("?")
      ? raw.slice(1)
      : raw.includes("post=")
        ? raw.includes("?")
          ? raw.split("?").pop() ?? ""
          : raw
        : null;

  if (!query) return null;
  return new URLSearchParams(query).get(FEED_POST_QUERY_PARAM);
}

export function dispatchFeedPostFocus(postId: string) {
  window.dispatchEvent(
    new CustomEvent(FEED_POST_FOCUS_EVENT, {
      detail: { postId },
    }),
  );
}

function focusFeedPostElement(postId: string): Promise<boolean> {
  return new Promise((resolve) => {
    let attempts = 0;

    const tryFocus = () => {
      const el = document.querySelector(`[data-feed-post-id="${CSS.escape(postId)}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add(FEED_HIGHLIGHT_CLASS);
        window.setTimeout(() => el.classList.remove(FEED_HIGHLIGHT_CLASS), 2500);
        resolve(true);
        return;
      }

      attempts += 1;
      if (attempts < 30) {
        window.setTimeout(tryFocus, 100);
      } else {
        resolve(false);
      }
    };

    window.requestAnimationFrame(tryFocus);
  });
}

export function useFeedPostDeepLink(posts: FeedPostDto[], isLoading: boolean, feedLimit = 20) {
  const [searchParams, setSearchParams] = useSearchParams();
  const postIdFromUrl = searchParams.get(FEED_POST_QUERY_PARAM);
  const [focusRequestId, setFocusRequestId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const generationRef = useRef(0);
  const postsRef = useRef(posts);
  postsRef.current = posts;

  const clearPostQueryParam = useCallback(() => {
    setSearchParams(
      (current) => {
        if (!current.get(FEED_POST_QUERY_PARAM)) return current;
        const next = new URLSearchParams(current);
        next.delete(FEED_POST_QUERY_PARAM);
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const ensurePostInFeed = useCallback(
    async (postId: string): Promise<boolean> => {
      if (postsRef.current.some((post) => post.id === postId)) {
        return true;
      }

      try {
        const post = await api.get<FeedPostDto>(`/feed/posts/${postId}`);
        queryClient.setQueryData<PagedResult<FeedPostDto>>([...FEED_QUERY_KEY, feedLimit], (current) => {
          if (!current) return current;
          if (current.items.some((item) => item.id === post.id)) return current;
          return { ...current, items: [post, ...current.items] };
        });
        return true;
      } catch {
        return false;
      }
    },
    [feedLimit, queryClient],
  );

  const focusPost = useCallback(
    async (postId: string) => {
      if (!postId || config.useMock) return;

      const generation = ++generationRef.current;
      const available = await ensurePostInFeed(postId);
      if (!available || generation !== generationRef.current) {
        return;
      }

      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));

      const focused = await focusFeedPostElement(postId);
      if (generation !== generationRef.current || !focused) {
        return;
      }

      clearPostQueryParam();
      setFocusRequestId((current) => (current === postId ? null : current));
    },
    [clearPostQueryParam, ensurePostInFeed],
  );

  useEffect(() => {
    function onFocusRequest(event: Event) {
      const requestedId = (event as CustomEvent<{ postId?: string }>).detail?.postId;
      if (!requestedId) return;
      setFocusRequestId(requestedId);
    }

    window.addEventListener(FEED_POST_FOCUS_EVENT, onFocusRequest);
    return () => window.removeEventListener(FEED_POST_FOCUS_EVENT, onFocusRequest);
  }, []);

  useEffect(() => {
    const targetId = focusRequestId ?? postIdFromUrl;
    if (!targetId || isLoading || config.useMock) return;
    void focusPost(targetId);
  }, [focusPost, focusRequestId, isLoading, postIdFromUrl, posts]);
}
