import { useEffect, useMemo, useRef, useState } from "react";
import type { LeaveServiceDto } from "../../api/types";
import { useLeaveBalance } from "../../api/hooks/useLeave";
import { countInclusiveDays, validateVacationForm } from "../../utils/leaveHelpers";
import { formatSensitiveCount } from "../../utils/money";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

const ATESTADO_SERVICE_ID = "atestado";
const ATESTADO_ACCEPT = ".pdf,.png,application/pdf,image/png";
const ATESTADO_MAX_FILES = 3;
const ATESTADO_MAX_BYTES = 10 * 1024 * 1024;

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
    files?: File[];
  }) => void;
};

function isAllowedAtestadoFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    name.endsWith(".pdf") ||
    name.endsWith(".png") ||
    type === "application/pdf" ||
    type === "image/png"
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatLeaveDateOnly(value: string): string {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (dateOnly) {
    const [, y, m, d] = dateOnly;
    return `${d}/${m}/${y}`;
  }
  return new Date(value).toLocaleDateString("pt-BR");
}

export function LeaveRequestModal({
  open,
  service,
  showValues,
  pending,
  onClose,
  onSubmit,
}: Props) {
  const isVacation = service?.id === "solicitar-ferias";
  const isAtestado = service?.id === ATESTADO_SERVICE_ID;
  const balanceQuery = useLeaveBalance(open && isVacation);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStartDate("");
      setEndDate("");
      setDays("");
      setNotes("");
      setFiles([]);
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open]);

  const availableDays = balanceQuery.data?.availableDays ?? 0;
  const acquiringDays = balanceQuery.data?.acquiringDays ?? 0;
  const nextLiberationAt = balanceQuery.data?.nextLiberationAt ?? null;

  const computedDays = useMemo(() => {
    if (days) return Number(days);
    if (startDate && endDate) return countInclusiveDays(startDate, endDate);
    return 0;
  }, [days, startDate, endDate]);

  const handleFilesSelected = (selected: FileList | null) => {
    if (!selected || selected.length === 0) return;

    const next = [...files];
    for (const file of Array.from(selected)) {
      if (!isAllowedAtestadoFile(file)) {
        setError("Anexe apenas arquivos PDF ou PNG.");
        continue;
      }
      if (file.size > ATESTADO_MAX_BYTES) {
        setError("Cada arquivo deve ter no máximo 10 MB.");
        continue;
      }
      if (next.length >= ATESTADO_MAX_FILES) {
        setError(`Máximo de ${ATESTADO_MAX_FILES} anexos.`);
        break;
      }
      if (next.some((item) => item.name === file.name && item.size === file.size)) {
        continue;
      }
      next.push(file);
    }

    setFiles(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!service) return;

    if (isVacation) {
      const validationError = validateVacationForm({
        startDate,
        endDate,
        availableDays,
        acquiringDays,
        nextLiberationAt,
        days: computedDays || undefined,
      });
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (isAtestado && files.length === 0) {
      setError("Anexe o atestado em PDF ou PNG para enviar a solicitação.");
      return;
    }

    setError(null);
    onSubmit({
      serviceId: service.id,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      days: computedDays > 0 ? computedDays : undefined,
      notes: notes || undefined,
      files: isAtestado ? files : undefined,
    });
  };

  const submitDisabled =
    pending ||
    (isAtestado && files.length === 0) ||
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
            <>
              <span>
                Liberados para gozo:{" "}
                <strong>{formatSensitiveCount(availableDays, showValues)}</strong> dia(s)
              </span>
              {acquiringDays > 0 ? (
                <p className="leave-detail__hint">
                  {nextLiberationAt
                    ? `${formatSensitiveCount(acquiringDays, showValues)} dia(s) em aquisição — poderão ser solicitados a partir de ${formatLeaveDateOnly(nextLiberationAt)}.`
                    : `${formatSensitiveCount(acquiringDays, showValues)} dia(s) em aquisição (ainda não liberados).`}
                </p>
              ) : null}
              {availableDays <= 0 ? (
                <p className="leave-form__error" role="status">
                  Não é possível solicitar férias sem dias liberados para gozo.
                </p>
              ) : null}
            </>
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
            placeholder={
              isAtestado
                ? "CID (se aplicável), médico ou observações adicionais"
                : "Substituto, motivo ou documentos anexados"
            }
          />
        </label>

        {isAtestado ? (
          <div className="leave-form__field leave-form__field--full">
            <span>Anexo do atestado *</span>
            <div className="leave-form__upload">
              <input
                ref={fileInputRef}
                type="file"
                accept={ATESTADO_ACCEPT}
                multiple
                className="leave-form__file-input"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
              <button
                type="button"
                className="pay-modal__btn pay-modal__btn--ghost leave-form__upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={pending || files.length >= ATESTADO_MAX_FILES}
              >
                <i className="fa-solid fa-paperclip" aria-hidden="true" />
                Selecionar PDF ou PNG
              </button>
              <p className="leave-form__upload-hint">
                Obrigatório. Até {ATESTADO_MAX_FILES} arquivos, 10 MB cada (PDF ou PNG).
              </p>
              {files.length > 0 ? (
                <ul className="leave-form__file-list">
                  {files.map((file, index) => (
                    <li key={`${file.name}-${file.size}-${index}`} className="leave-form__file-item">
                      <span>
                        <i
                          className={`fa-solid ${file.name.toLowerCase().endsWith(".pdf") ? "fa-file-pdf" : "fa-file-image"}`}
                          aria-hidden="true"
                        />{" "}
                        {file.name}{" "}
                        <span className="leave-form__file-size">({formatFileSize(file.size)})</span>
                      </span>
                      <button
                        type="button"
                        className="leave-form__file-remove"
                        aria-label={`Remover ${file.name}`}
                        onClick={() => removeFile(index)}
                        disabled={pending}
                      >
                        <i className="fa-solid fa-xmark" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </ContrachequeModal>
  );
}
