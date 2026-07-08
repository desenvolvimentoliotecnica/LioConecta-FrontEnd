import { useEffect, useMemo, useState } from "react";
import type { LeaveServiceDto } from "../../api/types";
import { useLeaveBalance } from "../../api/hooks/useLeave";
import { countInclusiveDays, validateVacationForm } from "../../utils/leaveHelpers";
import { formatSensitiveCount } from "../../utils/money";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  service: LeaveServiceDto | null;
  showValues: boolean;
  pending: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    serviceId: string;
    startDate?: string;
    endDate?: string;
    days?: number;
    notes?: string;
  }) => void;
};

export function LeaveRequestModal({
  open,
  service,
  showValues,
  pending,
  onClose,
  onSubmit,
}: Props) {
  const isVacation = service?.id === "solicitar-ferias";
  const balanceQuery = useLeaveBalance(open && isVacation);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStartDate("");
      setEndDate("");
      setDays("");
      setNotes("");
      setError(null);
    }
  }, [open]);

  const availableDays = balanceQuery.data?.availableDays ?? 0;

  const computedDays = useMemo(() => {
    if (days) return Number(days);
    if (startDate && endDate) return countInclusiveDays(startDate, endDate);
    return 0;
  }, [days, startDate, endDate]);

  const handleSubmit = () => {
    if (!service) return;

    if (isVacation) {
      const validationError = validateVacationForm({
        startDate,
        endDate,
        availableDays,
        days: computedDays || undefined,
      });
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError(null);
    onSubmit({
      serviceId: service.id,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      days: computedDays > 0 ? computedDays : undefined,
      notes: notes || undefined,
    });
  };

  const submitDisabled =
    pending ||
    (isVacation &&
      (balanceQuery.isLoading ||
        availableDays <= 0 ||
        !startDate ||
        !endDate ||
        computedDays <= 0));

  return (
    <ContrachequeModal
      open={open && service !== null}
      title={service ? service.title : "Solicitação"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="pay-modal__btn"
            disabled={submitDisabled}
            onClick={handleSubmit}
          >
            {pending ? "Enviando…" : "Enviar solicitação"}
          </button>
        </>
      }
    >
      {service ? <p className="leave-detail__desc">{service.desc}</p> : null}

      {isVacation ? (
        <div className="leave-form__saldo" aria-live="polite">
          {balanceQuery.isLoading ? (
            <span>Consultando saldo…</span>
          ) : (
            <span>
              Saldo disponível:{" "}
              <strong>{formatSensitiveCount(availableDays, showValues)}</strong> dia(s)
            </span>
          )}
        </div>
      ) : null}

      {error ? (
        <p className="leave-form__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="leave-form">
        <label className="leave-form__field">
          <span>Data início{isVacation ? " *" : ""}</span>
          <input
            type="date"
            value={startDate}
            required={isVacation}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className="leave-form__field">
          <span>Data fim{isVacation ? " *" : ""}</span>
          <input
            type="date"
            value={endDate}
            required={isVacation}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <label className="leave-form__field">
          <span>Dias {isVacation ? `(calculado: ${computedDays || "—"})` : ""}</span>
          <input
            type="number"
            min={1}
            max={isVacation ? availableDays : undefined}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder={isVacation ? "Automático pelas datas" : "Opcional"}
          />
        </label>
        <label className="leave-form__field leave-form__field--full">
          <span>Observações</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Substituto, motivo ou documentos anexados"
          />
        </label>
      </div>
    </ContrachequeModal>
  );
}
