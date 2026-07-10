import { useLeaveBancoHoras } from "../../api/hooks/useLeave";
import { formatHours } from "../../utils/money";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  showValues: boolean;
  onToggleShowValues: () => void;
  onClose: () => void;
};

export function LeaveBancoHorasModal({ open, showValues, onToggleShowValues, onClose }: Props) {
  const query = useLeaveBancoHoras(open);
  const data = query.data;
  const unavailable =
    data?.availabilityStatus && data.availabilityStatus !== "available"
      ? data.userMessage || "Banco de horas indisponível no momento."
      : null;

  return (
    <ContrachequeModal
      open={open}
      title="Banco de horas"
      wide
      showValues={showValues}
      onToggleShowValues={onToggleShowValues}
      onClose={onClose}
    >
      {query.isLoading ? <p>Carregando…</p> : null}
      {query.isError ? (
        <p className="pay-empty">Não foi possível carregar o banco de horas. Tente novamente.</p>
      ) : null}
      {unavailable ? <p className="pay-empty">{unavailable}</p> : null}
      {data && !unavailable ? (
        <>
          <div className="pay-summary-row">
            <div className="pay-summary-box">
              <div className="pay-summary-box__label">Saldo atual</div>
              <div className="pay-summary-box__value">{formatHours(data.balanceHours, showValues)}</div>
            </div>
            {data.periodLabel ? (
              <div className="pay-summary-box">
                <div className="pay-summary-box__label">Período RM</div>
                <div className="pay-summary-box__value pay-summary-box__value--sm">{data.periodLabel}</div>
              </div>
            ) : null}
          </div>
          {data.entries.length === 0 ? (
            <p className="pay-empty">Nenhum movimento de crédito/débito encontrado no período recente.</p>
          ) : (
            <table className="pay-table">
              <thead>
                <tr>
                  <th>Competência</th>
                  <th>Descrição</th>
                  <th>Horas</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((entry) => (
                  <tr key={`${entry.date}-${entry.description}-${entry.hours}-${entry.type}`}>
                    <td>{entry.date}</td>
                    <td>{entry.description}</td>
                    <td>{formatHours(entry.hours, showValues)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : null}
    </ContrachequeModal>
  );
}
