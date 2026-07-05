import { useState } from "react";
import type { LeaveServiceDto } from "../../api/types";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  service: LeaveServiceDto | null;
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

export function LeaveRequestModal({ open, service, pending, onClose, onSubmit }: Props) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!service) return;
    onSubmit({
      serviceId: service.id,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      days: days ? Number(days) : undefined,
      notes: notes || undefined,
    });
  };

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
          <button type="button" className="pay-modal__btn" disabled={pending} onClick={handleSubmit}>
            {pending ? "Enviando…" : "Enviar solicitação"}
          </button>
        </>
      }
    >
      {service ? <p className="leave-detail__desc">{service.desc}</p> : null}
      <div className="leave-form">
        <label className="leave-form__field">
          <span>Data início</span>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label className="leave-form__field">
          <span>Data fim</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <label className="leave-form__field">
          <span>Dias</span>
          <input
            type="number"
            min={1}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="Opcional"
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
