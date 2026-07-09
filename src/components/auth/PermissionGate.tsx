import type { ReactNode } from "react";
import { usePermissions } from "../../hooks/usePermissions";
import type { DataScope } from "../../api/types";

type PermissionGateProps = {
  permission: string | readonly string[];
  scope?: DataScope;
  fallback?: ReactNode;
  children: ReactNode;
};

export function PermissionGate({ permission, scope, fallback = null, children }: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, isLoading } = usePermissions();

  if (isLoading) return null;

  const granted =
    typeof permission === "string"
      ? hasPermission(permission, scope)
      : hasAnyPermission(permission);

  if (!granted) return <>{fallback}</>;
  return <>{children}</>;
}
