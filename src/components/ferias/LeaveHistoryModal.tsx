import { useLeaveHistory } from "../../api/hooks/useLeave";
import { formatSensitiveCount } from "../../utils/money";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import { LeaveStatusBadge } from "./LeaveStatusBadge";

type Props = {
  open: boolean;
  showValues: boolean;
  onToggleShowValues: () => void;
  onClose: () => void;
};

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

export function LeaveHistoryModal({ open, showValues, onToggleShowValues, onClose }: Props) {
  const historyQuery = useLeaveHistory(24, open);

  return (
    <ContrachequeModal
      open={open}
      title="Histórico de ausências"
      wide
      showValues={showValues}
      onToggleShowValues={onToggleShowValues}
      onClose={onClose}
    >
      {historyQuery.isLoading ? <p>Carregando…</p> : null}
      {historyQuery.data && historyQuery.data.length > 0 ? (
        <table className="pay-table">
          <thead>
            <tr>
              <th>Registro</th>
              <th>Período</th>
              <th>Dias</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {historyQuery.data.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.title}
                  {item.note ? <div className="leave-detail__note">{item.note}</div> : null}
                </td>
                <td>
                  {formatDate(item.startDate)}
                  {item.endDate ? ` — ${formatDate(item.endDate)}` : ""}
                </td>
                <td>{item.days != null ? formatSensitiveCount(item.days, showValues) : "—"}</td>
                <td>
                  <LeaveStatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nenhum registro encontrado.</p>
      )}
    </ContrachequeModal>
  );
}
