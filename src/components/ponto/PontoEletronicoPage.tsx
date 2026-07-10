import { useEffect, useMemo, useState } from "react";
import { usePonto, usePontoPeriods } from "../../api/hooks/usePonto";
import type { PontoEntryDto } from "../../api/types";
import { RhPageHead } from "../servicos/RhPageHead";
import { sectionMainClass } from "../layout/SectionPageHead";
import "../../styles/contracheque-page.css";
import "../../styles/ponto-eletronico-page.css";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

function periodKey(endMonth: number, endYear: number): string {
  return `${endYear}-${String(endMonth).padStart(2, "0")}`;
}

function statusClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes("falta")) return "ponto-status--danger";
  if (normalized.includes("atraso") || normalized.includes("incompleto")) return "ponto-status--warning";
  if (normalized.includes("regular")) return "ponto-status--success";
  return "ponto-status--neutral";
}

function isWeekendWeekday(weekdayLabel: string): boolean {
  const normalized = weekdayLabel
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  return normalized.includes("sabado") || normalized.includes("domingo");
}

function DateCell({ date, weekdayLabel }: { date: string; weekdayLabel: string }) {
  const weekend = isWeekendWeekday(weekdayLabel);
  const chipClass = `ponto-date-chip${weekend ? " ponto-date-chip--weekend" : ""}`;

  return (
    <td>
      <div className="ponto-date-cell">
        <div className="ponto-date-cell__part">
          <span className={chipClass}>{formatDate(date)}</span>
        </div>
        <div className="ponto-date-cell__part">
          <span className={chipClass}>{weekdayLabel}</span>
        </div>
      </div>
    </td>
  );
}

function EntryRow({ entry }: { entry: PontoEntryDto }) {
  return (
    <tr>
      <DateCell date={entry.date} weekdayLabel={entry.weekdayLabel} />
      <td>{entry.clockIn}</td>
      <td>{entry.lunchOut}</td>
      <td>{entry.lunchIn}</td>
      <td>{entry.clockOut}</td>
      <td>{entry.breakMinutes}</td>
      <td>{entry.workedHours}</td>
      <td>{entry.balanceHours}</td>
      <td>
        <span className={`ponto-status ${statusClass(entry.status)}`}>{entry.status}</span>
      </td>
    </tr>
  );
}

export function PontoEletronicoPage() {
  const periodsQuery = usePontoPeriods();
  const options = periodsQuery.data?.options ?? [];
  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string>("");

  useEffect(() => {
    if (options.length === 0 || selectedPeriodKey) return;
    const first = options[0];
    setSelectedPeriodKey(periodKey(first.endMonth, first.endYear));
  }, [options, selectedPeriodKey]);

  const selectedPeriod = useMemo(() => {
    if (!selectedPeriodKey) return options[0] ?? null;
    return (
      options.find((option) => periodKey(option.endMonth, option.endYear) === selectedPeriodKey) ??
      options[0] ??
      null
    );
  }, [options, selectedPeriodKey]);

  const pontoQuery = usePonto(
    selectedPeriod?.endMonth ?? new Date().getMonth() + 1,
    selectedPeriod?.endYear ?? new Date().getFullYear(),
  );

  const data = pontoQuery.data;
  const summary = data?.summary;
  const entries = data?.entries ?? [];
  const isOk = !data?.availabilityStatus || data.availabilityStatus === "ok";
  const periodHelp =
    periodsQuery.data &&
    `Ciclo: dia ${periodsQuery.data.timesheetPeriodStartDay} ao dia ${periodsQuery.data.timesheetPeriodEndDay} do mês seguinte.`;

  return (
    <main className={sectionMainClass("rh")}>
      <RhPageHead
        title="Espelho de Ponto"
        current="Ponto eletrônico"
        description={`Consulte batidas e totais do período integrados ao ${data?.provider ?? "TOTVS RM"} - A Sincronização pode levar até 24hs.`}
        toolbar={
          <div className="pay-toolbar" aria-label="Filtros do espelho de ponto">
            <div className="pay-toolbar__filters page-filters">
              <label className="ponto-period-select">
                <span className="sr-only">Período de fechamento</span>
                <select
                  value={selectedPeriodKey}
                  onChange={(event) => setSelectedPeriodKey(event.target.value)}
                  disabled={periodsQuery.isLoading || options.length === 0}
                  aria-label="Período de fechamento"
                >
                  {options.length === 0 ? (
                    <option value="">Carregando períodos…</option>
                  ) : (
                    options.map((option) => {
                      const key = periodKey(option.endMonth, option.endYear);
                      return (
                        <option key={key} value={key}>
                          {option.label}
                        </option>
                      );
                    })
                  )}
                </select>
              </label>
              {periodHelp ? <span className="ponto-period-help">{periodHelp}</span> : null}
            </div>
          </div>
        }
      />

      <div className="welcome-banner welcome-banner--ponto">
        <div className="welcome-banner__icon" aria-hidden="true">
          <i className="fa-solid fa-clock" />
        </div>
        <div>
          <div className="welcome-banner__title">Controle de jornada</div>
          <p className="welcome-banner__text">
            Selecione o período de fechamento para visualizar entrada, saída, intervalo e saldo diário.
          </p>
        </div>
      </div>

      {data?.userMessage ? (
        <div className="ponto-alert" role="alert">
          {data.userMessage}
        </div>
      ) : null}

      {pontoQuery.isLoading || periodsQuery.isLoading ? (
        <p className="ponto-empty">Carregando espelho de ponto…</p>
      ) : null}

      {pontoQuery.isError || periodsQuery.isError ? (
        <div className="ponto-alert ponto-alert--error">
          <p>Não foi possível carregar o espelho de ponto. Verifique se o backend está em execução.</p>
        </div>
      ) : null}

      {isOk && summary ? (
        <div className="ponto-stats" aria-label="Resumo do período">
          <div className="ponto-stat">
            <div className="ponto-stat__value">{summary.periodLabel}</div>
            <div className="ponto-stat__label">Período</div>
          </div>
          <div className="ponto-stat">
            <div className="ponto-stat__value">{summary.workedHours}</div>
            <div className="ponto-stat__label">Horas trabalhadas</div>
          </div>
          <div className="ponto-stat">
            <div className="ponto-stat__value">{summary.expectedHours}</div>
            <div className="ponto-stat__label">Horas previstas</div>
          </div>
          <div className="ponto-stat">
            <div className="ponto-stat__value">{summary.balanceHours}</div>
            <div className="ponto-stat__label">Banco de horas</div>
          </div>
          <div className="ponto-stat">
            <div className="ponto-stat__value">{summary.absences}</div>
            <div className="ponto-stat__label">Faltas</div>
          </div>
          <div className="ponto-stat">
            <div className="ponto-stat__value">{summary.delays}</div>
            <div className="ponto-stat__label">Atrasos</div>
          </div>
        </div>
      ) : null}

      {isOk ? (
        <section className="ponto-table-wrap" aria-label="Registros diários">
          {entries.length === 0 ? (
            <p className="ponto-empty">Nenhum registro encontrado para o período selecionado.</p>
          ) : (
            <table className="ponto-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Entrada</th>
                  <th>Saída almoço</th>
                  <th>Volta almoço</th>
                  <th>Saída</th>
                  <th>Intervalo</th>
                  <th>Trabalhado</th>
                  <th>Saldo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <EntryRow key={entry.date} entry={entry} />
                ))}
              </tbody>
            </table>
          )}
        </section>
      ) : null}
    </main>
  );
}
