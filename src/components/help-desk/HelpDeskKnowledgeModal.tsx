import { useEffect, useState } from "react";
import { useHelpDeskKnowledge } from "../../api/hooks/useHelpDesk";
import type { HelpDeskServiceDto } from "../../api/types";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";

type Props = {
  open: boolean;
  service: HelpDeskServiceDto | null;
  onClose: () => void;
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

export function HelpDeskKnowledgeModal({ open, service, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const knowledgeQuery = useHelpDeskKnowledge(debounced, open);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => setDebounced(query), 250);
    return () => window.clearTimeout(timer);
  }, [open, query]);

  const handleClose = () => {
    setQuery("");
    setDebounced("");
    onClose();
  };

  const wikiUrl = service?.portalUrl ?? "https://wiki.dev.local/ti";

  return (
    <ContrachequeModal
      open={open && service !== null}
      title="Base de conhecimento"
      onClose={handleClose}
      footer={
        <>
          <a
            className="pay-modal__btn pay-modal__btn--ghost"
            href={wikiUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /> Abrir Wiki
          </a>
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={handleClose}>
            Fechar
          </button>
        </>
      }
    >
      <p className="hd-modal__intro">
        <i className="fa-solid fa-book" aria-hidden="true" />
        {service?.helpText}
      </p>
      <label className="hd-modal-form__field hd-modal-form__field--search">
        <span className="hd-modal-form__label">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Buscar artigos
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="VPN, senha, impressora..."
        />
      </label>

      {knowledgeQuery.isLoading ? <p>Carregando artigos…</p> : null}
      {knowledgeQuery.isError ? (
        <p className="hd-modal__error" role="alert">
          Não foi possível carregar a base de conhecimento.
        </p>
      ) : null}

      <ul className="hd-knowledge-list">
        {(knowledgeQuery.data ?? []).map((article) => (
          <li key={article.id} className="hd-knowledge-list__item">
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              <span className="hd-knowledge-list__icon" aria-hidden="true">
                <i className="fa-regular fa-file-lines" />
              </span>
              <span className="hd-knowledge-list__body">
                <strong>{article.title}</strong>
                <span>{article.summary}</span>
                <small>
                  {article.category} · Atualizado em {formatDate(article.updatedAt)}
                </small>
              </span>
              <i className="fa-solid fa-arrow-up-right-from-square hd-knowledge-list__ext" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>

      {!knowledgeQuery.isLoading && (knowledgeQuery.data?.length ?? 0) === 0 ? (
        <p className="hd-modal__empty">Nenhum artigo encontrado para esta busca.</p>
      ) : null}
    </ContrachequeModal>
  );
}
