import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { PersonSummaryDto, RbacSubjectSearchResultDto, TestUserDto } from "../../../api/types";
import { useRbacSubjectSearch, useRbacTestUsers } from "../../../api/hooks/useRbacAdmin";
import { PeopleMultiSelect } from "../../beneficios/PeopleMultiSelect";
import type { AssignmentSubject } from "./rbacUi";
import "../../../styles/beneficios-gestao-page.css";

type SubjectTab = "Person" | "TestUser" | "PortalUser";

type Props = {
  selected: AssignmentSubject[];
  onChange: (subjects: AssignmentSubject[]) => void;
  disabled?: boolean;
};

function toAssignmentSubject(result: RbacSubjectSearchResultDto): AssignmentSubject {
  return {
    subjectType: result.subjectType,
    subjectId: result.subjectId,
    label: result.subtitle ? `${result.label} (${result.subtitle})` : result.label,
  };
}

function personToSubject(person: PersonSummaryDto): AssignmentSubject {
  return {
    subjectType: "Person",
    subjectId: person.id,
    label: person.departmentName ? `${person.name} · ${person.departmentName}` : person.name,
  };
}

function testUserToSubject(user: TestUserDto): AssignmentSubject {
  return {
    subjectType: "TestUser",
    subjectId: user.id,
    label: `${user.displayName} (${user.email})`,
  };
}

function SubjectTypeahead({
  subjectType,
  selected,
  onAdd,
  disabled,
}: {
  subjectType: "TestUser" | "PortalUser";
  selected: AssignmentSubject[];
  onAdd: (subject: AssignmentSubject) => void;
  disabled?: boolean;
}) {
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const search = useRbacSubjectSearch(subjectType, query, open);
  const testUsersQuery = useRbacTestUsers();

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const staticOptions = useMemo(() => {
    if (subjectType !== "TestUser" || query.trim()) return [];
    return (testUsersQuery.data ?? []).map(testUserToSubject);
  }, [query, subjectType, testUsersQuery.data]);

  const remoteOptions = useMemo(
    () => (search.data ?? []).map(toAssignmentSubject),
    [search.data],
  );

  const options = query.trim() ? remoteOptions : staticOptions;
  const selectedIds = new Set(selected.map((item) => `${item.subjectType}:${item.subjectId}`));

  return (
    <div className="controle-acesso__subject-typeahead" ref={rootRef}>
      <label htmlFor={inputId} className="controle-acesso__field-label">
        {subjectType === "PortalUser" ? "Buscar PortalUser por e-mail" : "Buscar usuário de teste"}
      </label>
      <input
        id={inputId}
        type="text"
        value={query}
        placeholder={subjectType === "PortalUser" ? "Digite o e-mail…" : "Nome ou e-mail…"}
        disabled={disabled}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && (query.trim().length >= 2 || subjectType === "TestUser") ? (
        <ul className="controle-acesso__subject-typeahead-list" role="listbox">
          {search.isLoading || testUsersQuery.isLoading ? (
            <li className="controle-acesso__status">Carregando…</li>
          ) : null}
          {!search.isLoading && options.length === 0 ? (
            <li className="controle-acesso__status">Nenhum resultado.</li>
          ) : (
            options.map((option) => {
              const key = `${option.subjectType}:${option.subjectId}`;
              const isSelected = selectedIds.has(key);
              return (
                <li key={key}>
                  <button
                    type="button"
                    disabled={disabled || isSelected}
                    onClick={() => {
                      onAdd(option);
                      setQuery("");
                      setOpen(false);
                    }}
                  >
                    <strong>{option.label}</strong>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}

export function RbacSubjectPicker({ selected, onChange, disabled }: Props) {
  const [tab, setTab] = useState<SubjectTab>("Person");

  const peopleSelection = useMemo(
    () =>
      selected
        .filter((item) => item.subjectType === "Person" || item.subjectType === 1)
        .map((item) => ({
          id: item.subjectId,
          slug: item.subjectId,
          name: item.label.split(" · ")[0] ?? item.label,
          departmentName: item.label.includes(" · ") ? item.label.split(" · ").slice(1).join(" · ") : null,
          isActive: true,
        })),
    [selected],
  );

  const tabSubjects = selected.filter((item) => normalizeTabSubjectType(item.subjectType) === tab);
  const otherSubjects = selected.filter((item) => normalizeTabSubjectType(item.subjectType) !== tab);

  const setPeople = (people: PersonSummaryDto[]) => {
    onChange([...otherSubjects, ...people.map(personToSubject)]);
  };

  const addSubject = (subject: AssignmentSubject) => {
    const key = `${subject.subjectType}:${subject.subjectId}`;
    if (selected.some((item) => `${item.subjectType}:${item.subjectId}` === key)) return;
    onChange([...selected, subject]);
  };

  const removeSubject = (subject: AssignmentSubject) => {
    const key = `${subject.subjectType}:${subject.subjectId}`;
    onChange(selected.filter((item) => `${item.subjectType}:${item.subjectId}` !== key));
  };

  return (
    <div className="controle-acesso__subject-picker">
      <div className="page-filters" role="tablist" aria-label="Tipo de sujeito">
        {(["Person", "TestUser", "PortalUser"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={`filter-chip${tab === item ? " is-active" : ""}`}
            disabled={disabled}
            onClick={() => setTab(item)}
          >
            {item === "Person" ? "Colaborador" : item === "TestUser" ? "Usuário de teste" : "PortalUser"}
          </button>
        ))}
      </div>

      {tab === "Person" ? (
        <PeopleMultiSelect
          label="Colaboradores do diretório"
          selected={peopleSelection}
          onChange={setPeople}
          placeholder="Buscar colaborador no diretório…"
        />
      ) : (
        <SubjectTypeahead
          subjectType={tab}
          selected={selected}
          onAdd={addSubject}
          disabled={disabled}
        />
      )}

      {selected.length > 0 ? (
        <div className="controle-acesso__subject-chips" aria-label="Sujeitos selecionados">
          {selected.map((subject) => (
            <span key={`${subject.subjectType}:${subject.subjectId}`} className="controle-acesso__subject-chip">
              <span className="controle-acesso__subject-chip-type">{subjectTypeChipLabel(subject.subjectType)}</span>
              {subject.label}
              <button
                type="button"
                aria-label={`Remover ${subject.label}`}
                disabled={disabled}
                onClick={() => removeSubject(subject)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="controle-acesso__status">Selecione ao menos um sujeito.</p>
      )}

      {tab !== "Person" && tabSubjects.length > 0 ? (
        <p className="controle-acesso__status">{tabSubjects.length} selecionado(s) nesta aba.</p>
      ) : null}
    </div>
  );
}

function normalizeTabSubjectType(value: AssignmentSubject["subjectType"]): SubjectTab {
  if (value === 0 || value === "PortalUser") return "PortalUser";
  if (value === 1 || value === "Person") return "Person";
  return "TestUser";
}

function subjectTypeChipLabel(value: AssignmentSubject["subjectType"]): string {
  if (value === 0 || value === "PortalUser") return "Portal";
  if (value === 1 || value === "Person") return "Pessoa";
  return "Teste";
}
