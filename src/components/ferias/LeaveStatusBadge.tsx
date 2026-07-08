import { leaveStatusLabel } from "../../utils/leaveHelpers";

type Props = {
  status: string;
  rmSyncStatus?: string | null;
};

export function LeaveStatusBadge({ status, rmSyncStatus }: Props) {
  const displayStatus =
    rmSyncStatus === "pending_rm_sync" && status === "pending" ? "pending" : status;

  return (
    <span className={`leave-badge leave-badge--${displayStatus}`}>
      {rmSyncStatus === "pending_rm_sync" ? "Aguardando RM" : leaveStatusLabel(displayStatus)}
    </span>
  );
}
