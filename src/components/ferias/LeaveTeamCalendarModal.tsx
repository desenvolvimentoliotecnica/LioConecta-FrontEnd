import { useLeaveTeamCalendar } from "../../api/hooks/useLeave";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  onClose: () => void;
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

export function LeaveTeamCalendarModal({ open, onClose }: Props) {
  const query = useLeaveTeamCalendar(open);

  return (
    <ContrachequeModal
      open={open}
      title="Calendário da equipe"
      wide
      onClose={onClose}
    >
      {query.isLoading ? <p>Carregando…</p> : null}
      {query.data ? (
        <table className="pay-table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Cargo</th>
              <th>Tipo</th>
              <th>Período</th>
            </tr>
          </thead>
          <tbody>
            {query.data.members.map((member) => (
              <tr key={`${member.name}-${member.startDate}`}>
                <td>{member.name}</td>
                <td>{member.role}</td>
                <td>{member.absenceType}</td>
                <td>
                  {formatDate(member.startDate)} — {formatDate(member.endDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </ContrachequeModal>
  );
}
