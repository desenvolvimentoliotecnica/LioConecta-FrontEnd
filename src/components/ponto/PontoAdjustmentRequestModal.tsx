import { useEffect, useRef, useState } from "react";
import type { CreatePontoAdjustmentDayDto, PontoEntryDto } from "../../api/types";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

const ACCEPT = ".pdf,.png,application/pdf,image/png";
const MAX_FILES = 3;
const MAX_BYTES = 10 * 1024 * 1024;
const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;

type DayDraft = {
  date: string;
  weekdayLabel: string;
  originalClockIn: string;
  originalLunchOut: string;
  originalLunchIn: string;
  originalClockOut: string;
  clockIn: string;
  lunchOut: string;
  lunchIn: string;
  clockOut: string;
};

type Props = {
  open: boolean;
  entries: PontoEntryDto[];
  pending: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    reason: string;
    days: CreatePontoAdjustmentDayDto[];
    files?: File[];
  }) => void;
};

function toDateKey(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

function normalizeTime(value: string | undefined | null): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed || trimmed === "—" || trimmed === "-" || trimmed === "--") return "";
  const match = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return "";
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function isAllowedFile(file: File): boolean {
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

function entryToDraft(entry: PontoEntryDto): DayDraft {
  const clockIn = normalizeTime(entry.clockIn);
  const lunchOut = normalizeTime(entry.lunchOut);
  const lunchIn = normalizeTime(entry.lunchIn);
  const clockOut = normalizeTime(entry.clockOut);
  return {
    date: toDateKey(entry.date),
    weekdayLabel: entry.weekdayLabel,
    originalClockIn: clockIn,
    originalLunchOut: lunchOut,
    originalLunchIn: lunchIn,
    originalClockOut: clockOut,
    clockIn,
    lunchOut,
    lunchIn,
    clockOut,
  };
}

export function PontoAdjustmentRequestModal({
  open,
  entries,
  pending,
  onClose,
  onSubmit,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [days, setDays] = useState<DayDraft[]>([]);
  const [reason, setReason] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setDays([]);
      setReason("");
      setFiles([]);
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setDays(entries.map(entryToDraft));
    setReason("");
    setFiles([]);
    setError(null);
  }, [open, entries]);

  const updateDay = (index: number, field: keyof DayDraft, value: string) => {
    setDays((current) =>
      current.map((day, i) => (i === index ? { ...day, [field]: value } : day)),
    );
  };

  const handleFilesSelected = (selected: FileList | null) => {
    if (!selected || selected.length === 0) return;
    const next = [...files];
    for (const file of Array.from(selected)) {
      if (!isAllowedFile(file)) {
        setError("Anexe apenas arquivos PDF ou PNG.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError("Cada arquivo deve ter no máximo 10 MB.");
        continue;
      }
      if (next.length >= MAX_FILES) {
        setError(`Máximo de ${MAX_FILES} anexos.`);
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

  const handleSubmit = () => {
    if (days.length === 0) {
      setError("Selecione ao menos um dia no espelho.");
      return;
    }
    if (!reason.trim()) {
      setError("Informe o motivo do ajuste.");
      return;
    }
    for (const day of days) {
      for (const [label, value] of [
        ["entrada", day.clockIn],
        ["saída para almoço", day.lunchOut],
        ["retorno do almoço", day.lunchIn],
        ["saída", day.clockOut],
      ] as const) {
        if (!TIME_RE.test(value.trim())) {
          setError(
            `Informe o horário de ${label} no formato HH:mm para ${formatDateLabel(day.date)}.`,
          );
          return;
        }
      }
    }

    setError(null);
    onSubmit({
      reason: reason.trim(),
      days: days.map((day) => ({
        date: day.date,
        originalClockIn: day.originalClockIn,
        originalLunchOut: day.originalLunchOut,
        originalLunchIn: day.originalLunchIn,
        originalClockOut: day.originalClockOut,
        clockIn: day.clockIn.trim(),
        lunchOut: day.lunchOut.trim(),
        lunchIn: day.lunchIn.trim(),
        clockOut: day.clockOut.trim(),
      })),
      files: files.length > 0 ? files : undefined,
    });
  };

  return (
    <ContrachequeModal
      open={open}
      title="Solicitar ajuste de ponto"
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="pay-modal__btn"
            disabled={pending || days.length === 0}
            onClick={handleSubmit}
          >
            {pending ? "Enviando…" : "Enviar solicitação"}
          </button>
        </>
      }
    >
      <div className="ponto-adjust-form">
        <p className="ponto-adjust-form__hint">
          Revise os horários dos {days.length} dia(s) selecionado(s). Seu gestor direto será
          notificado.
        </p>

        {days.map((day, index) => (
          <fieldset key={day.date} className="ponto-adjust-day">
            <legend>
              {formatDateLabel(day.date)} · {day.weekdayLabel}
            </legend>
            <div className="ponto-adjust-day__grid">
              {(
                [
                  ["clockIn", "Entrada", day.originalClockIn],
                  ["lunchOut", "Saída almoço", day.originalLunchOut],
                  ["lunchIn", "Volta almoço", day.originalLunchIn],
                  ["clockOut", "Saída", day.originalClockOut],
                ] as const
              ).map(([field, label, original]) => (
                <label key={field} className="ponto-adjust-day__field">
                  <span>
                    {label}
                    {original ? (
                      <span className="ponto-adjust-day__original"> (atual: {original})</span>
                    ) : null}
                  </span>
                  <input
                    type="time"
                    value={day[field]}
                    onChange={(e) => updateDay(index, field, e.target.value)}
                    required
                  />
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <label className="ponto-adjust-form__reason">
          <span>Motivo do ajuste</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Descreva o motivo da correção"
            required
          />
        </label>

        <div className="ponto-adjust-form__files">
          <span>Anexo opcional (PDF ou PNG, até 10 MB)</span>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            multiple
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
          {files.length > 0 ? (
            <ul className="ponto-adjust-form__file-list">
              {files.map((file, index) => (
                <li key={`${file.name}-${file.size}`}>
                  <span>
                    {file.name} ({formatFileSize(file.size)})
                  </span>
                  <button
                    type="button"
                    className="pay-modal__btn pay-modal__btn--ghost"
                    onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {error ? (
          <p className="leave-form__error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </ContrachequeModal>
  );
}
