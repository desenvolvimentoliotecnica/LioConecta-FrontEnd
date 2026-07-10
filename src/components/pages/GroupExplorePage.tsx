import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExploreGroups, useJoinGroup } from "../../api/hooks/useGroups";
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
  groupTypeLabel,
  injectGroupExplorePageStyles,
} from "../../config/groups";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";

type ExploreFilter = "all" | "popular" | "recent" | "departamental" | "projeto";

const EXPLORE_FILTERS: { id: ExploreFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "popular", label: "Populares" },
  { id: "recent", label: "Recentes" },
  { id: "departamental", label: "Departamentais" },
  { id: "projeto", label: "Projetos" },
];

const RECENT_DAYS = 21;
const POPULAR_MEMBER_THRESHOLD = 4;

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

function isPopularGroup(group: GroupDto): boolean {
  return group.memberCount >= POPULAR_MEMBER_THRESHOLD;
}

function isRecentGroup(group: GroupDto): boolean {
  const created = new Date(group.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created <= RECENT_DAYS * 24 * 60 * 60 * 1000;
}

function matchesExploreFilter(group: GroupDto, filter: ExploreFilter): boolean {
  switch (filter) {
    case "popular":
      return isPopularGroup(group);
    case "recent":
      return isRecentGroup(group);
    case "departamental":
      return group.type === GROUP_TYPE_DEPARTAMENTAL;
    case "projeto":
      return group.type === GROUP_TYPE_PROJETO;
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

function GroupExploreCard({ group }: { group: GroupDto }) {
  const navigate = useNavigate();
  const joinGroup = useJoinGroup();
  const [joinError, setJoinError] = useState<string | null>(null);

  const popular = isPopularGroup(group);
  const recent = isRecentGroup(group);
  const highlightClass = popular || recent ? " is-highlight" : "";
  const iconClass = typeIconClass(group.type);
  const typeMeta = GROUP_TYPE_OPTIONS.find((option) => option.value === group.type);

  async function handleJoin() {
    setJoinError(null);
    try {
      await joinGroup.mutateAsync(group.id);
      navigate(`/grupos/${group.id}`);
    } catch {
      setJoinError("Não foi possível entrar no grupo. Tente novamente.");
    }
  }

  return (
    <article
      className={`group-card${highlightClass}`}
      data-type={group.type}
      data-popular={popular ? "true" : "false"}
      data-recent={recent ? "true" : "false"}
    >
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
        {popular ? <span className="group-card__highlight">Popular</span> : null}
        {!popular && recent ? (
          <span className="group-card__highlight group-card__highlight--new">Novo</span>
        ) : null}
      </div>
      <div className="group-card__meta">
        <span>
          <i className="fa-solid fa-user" aria-hidden="true" /> {group.memberCount} membros
        </span>
        <span>
          <i className="fa-regular fa-message" aria-hidden="true" /> {postsLabel(group.postCount)}
        </span>
      </div>
      {joinError ? (
        <p className="page-empty-note" style={{ color: "#b91c1c", margin: 0 }}>
          {joinError}
        </p>
      ) : null}
      <div className="group-card__footer">
        {group.isMember ? (
          <button
            className="group-card__join group-card__join--member"
            type="button"
            onClick={() => navigate(`/grupos/${group.id}`)}
          >
            Abrir grupo
          </button>
        ) : (
          <button
            className="group-card__join"
            type="button"
            disabled={joinGroup.isPending}
            onClick={() => void handleJoin()}
          >
            {joinGroup.isPending ? "Entrando..." : "Participar"}
          </button>
        )}
        <div className="group-card__actions">
          <button
            className="group-card__btn"
            type="button"
            aria-label={`Ver detalhes de ${group.name}`}
            onClick={() => navigate(`/grupos/${group.id}`)}
          >
            <i className="fa-regular fa-eye" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function GroupExplorePage() {
  const { data: groups = [], isLoading, isError } = useExploreGroups();
  const [filter, setFilter] = useState<ExploreFilter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => injectGroupExplorePageStyles(), []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return groups.filter((group) => {
      if (!matchesExploreFilter(group, filter)) return false;
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
        title="Explorar Grupos"
        current="Explorar grupos"
        description="Descubra comunidades, projetos e grupos departamentais para ampliar sua rede, aprender com outros times e participar de novas iniciativas."
        toolbar={
          <div className="page-toolbar">
            <div className="page-filters" role="group" aria-label="Filtros">
              {EXPLORE_FILTERS.map((entry) => (
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
                placeholder="Buscar grupos para participar..."
                aria-label="Buscar grupos para participar"
              />
            </label>
          </div>
        }
      />

      <div className="welcome-banner">
        <div className="welcome-banner__icon" aria-hidden="true">
          <i className="fa-solid fa-compass" />
        </div>
        <div>
          <div className="welcome-banner__title">
            {groups.length} grupo{groups.length === 1 ? "" : "s"} disponíve
            {groups.length === 1 ? "l" : "is"} para explorar
          </div>
          <p className="welcome-banner__text">
            Clique em Participar para entrar imediatamente em qualquer grupo ativo da plataforma.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="groups-grid" aria-busy="true">
          <p className="page-empty-note">Carregando grupos...</p>
        </div>
      ) : isError ? (
        <div className="groups-grid">
          <p className="page-empty-note">Não foi possível carregar os grupos. Tente novamente.</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="groups-grid" aria-label="Grupos disponíveis">
          {filtered.map((group) => (
            <GroupExploreCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <div className="groups-grid">
          <p className="page-empty-note">Nenhum grupo encontrado para os filtros selecionados.</p>
        </div>
      )}

      <p className="page-empty-note">
        Exibindo {filtered.length} de {groups.length} grupo{groups.length === 1 ? "" : "s"}
      </p>
    </main>
  );
}
