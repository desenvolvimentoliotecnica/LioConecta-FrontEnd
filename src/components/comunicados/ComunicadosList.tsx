import { Link } from "react-router-dom";
import { useState } from "react";
import { useArchiveComunicado, useComunicadosArchivedList, useComunicadosList } from "../../api/hooks/useComunicados";
import { COMUNICADO_STATUS_ARCHIVED, COMUNICADO_STATUS_DRAFT, COMUNICADO_STATUS_PUBLISHED, COMUNICADO_STATUS_SCHEDULED, type ComunicadoStatus } from "../../api/types";
import { PERMISSIONS } from "../../config/rbac/permissions";
import { usePermissions } from "../../hooks/usePermissions";
import type { ComunicadoKind, ComunicadoListItemDto } from "../../api/types";
import {
  COMUNICADO_KIND_ARQUIVO,
  COMUNICADO_KIND_DEPARTAMENTAL,
  COMUNICADO_KIND_OFICIAL,
  COMUNICADO_KIND_URGENTE,
} from "../../api/types";
import {
  type ComunicadosPageConfig,
  comunicadoReaderId,
} from "../../config/comunicados-pages";
import { UserAvatar } from "../ui/UserAvatar";

const KIND_TAG: Record<
  ComunicadoKind,
  { label: string; className: string }
> = {
  [COMUNICADO_KIND_OFICIAL]: { label: "Comunicado oficial", className: "" },
  [COMUNICADO_KIND_DEPARTAMENTAL]: { label: "Departamental", className: "tag--dept" },
  [COMUNICADO_KIND_URGENTE]: { label: "Urgente", className: "tag--urgent" },
  [COMUNICADO_KIND_ARQUIVO]: { label: "Arquivo", className: "tag--archive" },
};
const STATUS_LABEL: Record<ComunicadoStatus, string> = {
  [COMUNICADO_STATUS_DRAFT]: "Rascunho",
  [COMUNICADO_STATUS_SCHEDULED]: "Agendado",
  [COMUNICADO_STATUS_PUBLISHED]: "Publicado",
  [COMUNICADO_STATUS_ARCHIVED]: "Arquivado",
};

function formatListDate(value?: string | null): string {  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ComunicadoCard({
  item,
  config,
  featured,
}: {
  item: ComunicadoListItemDto;
  config: ComunicadosPageConfig;
  featured?: boolean;
}) {
  const { hasPermission } = usePermissions();
  const archive = useArchiveComunicado();
  const heroImage = item.heroImageUrl ?? "/bg-announcement.png";
  const readerId = comunicadoReaderId(item);
  const tag = config.listMode === "archived" ? KIND_TAG[item.kind] : { label: config.tagLabel, className: config.tagClass };
  const tagClass = tag.className ? ` ${tag.className}` : "";
  const displayDate = config.listMode === "archived" ? (item.archivedAt ?? item.publishedAt) : item.publishedAt;
  return (
    <article className={`official-card${featured ? " official-card--featured" : ""}`}>
      <div className="official-card__media">
        <img src={heroImage} alt="" />
      </div>
      <div className="official-card__body">
        <div className="official-card__meta">
          <span className={`tag${tagClass}`}>{tag.label}</span>
          <span className="tag">{STATUS_LABEL[item.status]}</span>
          <span className="official-card__date">{formatListDate(displayDate)}</span>          <div className="official-card__author">
            <UserAvatar className="avatar" photoUrl={item.author.photoUrl} />
            {item.author.name}
          </div>
        </div>
        <h2 className="official-card__title">{item.title}</h2>
        {item.excerpt ? <p className="official-card__excerpt">{item.excerpt}</p> : null}
        <Link className="official-card__cta" to={`/comunicados/leitura?id=${encodeURIComponent(readerId)}`}>
          Ler comunicado completo →
        </Link>
        {hasPermission(PERMISSIONS.comunicados.manage) && item.status !== COMUNICADO_STATUS_ARCHIVED ? (
          <button type="button" className="official-card__cta" onClick={() => void archive.mutateAsync({ id: item.id })} disabled={archive.isPending}>Arquivar</button>
        ) : null}
      </div>
    </article>
  );
}

export function ComunicadosListToolbar({ config }: { config: ComunicadosPageConfig }) {
  return (
    <div className="page-toolbar">
      <div className="page-filters" role="group" aria-label="Filtros">
        {config.filterChips.map((chip, index) => (
          <button
            key={chip}
            className={`filter-chip${index === 0 ? " is-active" : ""}`}
            type="button"
          >
            {chip}
          </button>
        ))}
      </div>
      <div className="page-search">
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
        Buscar comunicados
      </div>
    </div>
  );
}

export function ComunicadosList({
  config,
  showToolbar = true,
}: {
  config: ComunicadosPageConfig;
  showToolbar?: boolean;
}) {
  const isArchive = config.listMode === "archived";
  const kindQuery = useComunicadosList(config.kind);
  const archiveQuery = useComunicadosArchivedList();
  const { isLoading, isError } = isArchive ? archiveQuery : kindQuery;
  const items = isArchive ? (archiveQuery.data ?? []) : (kindQuery.data?.items ?? []);
  const [query, setQuery] = useState("");
  const filteredItems = items.filter((item) =>
    `${item.title} ${item.excerpt ?? ""} ${item.author.name}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")),
  );
  return (
    <>
      {showToolbar ? <div className="page-toolbar"><div className="page-search"><i className="fa-solid fa-magnifying-glass" aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar comunicados..." aria-label="Buscar comunicados" /></div></div> : null}

      {isLoading ? (
        <p className="page-empty-note">Carregando comunicados...</p>
      ) : isError ? (
        <p className="page-empty-note">Não foi possível carregar os comunicados.</p>
      ) : filteredItems.length === 0 ? (
        <p className="page-empty-note">Nenhum comunicado encontrado.</p>
      ) : (
        <section className="official-list" aria-label={config.listAriaLabel}>
          {filteredItems.map((item, index) => (
            <ComunicadoCard key={item.id} item={item} config={config} featured={index === 0} />
          ))}
        </section>
      )}

      {!isLoading && !isError ? (
        <p className="page-empty-note">{config.countLabel(filteredItems.length)}</p>
      ) : null}
    </>
  );
}
