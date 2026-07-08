import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { PersonSummaryDto } from "../../api/types";
import { usePeopleSearch } from "../../api/hooks/usePhoneExtensions";

type PersonTypeaheadProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelectPerson: (person: PersonSummaryDto) => void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
};

export function PersonTypeahead({
  label,
  value,
  onChange,
  onSelectPerson,
  placeholder,
  hint,
  required,
}: PersonTypeaheadProps) {
  const inputId = useId();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const query = usePeopleSearch(value, open);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const results = query.data ?? [];

  return (
    <div className="ramais-typeahead" ref={rootRef}>
      <label htmlFor={inputId}>
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {hint ? <span className="ramais-form__hint">{hint}</span> : null}
      {open && value.trim().length >= 2 ? (
        <ul id={listId} className="ramais-typeahead__list" role="listbox">
          {query.isFetching ? (
            <li className="ramais-typeahead__empty">Buscando…</li>
          ) : results.length === 0 ? (
            <li className="ramais-typeahead__empty">Nenhuma pessoa encontrada — use texto livre.</li>
          ) : (
            results.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  role="option"
                  className="ramais-typeahead__option"
                  onClick={() => {
                    onSelectPerson(person);
                    setOpen(false);
                  }}
                >
                  <strong>{person.name}</strong>
                  <span>
                    {[person.title, person.departmentName].filter(Boolean).join(" · ") || person.slug}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

type DepartmentTypeaheadProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
};

export function DepartmentTypeahead({
  label,
  value,
  options,
  onChange,
  required,
}: DepartmentTypeaheadProps) {
  const inputId = useId();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const term = value.trim().toLowerCase();
    if (!term) return options.slice(0, 12);
    return options.filter((item) => item.toLowerCase().includes(term)).slice(0, 12);
  }, [options, value]);

  return (
    <div className="ramais-typeahead" ref={rootRef}>
      <label htmlFor={inputId}>
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        required={required}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && filtered.length > 0 ? (
        <ul id={listId} className="ramais-typeahead__list" role="listbox">
          {filtered.map((item) => (
            <li key={item}>
              <button
                type="button"
                role="option"
                className="ramais-typeahead__option"
                onClick={() => {
                  onChange(item);
                  setOpen(false);
                }}
              >
                <strong>{item}</strong>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
