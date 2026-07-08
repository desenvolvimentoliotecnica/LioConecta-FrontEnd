import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { PhoneExtensionDto, UpsertPhoneExtensionRequest } from "../../api/types";
import { DepartmentTypeahead, PersonTypeahead } from "./RamaisTypeaheads";

export type PhoneExtensionFormState = {
  name: string;
  extension: string;
  mobile: string;
  department: string;
  title: string;
  email: string;
  managerName: string;
  personId: string | null;
  personSlug: string | null;
  isActive: boolean;
};

export function emptyPhoneExtensionForm(): PhoneExtensionFormState {
  return {
    name: "",
    extension: "",
    mobile: "",
    department: "",
    title: "",
    email: "",
    managerName: "",
    personId: null,
    personSlug: null,
    isActive: true,
  };
}

export function formFromDto(dto: PhoneExtensionDto): PhoneExtensionFormState {
  return {
    name: dto.name,
    extension: dto.extension,
    mobile: dto.mobile ?? "",
    department: dto.department,
    title: dto.title ?? "",
    email: dto.email ?? "",
    managerName: dto.managerName ?? "",
    personId: dto.personId ?? null,
    personSlug: dto.personSlug ?? null,
    isActive: dto.isActive,
  };
}

export function formToRequest(form: PhoneExtensionFormState): UpsertPhoneExtensionRequest {
  return {
    name: form.name.trim(),
    extension: form.extension.trim(),
    mobile: form.mobile.trim() || null,
    department: form.department.trim(),
    title: form.title.trim() || null,
    email: form.email.trim() || null,
    managerName: form.managerName.trim() || null,
    personId: form.personId,
    isActive: form.isActive,
  };
}

type Props = {
  open: boolean;
  title: string;
  initial: PhoneExtensionFormState;
  departmentOptions: string[];
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (form: PhoneExtensionFormState) => Promise<void> | void;
};

export function PhoneExtensionFormModal({
  open,
  title,
  initial,
  departmentOptions,
  saving,
  error,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    if (open) setForm(initial);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const deptOptions = useMemo(() => {
    const set = new Set(departmentOptions.map((d) => d.trim()).filter(Boolean));
    if (form.department.trim()) set.add(form.department.trim());
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [departmentOptions, form.department]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit(form);
  };

  return (
    <div className="ramais-modal" role="presentation" onClick={onClose}>
      <div
        className="ramais-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ramais-form-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="ramais-modal__head">
          <h2 id="ramais-form-title">{title}</h2>
          <button type="button" className="ramais-modal__close" onClick={onClose} aria-label="Fechar">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <form className="ramais-form" onSubmit={handleSubmit}>
          <PersonTypeahead
            label="Nome"
            value={form.name}
            required
            placeholder="Buscar pessoa ou digitar nome genérico"
            hint={
              form.personId
                ? `Vinculado à pessoa${form.personSlug ? ` (${form.personSlug})` : ""}`
                : "Sem vínculo — digite livremente para ramais genéricos"
            }
            onChange={(name) =>
              setForm((current) => ({
                ...current,
                name,
                personId: null,
                personSlug: null,
              }))
            }
            onSelectPerson={(person) =>
              setForm((current) => ({
                ...current,
                name: person.name,
                personId: person.id,
                personSlug: person.slug,
                title: person.title ?? current.title,
                department: person.departmentName ?? current.department,
              }))
            }
          />

          {form.personId ? (
            <button
              type="button"
              className="ramais-form__link-btn"
              onClick={() =>
                setForm((current) => ({ ...current, personId: null, personSlug: null }))
              }
            >
              Limpar vínculo com pessoa
            </button>
          ) : null}

          <div className="ramais-form__row">
            <label>
              Ramal *
              <input
                required
                value={form.extension}
                onChange={(event) => setForm((c) => ({ ...c, extension: event.target.value }))}
              />
            </label>
            <DepartmentTypeahead
              label="Departamento"
              value={form.department}
              options={deptOptions}
              required
              onChange={(department) => setForm((c) => ({ ...c, department }))}
            />
          </div>

          <div className="ramais-form__row">
            <label>
              Cargo
              <input
                value={form.title}
                onChange={(event) => setForm((c) => ({ ...c, title: event.target.value }))}
              />
            </label>
            <label>
              Celular
              <input
                value={form.mobile}
                onChange={(event) => setForm((c) => ({ ...c, mobile: event.target.value }))}
              />
            </label>
          </div>

          <label>
            E-mail
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((c) => ({ ...c, email: event.target.value }))}
            />
          </label>

          <PersonTypeahead
            label="Gestor"
            value={form.managerName}
            placeholder="Buscar gestor ou digitar nome"
            onChange={(managerName) => setForm((c) => ({ ...c, managerName }))}
            onSelectPerson={(person) =>
              setForm((c) => ({ ...c, managerName: person.name }))
            }
          />

          <label className="ramais-form__check">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((c) => ({ ...c, isActive: event.target.checked }))}
            />
            Ativo
          </label>

          {error ? <p className="ramais-form__error">{error}</p> : null}

          <footer className="ramais-form__actions">
            <button type="button" className="ramais-btn ramais-btn--ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="ramais-btn ramais-btn--primary" disabled={saving}>
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
