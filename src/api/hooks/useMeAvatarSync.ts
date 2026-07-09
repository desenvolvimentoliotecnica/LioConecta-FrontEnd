import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { MeDto } from "../types";
import { ME_AVATAR_UPDATED_EVENT, ME_QUERY_KEY } from "./useMe";

export function dispatchMeAvatarUpdated(photoUrl: string | null | undefined) {
  window.dispatchEvent(
    new CustomEvent(ME_AVATAR_UPDATED_EVENT, {
      detail: { photoUrl: photoUrl ?? null },
    }),
  );
}

export function useMeAvatarSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    function onAvatarUpdated(event: Event) {
      const photoUrl = (event as CustomEvent<{ photoUrl?: string | null }>).detail?.photoUrl ?? null;

      queryClient.setQueryData<MeDto>(ME_QUERY_KEY, (current) =>
        current ? { ...current, photoUrl } : current,
      );
      void queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    }

    window.addEventListener(ME_AVATAR_UPDATED_EVENT, onAvatarUpdated);
    return () => window.removeEventListener(ME_AVATAR_UPDATED_EVENT, onAvatarUpdated);
  }, [queryClient]);
}
