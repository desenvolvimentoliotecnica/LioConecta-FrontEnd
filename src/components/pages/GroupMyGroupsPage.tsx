import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMyGroups } from "../../api/hooks/useGroups";
import {
  GROUP_TYPE_COMUNIDADE,
  GROUP_TYPE_DEPARTAMENTAL,
  GROUP_TYPE_INTERESSE,
  GROUP_TYPE_PROJETO,
  type GroupDto,
  type GroupType,
} from "../../api/types";
import {
  GROUP_TYPE_OPTIONS,
  groupAccessLabel,
  groupTypeLabel,
  injectGroupExplorePageStyles,
} from "../../config/groups";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";

type MyGroupsFilter = "all" | "departamental" | "projeto" | "interesse" | "comunidade";

const MY_GROUPS_FILTERS: { id: MyGroupsFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "departamental", label: "Departamentais" },
  { id: "projeto", label: "Projetos" },
  { id: "interesse", label: "Interesses" },
  { id: "comunidade", label: "Comunidades" },
];

function typeIconClass(type: GroupType): string {
  switch (type) {
    case GROUP_TYPE_COMUNIDADE:
      return "community";
    case GROUP_TYPE_PROJETO:
      return "project";
    case GROUP_TYPE_INTERESSE:
      return "interest";
    case GROUP_TYPE_DEPARTAMENTAL:
    default:
      return "dept";
  }
}

function matchesMyFilter(group: GroupDto, filter: MyGroupsFilter): boolean {
  switch (filter) {
    case "departamental":
      return group.type === GROUP_TYPE_DEPARTAMENTAL;
    case "projeto":
      return group.type === GROUP_TYPE_PROJETO;
    case "interesse":
      return group.type === GROUP_TYPE_INTERESSE;
    case "comunidade":
      return group.type === GROUP_TYPE_COMUNIDADE;
    case "all":
    default:
      return true;
  }
}

function postsLabel(count: number): string {
  if (count === 0) return "Sem posts";
  if (count === 1) return "1 post";
  return `${count} posts`;
}

function MyGroupCard({ group }: { group: GroupDto }) {
  const iconClass = typeIconClass(group.type);
  const typeMeta = GROUP_TYPE_OPTIONS.find((option) => option.value === group.type);

  return (
    <article className="group-card" data-type={group.type}>
      <div className="group-card__head">
        <div className={`group-card__icon group-card__icon--${iconClass}`} aria-hidden="true">
          <i className={`fa-solid ${typeMeta?.icon ?? group.icon}`} />
        </div>
        <div className="group-card__main">
          <h2 className="group-card__name">{group.name}</h2>
          <p className="group-card__desc">{group.description}</p>
        </div>
      </div>
      <div className="group-card__tags">
        <span className="group-card__type">{groupTypeLabel(group.type)}</span>
        <span className="group-card__access">{groupAccessLabel(group.accessMode)}</span>
      </div>
      <div className="group-card__meta">
        <span>
          <i className="fa-solid fa-user" aria-hidden="true" /> {group.memberCount} membros
        </span>
        <span>
          <i className="fa-regular fa-message" aria-hidden="true" /> {postsLabel(group.postCount)}
        </span>
      </div>
      <div className="group-card__footer">
        <span className="group-card__join group-card__join--member">Membro</span>
      </div>
    </article>
  );
}

export function GroupMyGroupsPage() {
  const { data: groups = [], isLoading, isError } = useMyGroups();
  const [filter, setFilter] = useState<MyGroupsFilter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => injectGroupExplorePageStyles(), []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return groups.filter((group) => {
      if (!matchesMyFilter(group, filter)) return false;
      if (!normalized) return true;
      return (
        group.name.toLowerCase().includes(normalized) ||
        (group.description ?? "").toLowerCase().includes(normalized)
      );
    });
  }, [filter, groups, query]);

  return (
    <main className={sectionMainClass("grupos")}>
      <SectionPageHead
        section="grupos"
        title="Meus grupos"
        current="Meus grupos"
        description="Grupos dos quais você já participa — departamentos, projetos, interesses e comunidades."
        toolbar={
          <div className="page-toolbar">
            <div className="page-filters" role="group" aria-label="Filtros">
              {MY_GROUPS_FILTERS.map((entry) => (
                <button
                  key={entry.id}
                  className={`filter-chip${filter === entry.id ? " is-active" : ""}`}
                  type="button"
                  onClick={() => setFilter(entry.id)}
                >
                  {entry.label}
                </button>
              ))}
            </div>
            <label className="page-search">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar nos meus grupos..."
                aria-label="Buscar nos meus grupos"
              />
            </label>
          </div>
        }
      />

      <div className="welcome-banner">
        <div className="welcome-banner__icon" aria-hidden="true">
          <i className="fa-solid fa-users" />
        </div>
        <div>
          <div className="welcome-banner__title">
            Você participa de {groups.length} grupo{groups.length === 1 ? "" : "s"}
          </div>
          <p className="welcome-banner__text">
            Explore novos grupos em{" "}
            <Link to="/grupos/explorar">Explorar grupos</Link> ou{" "}
            <Link to="/grupos/criar">crie um grupo</Link>.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="groups-grid" aria-busy="true">
          <p className="page-empty-note">Carregando seus grupos...</p>
        </div>
      ) : isError ? (
        <div className="groups-grid">
          <p className="page-empty-note">Não foi possível carregar seus grupos. Tente novamente.</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="groups-grid" aria-label="Meus grupos">
          {filtered.map((group) => (
            <MyGroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <div className="groups-grid">
          <p className="page-empty-note">
            {groups.length === 0
              ? "Você ainda não participa de nenhum grupo."
              : "Nenhum grupo encontrado para os filtros selecionados."}
          </p>
        </div>
      )}

      <p className="page-empty-note">
        Exibindo {filtered.length} de {groups.length} grupo{groups.length === 1 ? "" : "s"}
      </p>
    </main>
  );
}
