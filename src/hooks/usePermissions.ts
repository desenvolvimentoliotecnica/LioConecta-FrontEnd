import { useMemo } from "react";
import {
  getPermissionScope,
  hasAnyPermission,
  hasPermission,
} from "../api/auth";
import { useMe } from "../api/hooks/useMe";
import type { DataScope, EffectivePermissionDto } from "../api/types";

export function usePermissions() {
  const { data: me, isLoading, isError } = useMe();

  return useMemo(
    () => ({
      me,
      isLoading,
      isError,
      permissions: (me?.permissions ?? []) as EffectivePermissionDto[],
      isTestUser: me?.isTestUser ?? false,
      subjectType: me?.subjectType ?? null,
      hasPermission: (key: string, scope?: DataScope) => hasPermission(me, key, scope),
      hasAnyPermission: (keys: readonly string[]) => hasAnyPermission(me, keys),
      getScope: (key: string) => getPermissionScope(me, key),
    }),
    [isError, isLoading, me],
  );
}
