import { useMemo, useState } from "react";
import {
  downloadPayslipPdf,
  usePayslipHistory,
  usePayslipRequest,
  usePayslipServices,
  usePayslipSummary,
} from "../../api/hooks/usePayslips";
import { useToggleBookmark } from "../../api/hooks/usePreferences";
import type { PayslipServiceDto } from "../../api/types";
import { bookmarkIdForService, formatMoney } from "../../utils/money";
import { buildSyncMetaLabel } from "../../utils/syncMeta";
import {
  ContrachequeServiceCard,
  filterServices,
} from "./ContrachequeServiceCard";
import { PayslipComparativoModal } from "./PayslipComparativoModal";
import { PayslipConsultaModal, type ConsultaKind } from "./PayslipConsultaModal";
import { PayslipHelpModal } from "./PayslipHelpModal";
import { PayslipHistoryModal } from "./PayslipHistoryModal";
import { PayslipInformeModal } from "./PayslipInformeModal";
import { PayslipRequestResultModal } from "./PayslipRequestResultModal";
import { PayslipViewerModal } from "./PayslipViewerModal";
import { RhPageHead } from "../servicos/RhPageHead";
import { sectionMainClass } from "../layout/SectionPageHead";
import "../../styles/contracheque-page.css";

const PAYSLIP_HISTORY_LIMIT = 12;
const INFORME_IR_YEAR = new Date().getFullYear() - 1;

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "holerite", label: "Holerite" },
  { id: "historico", label: "Histórico" },
  { id: "documento", label: "Documentos" },
  { id: "informe", label: "Informes" },
  { id: "consulta", label: "Consultas" },
] as const;

export function ContrachequePage() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [showValues, setShowValues] = useState(false);
  const toggleShowValues = () => setShowValues((value) => !value);
  const [viewer, setViewer] = useState<{ year: number; month: number; title: string } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [comparativoOpen, setComparativoOpen] = useState(false);
  const [consultaKind, setConsultaKind] = useState<ConsultaKind | null>(null);
  const [informeOpen, setInformeOpen] = useState(false);
  const [helpService, setHelpService] = useState<PayslipServiceDto | null>(null);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);

  const summaryQuery = usePayslipSummary();
  const servicesQuery = usePayslipServices();
  const historyQuery = usePayslipHistory(PAYSLIP_HISTORY_LIMIT);
  const requestMutation = usePayslipRequest();
  const { toggle: toggleBookmark, isSaved } = useToggleBookmark();

  const filtered = useMemo(
    () => filterServices(servicesQuery.data ?? [], category, query),
    [servicesQuery.data, category, query],
  );

  const summaryData = summaryQuery.data;
  const syncMetaLabel = useMemo(
    () => buildSyncMetaLabel(summaryData?.syncedAt, summaryData?.dataSource),
    [summaryData?.syncedAt, summaryData?.dataSource],
  );

  const latest = historyQuery.data?.[0];
  const previous = historyQuery.data?.[1];

  const openLatestViewer = (title: string) => {
    if (!latest) {
      return;
    }
    setViewer({ year: latest.year, month: latest.month, title });
  };

  const handlePrimaryAction = async (service: PayslipServiceDto) => {
    switch (service.id) {
      case "visualizar":
      case "demonstrativo":
        openLatestViewer(service.title);
        break;
      case "download-pdf":
        if (latest) {
          await downloadPayslipPdf(latest.year, latest.month);
        }
        break;
      case "historico":
        setHistoryOpen(true);
        break;
      case "comparativo":
        setComparativoOpen(true);
        break;
      case "informe-rendimentos":
        setInformeOpen(true);
        break;
      case "fgts":
        setConsultaKind("fgts");
        break;
      case "descontos":
        setConsultaKind("descontos");
        break;
      case "duvidas-rubricas":
        setConsultaKind("rubricas");
        break;
      case "comprovante":
      case "segunda-via":
      case "carta-consignacao":
        requestMutation.mutate(
          { serviceId: service.id, competence: summaryQuery.data?.latestCompetence },
          {
            onSuccess: (result) => setRequestMessage(result.message),
          },
        );
        break;
      default:
        break;
    }
  };

  return (
    <main className={sectionMainClass("rh")}>
      <RhPageHead
        title="Contracheque"
        current="Contracheque"
        description="Consulte holerites, baixe comprovantes, emita informes de rendimentos e acompanhe sua remuneração com segurança."
        syncMeta={syncMetaLabel}
        toolbar={
          <div className="pay-toolbar">
            <div className="pay-toolbar__filters page-filters" role="group" aria-label="Filtros">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={`filter-chip${category === filter.id ? " is-active" : ""}`}
                  data-filter={filter.id}
                  onClick={() => setCategory(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="pay-toolbar__actions">
              <button
                type="button"
                className={`pay-toggle-values${showValues ? " is-active" : ""}`}
                aria-pressed={showValues}
                onClick={toggleShowValues}
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
                  placeholder="Buscar serviços de contracheque..."
                  aria-label="Buscar serviços de contracheque"
                />
              </label>
            </div>
          </div>
        }
      />

      <div className="welcome-banner">
        <div className="welcome-banner__icon" aria-hidden="true">
          <i className="fa-solid fa-file-invoice-dollar" />
        </div>
        <div>
          <div className="welcome-banner__title">Folha de pagamento digital</div>
          <p className="welcome-banner__text">
            Seus contracheques ficam disponíveis até o 5º dia útil após o fechamento da folha.
            Documentos são confidenciais e acessíveis apenas com sua autenticação.
          </p>
        </div>
      </div>

      {summaryData?.userMessage ? (
        <div className="pay-alert" role="alert">
          {summaryData.userMessage}
        </div>
      ) : null}

      <div className="pay-stats" aria-label="Resumo de contracheque">
        <div className="pay-stat">
          <div className="pay-stat__value">
            {summaryQuery.isLoading ? "…" : (summaryQuery.data?.latestCompetence ?? "—")}
          </div>
          <div className="pay-stat__label">Último contracheque disponível</div>
        </div>
        <div className="pay-stat">
          <div className="pay-stat__value">
            {summaryQuery.isLoading
              ? "…"
              : formatMoney(summaryQuery.data?.latestNetAmount ?? 0, showValues)}
          </div>
          <div className="pay-stat__label">Valor líquido do último pagamento</div>
        </div>
        <div className="pay-stat">
          <div className="pay-stat__value">
            {summaryQuery.isLoading ? "…" : (summaryQuery.data?.historyCount ?? 0)}
          </div>
          <div className="pay-stat__label">Holerites no histórico</div>
        </div>
      </div>

      {servicesQuery.isError ? (
        <div className="pay-empty">
          <p>Não foi possível carregar os serviços. Verifique se o backend está em execução.</p>
        </div>
      ) : (
        <div className="pay-grid" aria-label="Serviços de contracheque">
          {servicesQuery.isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <article key={index} className="pay-card" aria-hidden="true">
                  <p className="pay-status">Carregando…</p>
                </article>
              ))
            : filtered.map((service) => (
                <ContrachequeServiceCard
                  key={service.id}
                  service={service}
                  bookmarkSaved={isSaved(bookmarkIdForService(service.id))}
                  onPrimaryAction={handlePrimaryAction}
                  onHelp={setHelpService}
                  onBookmark={(item) => toggleBookmark(bookmarkIdForService(item.id))}
                />
              ))}
        </div>
      )}

      <p className="page-empty-note">
        Exibindo {filtered.length} serviço{filtered.length === 1 ? "" : "s"}
      </p>

      <PayslipViewerModal
        open={viewer !== null}
        title={viewer?.title ?? "Contracheque"}
        year={viewer?.year ?? null}
        month={viewer?.month ?? null}
        showValues={showValues}
        onToggleShowValues={toggleShowValues}
        onClose={() => setViewer(null)}
      />

      <PayslipHistoryModal
        open={historyOpen}
        showValues={showValues}
        onToggleShowValues={toggleShowValues}
        onClose={() => setHistoryOpen(false)}
        onSelect={(year, month) => {
          setHistoryOpen(false);
          setViewer({ year, month, title: "Visualizar contracheque" });
        }}
      />

      <PayslipComparativoModal
        open={comparativoOpen}
        fromYear={previous?.year ?? null}
        fromMonth={previous?.month ?? null}
        toYear={latest?.year ?? null}
        toMonth={latest?.month ?? null}
        showValues={showValues}
        onToggleShowValues={toggleShowValues}
        onClose={() => setComparativoOpen(false)}
      />

      <PayslipConsultaModal
        open={consultaKind !== null}
        kind={consultaKind}
        showValues={showValues}
        onToggleShowValues={toggleShowValues}
        onClose={() => setConsultaKind(null)}
      />

      <PayslipInformeModal
        open={informeOpen}
        year={INFORME_IR_YEAR}
        showValues={showValues}
        onToggleShowValues={toggleShowValues}
        onClose={() => setInformeOpen(false)}
      />

      <PayslipHelpModal
        open={helpService !== null}
        service={helpService}
        onClose={() => setHelpService(null)}
      />

      <PayslipRequestResultModal
        open={requestMessage !== null}
        message={requestMessage ?? ""}
        onClose={() => setRequestMessage(null)}
      />
    </main>
  );
}
