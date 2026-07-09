import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useBenefitList,
  useBenefitRequest,
  useBenefitSummary,
} from "../../api/hooks/useBenefits";
import { useBenefitsBootstrap } from "../../api/hooks/useBenefitsManagement";
import { useBenefitsSettings } from "../../api/hooks/useBenefitsSettings";
import { useMe } from "../../api/hooks/useMe";
import { useToggleBookmark } from "../../api/hooks/usePreferences";
import type { BenefitListItemDto } from "../../api/types";
import { canManageBeneficios } from "../../config/beneficios/settings";
import { bookmarkIdForBenefit, formatMoney } from "../../utils/money";
import { RhPageHead } from "../servicos/RhPageHead";
import { sectionMainClass } from "../layout/SectionPageHead";
import { BeneficioCard, filterBenefits } from "./BeneficioCard";
import { BenefitDetailModal } from "./BenefitDetailModal";
import { BenefitRequestResultModal } from "./BenefitRequestResultModal";
import "../../styles/contracheque-page.css";
import "../../styles/beneficios-page.css";
import "../../styles/beneficios-gestao-page.css";

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "saude", label: "Saúde" },
  { id: "alimentacao", label: "Alimentação" },
  { id: "mobilidade", label: "Mobilidade" },
  { id: "qualidade", label: "Qualidade de vida" },
  { id: "familia", label: "Família" },
] as const;

export function BeneficiosPage() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [showValues, setShowValues] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);

  const summaryQuery = useBenefitSummary();
  const listQuery = useBenefitList();
  const requestMutation = useBenefitRequest();
  const { toggle: toggleBookmark, isSaved } = useToggleBookmark();
  const meQuery = useMe();
  const settingsQuery = useBenefitsSettings();
  const bootstrap = useBenefitsBootstrap();
  const showGestaoLink =
    (bootstrap.data?.canManage ?? false) ||
    (!settingsQuery.isError && canManageBeneficios(meQuery.data, settingsQuery.data));

  const filtered = useMemo(
    () => filterBenefits(listQuery.data ?? [], category, query),
    [listQuery.data, category, query],
  );

  const handlePortal = (benefit: BenefitListItemDto) => {
    if (benefit.portalUrl) {
      window.open(benefit.portalUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleRequest = (benefitId: string) => {
    requestMutation.mutate(
      { benefitId, notes: "Solicitação via portal de benefícios" },
      {
        onSuccess: (result) => {
          setDetailId(null);
          setRequestMessage(result.message);
        },
      },
    );
  };

  const activeCount = summaryQuery.data?.activeCount ?? listQuery.data?.length ?? 0;

  return (
    <main className={sectionMainClass("rh")}>
      <RhPageHead
        title="Benefícios"
        current="Benefícios"
        description="Consulte os benefícios disponíveis no seu contrato, elegibilidade, operadoras parceiras e canais para solicitar inclusão ou alterações."
        toolbar={
          <div className="pay-toolbar">
            <div className="pay-toolbar__filters page-filters" role="group" aria-label="Filtros">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={`filter-chip${category === filter.id ? " is-active" : ""}`}
                  onClick={() => setCategory(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="pay-toolbar__actions">
              {showGestaoLink ? (
                <Link className="beneficios-gestao-btn beneficios-gestao-btn--ghost" to="/servicos/beneficios/gestao">
                  Gestão de benefícios
                </Link>
              ) : null}
              <button
                type="button"
                className={`pay-toggle-values${showValues ? " is-active" : ""}`}
                aria-pressed={showValues}
                onClick={() => setShowValues((value) => !value)}
              >
                <i className={`fa-regular ${showValues ? "fa-eye" : "fa-eye-slash"}`} aria-hidden="true" />
                {showValues ? "Ocultar valores" : "Mostrar valores"}
              </button>
              <label className="pay-search page-search">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar benefícios..."
                  aria-label="Buscar benefícios"
                />
              </label>
            </div>
          </div>
        }
      />

      <div className="welcome-banner welcome-banner--benefits">
        <div className="welcome-banner__icon" aria-hidden="true">
          <i className="fa-solid fa-gift" />
        </div>
        <div>
          <div className="welcome-banner__title">
            {summaryQuery.isLoading
              ? "Carregando benefícios…"
              : `${activeCount} benefício${activeCount === 1 ? "" : "s"} corporativo${activeCount === 1 ? "" : "s"} ativo${activeCount === 1 ? "" : "s"}`}
          </div>
          <p className="welcome-banner__text">
            Pacote completo de saúde, alimentação, mobilidade e qualidade de vida. Verifique
            elegibilidade conforme seu plano e tempo de casa. Dúvidas? Fale com o RH pelo canal de
            Solicitações RH.
          </p>
        </div>
      </div>

      <div className="pay-stats" aria-label="Resumo de benefícios">
        <div className="pay-stat pay-stat--benefits">
          <div className="pay-stat__value">
            {summaryQuery.isLoading ? "…" : (summaryQuery.data?.activeCount ?? 0)}
          </div>
          <div className="pay-stat__label">Benefícios ativos</div>
        </div>
        <div className="pay-stat pay-stat--benefits">
          <div className="pay-stat__value">
            {summaryQuery.isLoading
              ? "…"
              : formatMoney(summaryQuery.data?.totalMonthlyValue ?? 0, showValues)}
          </div>
          <div className="pay-stat__label">Contribuição mensal total</div>
        </div>
        <div className="pay-stat pay-stat--benefits">
          <div className="pay-stat__value">
            {summaryQuery.isLoading ? "…" : (summaryQuery.data?.dependentsCount ?? 0)}
          </div>
          <div className="pay-stat__label">Dependentes cobertos</div>
        </div>
      </div>

      {listQuery.isError ? (
        <p className="page-empty-note" role="alert">
          Não foi possível carregar os benefícios. Verifique sua conexão e tente novamente.
        </p>
      ) : null}

      {listQuery.isLoading ? (
        <p className="page-empty-note">Carregando benefícios…</p>
      ) : (
        <div className="benefits-grid" aria-label="Benefícios corporativos">
          {filtered.map((benefit) => (
            <BeneficioCard
              key={benefit.id}
              benefit={benefit}
              bookmarkSaved={isSaved(bookmarkIdForBenefit(benefit.id))}
              onConsult={(item) => setDetailId(item.id)}
              onPortal={handlePortal}
              onBookmark={(item) => toggleBookmark(bookmarkIdForBenefit(item.id))}
            />
          ))}
        </div>
      )}

      <p className="page-empty-note">
        Exibindo {filtered.length} benefício{filtered.length === 1 ? "" : "s"}
      </p>

      <BenefitDetailModal
        open={detailId !== null}
        benefitId={detailId}
        showValues={showValues}
        onToggleShowValues={() => setShowValues((value) => !value)}
        onClose={() => setDetailId(null)}
        onRequest={handleRequest}
      />

      <BenefitRequestResultModal
        open={requestMessage !== null}
        message={requestMessage}
        onClose={() => setRequestMessage(null)}
      />
    </main>
  );
}
