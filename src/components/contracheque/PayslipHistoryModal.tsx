import type { MouseEvent } from "react";
import { downloadPayslipPdf, openPayslipPdfForPrint, usePayslipHistory } from "../../api/hooks/usePayslips";
import { formatMoney } from "../../utils/money";
import { ContrachequeModal } from "./ContrachequeModal";

type Props = {
  open: boolean;
  showValues: boolean;
  onToggleShowValues: () => void;
  onClose: () => void;
  onSelect: (year: number, month: number) => void;
};

function formatCompetenceLabel(competence: string, paymentType?: string) {
  if (paymentType && paymentType !== "FOLHA") {
    return `${competence} · ${paymentType === "ADIANTAMENTO" ? "Adiantamento" : paymentType}`;
  }

  return competence;
}

export function PayslipHistoryModal({
  open,
  showValues,
  onToggleShowValues,
  onClose,
  onSelect,
}: Props) {
  const { data, isLoading, isError } = usePayslipHistory(12);

  const handleDownload = async (
    event: MouseEvent,
    year: number,
    month: number,
  ) => {
    event.stopPropagation();
    await downloadPayslipPdf(year, month);
  };

  const handlePrint = async (
    event: MouseEvent,
    year: number,
    month: number,
  ) => {
    event.stopPropagation();
    await openPayslipPdfForPrint(year, month);
  };

  return (
    <ContrachequeModal
      open={open}
      title="Histórico de holerites"
      wide
      onClose={onClose}
      showValues={showValues}
      onToggleShowValues={onToggleShowValues}
    >
      {isLoading ? <p className="pay-status">Carregando histórico…</p> : null}
      {isError ? <p className="pay-status">Não foi possível carregar o histórico.</p> : null}
      {data && data.length > 0 ? (
        <table className="pay-table pay-table--history">
          <thead>
            <tr>
              <th>Competência</th>
              <th>Bruto</th>
              <th>Líquido</th>
              <th className="pay-table__actions-col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={`${item.year}-${item.month}-${item.paymentType ?? "FOLHA"}`}
                className="is-clickable"
                onClick={() => onSelect(item.year, item.month)}
              >
                <td>{formatCompetenceLabel(item.competence, item.paymentType)}</td>
                <td>{formatMoney(item.grossAmount, showValues)}</td>
                <td>{formatMoney(item.netAmount, showValues)}</td>
                <td className="pay-table__actions">
                  <button
                    type="button"
                    className="pay-row-action"
                    title="Visualizar holerite"
                    aria-label={`Visualizar holerite de ${item.competence}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(item.year, item.month);
                    }}
                  >
                    <i className="fa-regular fa-eye" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="pay-row-action"
                    title="Baixar PDF"
                    aria-label={`Baixar PDF de ${item.competence}`}
                    onClick={(event) => void handleDownload(event, item.year, item.month)}
                  >
                    <i className="fa-regular fa-file-pdf" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="pay-row-action"
                    title="Imprimir PDF"
                    aria-label={`Imprimir holerite de ${item.competence}`}
                    onClick={(event) => void handlePrint(event, item.year, item.month)}
                  >
                    <i className="fa-solid fa-print" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {data && data.length === 0 ? (
        <p className="pay-status">Nenhum holerite encontrado para o seu período na empresa.</p>
      ) : null}
    </ContrachequeModal>
  );
}
