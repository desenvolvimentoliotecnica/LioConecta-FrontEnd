import { useEffect, useMemo, useState } from "react";
import { useDocuments } from "../../api/hooks/useDocuments";
import { injectScopedPageStyle } from "../../utils/pageInjectedStyles";
import { pageAssets } from "../../generated/pagesIndex";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";

const PAGE_ID = "documentos-biblioteca";

const AREA_LABELS: Record<string, string> = {
  conhecimento: "Conhecimento",
  historia: "História",
  marca: "Marca",
  treinamentos: "Treinamentos",
  cases: "Cases",
  publicacoes: "Publicações",
};

const MEDIA_LABELS: Record<string, string> = {
  ebook: "E-book",
  artigo: "Artigo",
  video: "Vídeo",
  case: "Case",
  publicacao: "Publicação",
  acervo: "Acervo",
};

const MEDIA_ICONS: Record<string, string> = {
  ebook: "fa-book-open",
  artigo: "fa-newspaper",
  video: "fa-circle-play",
  case: "fa-trophy",
  publicacao: "fa-book",
  acervo: "fa-images",
};

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "conhecimento", label: "Conhecimento" },
  { id: "marca", label: "Marca" },
  { id: "treinamentos", label: "Treinamentos" },
  { id: "cases", label: "Cases" },
  { id: "publicacoes", label: "Publicações" },
  { id: "historia", label: "História" },
] as const;

type AreaFilter = (typeof FILTERS)[number]["id"];

function injectBibliotecaStyles(): () => void {
  const assets = pageAssets[PAGE_ID];
  if (!assets?.styles) return () => undefined;
  return injectScopedPageStyle(PAGE_ID, assets.styles);
}

function formatMonthYear(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}

export function DocumentsBibliotecaPage() {
  const { data: documents = [], isLoading, isError } = useDocuments();
  const [filter, setFilter] = useState<AreaFilter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => injectBibliotecaStyles(), []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return documents.filter((doc) => {
      if (filter !== "all" && doc.category !== filter) return false;
      if (!normalized) return true;
      return (
        doc.title.toLowerCase().includes(normalized) ||
        (doc.description ?? "").toLowerCase().includes(normalized) ||
        doc.category.toLowerCase().includes(normalized)
      );
    });
  }, [documents, filter, query]);

  return (
    <main className={sectionMainClass("documentos")}>
      <SectionPageHead
        section="documentos"
        title="Biblioteca Corporativa"
        current="Biblioteca corporativa"
        description="Acervo de conhecimento, história, marca, treinamentos e publicações internas. Explore materiais curados para aprender, compartilhar e preservar a memória da organização."
        toolbar={
          <div className="page-toolbar">
            <div className="page-filters" role="group" aria-label="Filtros">
              {FILTERS.map((entry) => (
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
                placeholder="Buscar no acervo por título ou tema..."
                aria-label="Buscar no acervo"
              />
            </label>
          </div>
        }
      />

      <div className="welcome-banner">
        <div className="welcome-banner__icon" aria-hidden="true">
          <i className="fa-solid fa-building-columns" />
        </div>
        <div>
          <div className="welcome-banner__title">
            {documents.length} materia{documents.length === 1 ? "l" : "is"} no acervo corporativo
          </div>
          <p className="welcome-banner__text">
            E-books, cases, vídeos, publicações e repositórios de marca reunidos em um só lugar.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="docs-grid" aria-busy="true">
          <p className="page-empty-note">Carregando biblioteca...</p>
        </div>
      ) : isError ? (
        <div className="docs-grid">
          <p className="page-empty-note">Não foi possível carregar a biblioteca. Tente novamente.</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="docs-grid" aria-label="Biblioteca corporativa">
          {filtered.map((doc) => {
            const media = doc.mediaType ?? "ebook";
            const href = doc.sharePointUrl || "#";
            return (
              <article key={doc.id} className={`doc-card${doc.isFeatured ? " is-featured" : ""}`}>
                <div className="doc-card__icon" aria-hidden="true">
                  <i className={`fa-solid ${MEDIA_ICONS[media] ?? "fa-file-lines"}`} />
                </div>
                <div className="doc-card__body">
                  <div className="doc-card__meta">
                    <span>{AREA_LABELS[doc.category] ?? doc.category}</span>
                    <span>{MEDIA_LABELS[media] ?? media}</span>
                    <span>{formatMonthYear(doc.modifiedAt)}</span>
                  </div>
                  <h2 className="doc-card__title">{doc.title}</h2>
                  <p className="doc-card__desc">{doc.description ?? "Documento corporativo."}</p>
                </div>
                <div className="doc-card__actions">
                  <a className="doc-card__link" href={href} target="_blank" rel="noopener noreferrer">
                    Abrir
                    <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="docs-grid">
          <p className="page-empty-note">Nenhum material encontrado para os filtros selecionados.</p>
        </div>
      )}

      <p className="page-empty-note">
        Exibindo {filtered.length} de {documents.length} materia{documents.length === 1 ? "l" : "is"}
      </p>
    </main>
  );
}
