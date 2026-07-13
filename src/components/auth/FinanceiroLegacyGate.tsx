import type { ReactNode } from "react";
import { PermissionGate } from "./PermissionGate";
import { ModuleAccessDenied } from "./ModuleAccessDenied";

type FinanceiroLegacyGateProps = {
  moduleName: string;
  /** Primary key shown in AccessDenied (usually `.read`). */
  permissionHint: string;
  /** OR-list: read or manage. */
  permissions: readonly string[];
  children: ReactNode;
};

export function FinanceiroLegacyGate({
  moduleName,
  permissionHint,
  permissions,
  children,
}: FinanceiroLegacyGateProps) {
  return (
    <PermissionGate
      permission={permissions}
      fallback={
        <ModuleAccessDenied moduleName={moduleName} permissionKey={permissionHint} />
      }
    >
      {children}
    </PermissionGate>
  );
}
