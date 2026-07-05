import {
  useDescontosConsulta,
  useFgtsConsulta,
  useRubricasConsulta,
} from "../../api/hooks/usePayslips";
import { formatMoney } from "../../utils/money";
import { ContrachequeModal } from "./ContrachequeModal";

export type ConsultaKind = "fgts" | "descontos" | "rubricas";

const TITLES: Record<ConsultaKind, string> = {
  fgts: "FGTS e encargos",
  descontos: "Descontos em folha",
  rubricas: "Dúvidas sobre rubricas",
};

type Props = {
  open: boolean;
  kind: ConsultaKind | null;
  showValues: boolean;
  onToggleShowValues: () => void;
  onClose: () => void;
};

export function PayslipConsultaModal({
  open,
  kind,
  showValues,
  onToggleShowValues,
  onClose,
}: Props) {
  const fgts = useFgtsConsulta(open && kind === "fgts");
  const descontos = useDescontosConsulta(open && kind === "descontos");
  const rubricas = useRubricasConsulta(open && kind === "rubricas");

  const title = kind ? TITLES[kind] : "";

  return (
    <ContrachequeModal
      open={open && kind !== null}
      title={title}
      wide
      onClose={onClose}
      showValues={showValues}
      onToggleShowValues={onToggleShowValues}
    >
      {kind === "fgts" ? (
        <>
          {fgts.isLoading ? <p className="pay-status">Carregando FGTS…</p> : null}
          {fgts.data ? (
            <>
              <div className="pay-summary-box" style={{ marginBottom: 16 }}>
                <div className="pay-summary-box__label">Saldo acumulado (6 meses)</div>
                <div className="pay-summary-box__value">
                  {formatMoney(fgts.data.totalBalance, showValues)}
                </div>
              </div>
              <table className="pay-table">
                <thead>
                  <tr>
                    <th>Competência</th>
                    <th>Depósito FGTS</th>
                    <th>Encargo patronal</th>
                  </tr>
                </thead>
                <tbody>
                  {fgts.data.deposits.map((item) => (
                    <tr key={item.competence}>
                      <td>{item.competence}</td>
                      <td>{formatMoney(item.amount, showValues)}</td>
                      <td>{formatMoney(item.employerShare, showValues)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}
        </>
      ) : null}

      {kind === "descontos" ? (
        <>
          {descontos.isLoading ? <p className="pay-status">Carregando descontos…</p> : null}
          {descontos.data ? (
            <>
              <div className="pay-summary-box" style={{ marginBottom: 16 }}>
                <div className="pay-summary-box__label">Total de descontos (última competência)</div>
                <div className="pay-summary-box__value">
                  {formatMoney(descontos.data.totalMonthly, showValues)}
                </div>
              </div>
              <table className="pay-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descrição</th>
                    <th>Competência</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {descontos.data.items.map((item) => (
                    <tr key={item.code}>
                      <td>{item.code}</td>
                      <td>{item.label}</td>
                      <td>{item.competence}</td>
                      <td>{formatMoney(item.amount, showValues)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}
        </>
      ) : null}

      {kind === "rubricas" ? (
        <>
          {rubricas.isLoading ? <p className="pay-status">Carregando glossário…</p> : null}
          {rubricas.data ? (
            <table className="pay-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Rubrica</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                {rubricas.data.items.map((item) => (
                  <tr key={item.code}>
                    <td>{item.code}</td>
                    <td>{item.label}</td>
                    <td>{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </>
      ) : null}
    </ContrachequeModal>
  );
}
