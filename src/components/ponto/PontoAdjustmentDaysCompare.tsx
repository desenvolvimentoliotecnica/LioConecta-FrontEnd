import type { PontoAdjustmentDayDetailDto } from "../../api/types";

type PunchField = {
  key: "clockIn" | "lunchOut" | "lunchIn" | "clockOut";
  originalKey: "originalClockIn" | "originalLunchOut" | "originalLunchIn" | "originalClockOut";
  label: string;
};

const PUNCH_FIELDS: PunchField[] = [
  { key: "clockIn", originalKey: "originalClockIn", label: "Entrada" },
  { key: "lunchOut", originalKey: "originalLunchOut", label: "Saída almoço" },
  { key: "lunchIn", originalKey: "originalLunchIn", label: "Volta almoço" },
  { key: "clockOut", originalKey: "originalClockOut", label: "Saída" },
];

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

function weekdayLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", { weekday: "long" });
}

function displayTime(value?: string | null): string {
  const trimmed = (value ?? "").trim();
  return trimmed || "—";
}

function isChanged(original?: string | null, requested?: string | null): boolean {
  return displayTime(original) !== displayTime(requested);
}

type Props = {
  days: PontoAdjustmentDayDetailDto[];
};

export function PontoAdjustmentDaysCompare({ days }: Props) {
  return (
    <div className="ponto-adjust-detail-days">
      {days.map((day) => {
        const changedCount = PUNCH_FIELDS.filter((field) =>
          isChanged(day[field.originalKey], day[field.key]),
        ).length;

        return (
          <article key={day.date} className="ponto-adjust-detail-day">
            <header className="ponto-adjust-detail-day__head">
              <div>
                <h5 className="ponto-adjust-detail-day__date">{formatDate(day.date)}</h5>
                <p className="ponto-adjust-detail-day__weekday">{weekdayLabel(day.date)}</p>
              </div>
              {changedCount > 0 ? (
                <span className="ponto-adjust-detail-day__chip">
                  {changedCount} alteração{changedCount > 1 ? "ões" : ""}
                </span>
              ) : (
                <span className="ponto-adjust-detail-day__chip ponto-adjust-detail-day__chip--muted">
                  Sem alteração
                </span>
              )}
            </header>

            <div className="ponto-adjust-punches" role="list">
              {PUNCH_FIELDS.map((field) => {
                const original = displayTime(day[field.originalKey]);
                const requested = displayTime(day[field.key]);
                const changed = isChanged(day[field.originalKey], day[field.key]);

                return (
                  <div
                    key={field.key}
                    role="listitem"
                    className={`ponto-adjust-punch${changed ? " ponto-adjust-punch--changed" : ""}`}
                  >
                    <span className="ponto-adjust-punch__label">{field.label}</span>
                    <div className="ponto-adjust-punch__values">
                      <div className="ponto-adjust-punch__row">
                        <span className="ponto-adjust-punch__tag">Atual</span>
                        <span className="ponto-adjust-punch__time">{original}</span>
                      </div>
                      <div className="ponto-adjust-punch__row ponto-adjust-punch__row--requested">
                        <span className="ponto-adjust-punch__tag">Solicitado</span>
                        <span className="ponto-adjust-punch__time">{requested}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        );
      })}
    </div>
  );
}
