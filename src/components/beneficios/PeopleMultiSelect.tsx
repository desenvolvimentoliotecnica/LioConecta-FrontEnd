import { useEffect, useId, useRef, useState } from "react";
import type { PersonSummaryDto } from "../../api/types";
import { usePeopleSearch } from "../../api/hooks/usePhoneExtensions";

type PeopleMultiSelectProps = {
  label: string;
  selected: PersonSummaryDto[];
  onChange: (people: PersonSummaryDto[]) => void;
  placeholder?: string;
};

export function PeopleMultiSelect({
  label,
  selected,
  onChange,
  placeholder = "Buscar colaborador...",
}: PeopleMultiSelectProps) {
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const search = usePeopleSearch(query, open);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const addPerson = (person: PersonSummaryDto) => {
    if (selected.some((item) => item.id === person.id)) return;
    onChange([...selected, person]);
    setQuery("");
    setOpen(false);
  };

  const removePerson = (personId: string) => {
    onChange(selected.filter((item) => item.id !== personId));
  };

  return (
    <div className="beneficios-gestao__multiselect" ref={rootRef}>
      <label htmlFor={inputId} className="beneficios-gestao__field-label">
        {label}
      </label>
      <div className="beneficios-gestao__chips">
        {selected.map((person) => (
          <span key={person.id} className="beneficios-gestao__chip">
            {person.name}
            <button type="button" aria-label={`Remover ${person.name}`} onClick={() => removePerson(person.id)}>
              ×
            </button>
          </span>
        ))}
        <span className="beneficios-gestao__chip-count">{selected.length} selecionada(s)</span>
      </div>
      <input
        id={inputId}
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && query.trim().length > 0 ? (
        <ul className="beneficios-gestao__typeahead-list" role="listbox">
          {(search.data ?? []).map((person) => (
            <li key={person.id}>
              <button type="button" onClick={() => addPerson(person)}>
                <strong>{person.name}</strong>
                {person.departmentName ? <span>{person.departmentName}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
