import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import {
  useAssignBenefitFromCatalog,
  useBenefitBulkPreview,
  useBenefitCatalogList,
  useBenefitManagementList,
  useBenefitsBootstrap,
  useBulkAssignBenefits,
  useBulkSetActiveBenefits,
  useCreateBenefitCatalogItem,
  useDeleteBenefitCatalogItem,
  useDeleteEmployeeBenefit,
  useUpdateBenefitCatalogItem,
  useUpdateEmployeeBenefit,
} from "../../api/hooks/useBenefitsManagement";
import { useBenefitsSettings } from "../../api/hooks/useBenefitsSettings";
import { useMe } from "../../api/hooks/useMe";
import type {
  BenefitCatalogItemDto,
  BenefitManagementListItemDto,
  BulkBenefitOperationResultDto,
  BulkBenefitTargetRequest,
  PersonSummaryDto,
} from "../../api/types";
import { BENEFIT_CATEGORIES, canManageBeneficios } from "../../config/beneficios/settings";
import { usePortalConfirm, type PortalConfirmOptions } from "../../hooks/usePortalConfirm";
import { PersonTypeahead } from "../pessoas/RamaisTypeaheads";
import { RhPageHead } from "../servicos/RhPageHead";
import { sectionMainClass } from "../layout/SectionPageHead";
import {
  BenefitCatalogFormModal,
  emptyBenefitCatalogForm,
  formFromCatalogDto,
} from "./BenefitCatalogFormModal";
import { BulkBenefitPreviewPanel } from "./BulkBenefitPreviewPanel";
import { BenefitEmployeeFormModal } from "./BenefitEmployeeFormModal";
import { DepartmentMultiSelect } from "./DepartmentMultiSelect";
import { PeopleMultiSelect } from "./PeopleMultiSelect";
import "../../styles/contracheque-page.css";
import "../../styles/list-page.css";
import "../../styles/ramais-page.css";
import "../../styles/beneficios-gestao-page.css";
type GestaoTab = "catalogo" | "atribuicoes";
type BulkMode = "assign" | "deactivate" | "activate";
type AssignMode = "individual" | "bulk";
function parseTab(value: string | null): GestaoTab {
  return value === "atribuicoes" ? "atribuicoes" : "catalogo";
}
function categoryLabel(id: string): string {
  return BENEFIT_CATEGORIES.find((cat) => cat.id === id)?.label ?? id;
}
function categoryBadgeClass(id: string): string {
  const known = ["saude", "alimentacao", "mobilidade", "qualidade", "familia"];
  return known.includes(id) ? `beneficios-gestao__badge--${id}` : "beneficios-gestao__badge--qualidade";
}
export function BeneficiosGestaoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));
  const meQuery = useMe();
  const settingsQuery = useBenefitsSettings();
  const bootstrap = useBenefitsBootstrap();
  const canManage =
    (bootstrap.data?.canManage ?? false) ||
    (!settingsQuery.isError && canManageBeneficios(meQuery.data, settingsQuery.data));
  const catalogQuery = useBenefitCatalogList({ includeInactive: false });
  const { ask, confirmModal } = usePortalConfirm();
  const setTab = (next: GestaoTab) => {
    setSearchParams(next === "catalogo" ? {} : { tab: next });
  };
  if (bootstrap.isLoading || meQuery.isLoading) {
    return (
      <main className={sectionMainClass("rh")}>
        <RhPageHead title="Gestão de benefícios" current="Gestão de benefícios" description="Carregando..." />
      </main>
    );
  }
  if (!canManage) {
    return (
      <main className={sectionMainClass("rh")}>
        <RhPageHead
          title="Gestão de benefícios"
          current="Gestão de benefícios"
          description="Cadastro de catálogo, atribuições individuais e operações em massa."
        />
        <section className="beneficios-gestao__denied" role="alert">
          <h2>Acesso restrito</h2>
          <p>Somente perfis autorizados ou e-mails na whitelist podem gerir benefícios.</p>
          <p className="beneficios-gestao__denied-hint">
            Configure em <Link to="/admin/configuracoes-backend">Backend Config → Benefícios RH</Link>.
          </p>
        </section>
      </main>
    );
  }
  return (
    <main className={sectionMainClass("rh")}>
      <RhPageHead
        title="Gestão de benefícios"
        current="Gestão de benefícios"
        description="Gerencie o catálogo global e atribua benefícios a colaboradores individualmente ou em massa."
        actions={
          <Link className="beneficios-gestao-btn beneficios-gestao-btn--ghost" to="/servicos/beneficios">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            Meus benefícios
          </Link>
        }
        toolbar={
          <div className="beneficios-gestao__tabs" role="tablist" aria-label="Seções de gestão">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "catalogo"}
              className={`filter-chip${tab === "catalogo" ? " is-active" : ""}`}
              onClick={() => setTab("catalogo")}
            >
              <i className="fa-solid fa-list" aria-hidden="true" /> Catálogo
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "atribuicoes"}
              className={`filter-chip${tab === "atribuicoes" ? " is-active" : ""}`}
              onClick={() => setTab("atribuicoes")}
            >
              <i className="fa-solid fa-user-plus" aria-hidden="true" /> Atribuições
            </button>
          </div>
        }
      />
      {tab === "catalogo" ? (
        <BenefitCatalogSection catalogCount={bootstrap.data?.catalogCount} ask={ask} />
      ) : (
        <BenefitAssignmentsSection
          departments={bootstrap.data?.departments ?? []}
          catalog={catalogQuery.data ?? []}
          ask={ask}
        />
      )}
      {confirmModal}
    </main>
  );
}
function BenefitCatalogSection({
  catalogCount,
  ask,
}: {
  catalogCount?: number;
  ask: (options: PortalConfirmOptions) => Promise<boolean>;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<BenefitCatalogItemDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const list = useBenefitCatalogList({ q: query, category, includeInactive });
  const createMutation = useCreateBenefitCatalogItem();
  const updateMutation = useUpdateBenefitCatalogItem();
  const deleteMutation = useDeleteBenefitCatalogItem();
  const items = list.data ?? [];
  const openCreate = () => {
    setEditing(null);
    setFormError(null);
    setEditorOpen(true);
  };
  const openEdit = (item: BenefitCatalogItemDto) => {
    setEditing(item);
    setFormError(null);
    setEditorOpen(true);
  };
  const handleSubmit = async (form: ReturnType<typeof emptyBenefitCatalogForm>) => {
    setFormError(null);
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, body: form });
        setFeedback("Benefício atualizado no catálogo.");
      } else {
        await createMutation.mutateAsync(form);
        setFeedback("Benefício criado no catálogo.");
      }
      setEditorOpen(false);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Não foi possível salvar.");
    }
  };
  const handleDelete = async (item: BenefitCatalogItemDto) => {
    const confirmed = await ask({
      title: "Desativar benefício do catálogo?",
      message: `O benefício "${item.title}" será marcado como inativo e deixará de aparecer para novas atribuições. Vínculos já existentes não são alterados.`,
      confirmLabel: "Desativar",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      setFeedback("Benefício desativado no catálogo.");
    } catch {
      setFeedback("Não foi possível desativar este item.");
    }
  };
  return (
    <section className="beneficios-gestao__panel" aria-label="Catálogo de benefícios">
      <div className="beneficios-gestao__intro">
        <div className="beneficios-gestao__intro-icon" aria-hidden="true">
          <i className="fa-solid fa-gift" />
        </div>
        <div>
          <div className="beneficios-gestao__intro-title">Catálogo global</div>
          <p className="beneficios-gestao__intro-text">
            {list.isLoading
              ? "Carregando itens…"
              : `${items.length} exibidos · ${catalogCount ?? items.length} no catálogo`}
            {" · "}Alterações no catálogo não propagam automaticamente para vínculos existentes.
          </p>
        </div>
      </div>
      <div className="beneficios-gestao__toolbar">
        <label className="pay-search page-search beneficios-gestao__search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar no catálogo..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Buscar no catálogo"
          />
        </label>
        <label className="beneficios-gestao__select">
          <span className="sr-only">Categoria</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">Todas categorias</option>
            {BENEFIT_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </label>
        <div className="beneficios-gestao__toolbar-end">
          <label className="beneficios-gestao__check">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(event) => setIncludeInactive(event.target.checked)}
            />
            Incluir inativos
          </label>
          <button type="button" className="beneficios-gestao-btn beneficios-gestao-btn--primary" onClick={openCreate}>
            <i className="fa-solid fa-plus" aria-hidden="true" />
            Novo benefício
          </button>
        </div>
      </div>
      {feedback ? (
        <p className="beneficios-gestao__feedback" role="status">
          {feedback}
        </p>
      ) : null}
      {list.isError ? (
        <div className="beneficios-gestao__empty">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          <p>Não foi possível carregar o catálogo.</p>
        </div>
      ) : items.length === 0 && !list.isLoading ? (
        <div className="beneficios-gestao__empty">
          <i className="fa-regular fa-gift" aria-hidden="true" />
          <p>Nenhum benefício encontrado para os filtros informados.</p>
        </div>
      ) : (
        <div className="beneficios-gestao__table-wrap">
          <table className="beneficios-gestao__table beneficios-gestao__table--catalog">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Fornecedor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className={item.isActive ? "" : "is-inactive"}>
                  <td>
                    <strong>{item.title}</strong>
                    {item.featured ? (
                      <span className="beneficios-gestao__badge beneficios-gestao__badge--featured">
                        Destaque
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <span className={`beneficios-gestao__badge ${categoryBadgeClass(item.category)}`}>
                      {categoryLabel(item.category)}
                    </span>
                  </td>
                  <td>{item.provider || "—"}</td>
                  <td>
                    <span
                      className={`beneficios-gestao__badge ${
                        item.isActive ? "beneficios-gestao__badge--active" : "beneficios-gestao__badge--inactive"
                      }`}
                    >
                      {item.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td>
                    <div className="beneficios-gestao__table-actions">
                      <button
                        type="button"
                        className="beneficios-gestao-btn beneficios-gestao-btn--ghost beneficios-gestao-btn--sm"
                        onClick={() => openEdit(item)}
                      >
                        Editar
                      </button>
                      {item.isActive ? (
                        <button
                          type="button"
                          className="beneficios-gestao-btn beneficios-gestao-btn--danger beneficios-gestao-btn--sm"
                          onClick={() => void handleDelete(item)}
                        >
                          Desativar
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <BenefitCatalogFormModal
        open={editorOpen}
        initial={editing ? formFromCatalogDto(editing) : emptyBenefitCatalogForm()}
        isEdit={Boolean(editing)}
        saving={createMutation.isPending || updateMutation.isPending}
        error={formError}
        onClose={() => setEditorOpen(false)}
        onSubmit={(form) => void handleSubmit(form)}
      />
    </section>
  );
}
function BenefitAssignmentsSection({
  departments,
  catalog,
  ask,
}: {
  departments: { id: string; name: string; count: number }[];
  catalog: BenefitCatalogItemDto[];
  ask: (options: PortalConfirmOptions) => Promise<boolean>;
}) {
  const [assignMode, setAssignMode] = useState<AssignMode>("individual");
  const [bulkMode, setBulkMode] = useState<BulkMode>("assign");
  const [personQuery, setPersonQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<PersonSummaryDto | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [catalogKey, setCatalogKey] = useState("");
  const [onDuplicate, setOnDuplicate] = useState("skip");
  const [monthlyOverride, setMonthlyOverride] = useState("");
  const [selectedPeople, setSelectedPeople] = useState<PersonSummaryDto[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [result, setResult] = useState<BulkBenefitOperationResultDto | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [employeeFormError, setEmployeeFormError] = useState<string | null>(null);
  const managementList = useBenefitManagementList({
    personId: selectedPerson?.id,
    departmentId: departmentFilter,
    includeInactive: false,
  });
  const assignMutation = useAssignBenefitFromCatalog();
  const bulkAssignMutation = useBulkAssignBenefits();
  const bulkSetActiveMutation = useBulkSetActiveBenefits();
  const deleteMutation = useDeleteEmployeeBenefit();
  const updateEmployeeMutation = useUpdateEmployeeBenefit();
  const target: BulkBenefitTargetRequest = useMemo(
    () => ({
      personIds: selectedPeople.map((person) => person.id),
      departmentIds: selectedDepartments,
      excludePersonIds: [],
    }),
    [selectedPeople, selectedDepartments],
  );
  const hasTarget = (target.personIds?.length ?? 0) > 0 || (target.departmentIds?.length ?? 0) > 0;
  const previewOperation =
    bulkMode === "assign" ? "assign" : bulkMode === "deactivate" ? "deactivate" : "activate";
  const preview = useBenefitBulkPreview({
    operation: previewOperation,
    catalogKey: catalogKey || undefined,
    onDuplicate,
    target,
    enabled: assignMode === "bulk" && hasTarget,
  });
  const links = managementList.data ?? [];
  const handleIndividualAssign = async () => {
    if (!selectedPerson || !catalogKey) return;
    try {
      await assignMutation.mutateAsync({
        personId: selectedPerson.id,
        catalogKey,
        overrides: monthlyOverride ? { monthlyValue: Number(monthlyOverride) } : null,
      });
      setFeedback("Benefício atribuído ao colaborador.");
    } catch {
      setFeedback("Falha ao atribuir benefício.");
    }
  };
  const handleBulk = async () => {
    if (!hasTarget) return;
    const bulkMessage =
      bulkMode === "assign"
        ? "Os benefícios serão atribuídos às pessoas e departamentos selecionados conforme o preview."
        : bulkMode === "deactivate"
          ? "Os vínculos aplicáveis serão desativados para os alvos selecionados."
          : "Os vínculos existentes serão reativados para os alvos selecionados.";
    const confirmed = await ask({
      title: "Confirmar operação em massa?",
      message: bulkMessage,
      confirmLabel: "Executar",
      variant: "warning",
    });
    if (!confirmed) return;
    try {
      if (bulkMode === "assign") {
        if (!catalogKey) return;
        const response = await bulkAssignMutation.mutateAsync({
          target,
          catalogKey,
          onDuplicate,
          overrides: monthlyOverride ? { monthlyValue: Number(monthlyOverride) } : null,
        });
        setResult(response);
      } else {
        const response = await bulkSetActiveMutation.mutateAsync({
          target,
          catalogKey: catalogKey || null,
          isActive: bulkMode === "activate",
        });
        setResult(response);
      }
      setFeedback("Operação em massa concluída.");
    } catch {
      setFeedback("Falha na operação em massa.");
    }
  };
  const handleEmployeeSubmit = async (body: Parameters<typeof updateEmployeeMutation.mutateAsync>[0]["body"]) => {
    if (!editingLinkId) return;
    setEmployeeFormError(null);
    try {
      await updateEmployeeMutation.mutateAsync({ id: editingLinkId, body });
      setEditingLinkId(null);
      setFeedback("Vínculo atualizado com as especificidades do colaborador.");
    } catch (error) {
      setEmployeeFormError(error instanceof ApiError ? error.message : "Não foi possível salvar o vínculo.");
    }
  };

  const handleDeactivateRow = async (item: BenefitManagementListItemDto) => {
    const confirmed = await ask({
      title: "Desativar vínculo?",
      message: (
        <>
          Desativar <strong>{item.title}</strong> de <strong>{item.personName}</strong>? O colaborador deixará de
          ver este benefício na página Meus benefícios.
        </>
      ),
      confirmLabel: "Desativar",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      setFeedback("Vínculo desativado.");
    } catch {
      setFeedback("Não foi possível desativar.");
    }
  };
  return (
    <section className="beneficios-gestao__panel" aria-label="Atribuições de benefícios">
      <div className="beneficios-gestao__intro">
        <div className="beneficios-gestao__intro-icon" aria-hidden="true">
          <i className="fa-solid fa-user-plus" />
        </div>
        <div>
          <div className="beneficios-gestao__intro-title">Atribuições e vínculos</div>
          <p className="beneficios-gestao__intro-text">
            Atribua benefícios do catálogo a colaboradores individualmente ou em massa por pessoas e departamentos.
          </p>
        </div>
      </div>
      <div className="beneficios-gestao__subtabs" role="tablist" aria-label="Modo de atribuição">
        <button
          type="button"
          role="tab"
          aria-selected={assignMode === "individual"}
          className={`filter-chip${assignMode === "individual" ? " is-active" : ""}`}
          onClick={() => setAssignMode("individual")}
        >
          Individual
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={assignMode === "bulk"}
          className={`filter-chip${assignMode === "bulk" ? " is-active" : ""}`}
          onClick={() => setAssignMode("bulk")}
        >
          Em massa
        </button>
      </div>
      <div className="beneficios-gestao__form-card">
        <h3 className="beneficios-gestao__form-card-title">
          {assignMode === "individual" ? "Atribuição individual" : "Operação em massa"}
        </h3>
        <label className="beneficios-gestao__field beneficios-gestao__field--full">
          Benefício do catálogo
          <select value={catalogKey} onChange={(event) => setCatalogKey(event.target.value)}>
            <option value="">Selecione um benefício...</option>
            {catalog.map((item) => (
              <option key={item.id} value={item.catalogKey}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        {assignMode === "individual" ? (
          <div className="beneficios-gestao__individual">
            <PersonTypeahead
              label="Colaborador"
              value={personQuery}
              onChange={setPersonQuery}
              placeholder="Buscar por nome..."
              onSelectPerson={(person) => {
                setSelectedPerson(person);
                setPersonQuery(person.name);
              }}
            />
            {selectedPerson ? (
              <div className="beneficios-gestao__selected-person">
                <i className="fa-solid fa-user-check" aria-hidden="true" />
                <span>
                  Selecionado: <strong>{selectedPerson.name}</strong>
                </span>
              </div>
            ) : null}
            <div className="beneficios-gestao__form-grid">
              <label className="beneficios-gestao__field">
                Valor mensal (opcional)
                <input
                  type="number"
                  step="0.01"
                  placeholder="Usar padrão do catálogo"
                  value={monthlyOverride}
                  onChange={(e) => setMonthlyOverride(e.target.value)}
                />
              </label>
            </div>
            <div className="beneficios-gestao__form-actions">
              <button
                type="button"
                className="beneficios-gestao-btn beneficios-gestao-btn--primary"
                disabled={!selectedPerson || !catalogKey || assignMutation.isPending}
                onClick={() => void handleIndividualAssign()}
              >
                <i className="fa-solid fa-check" aria-hidden="true" />
                {assignMutation.isPending ? "Atribuindo…" : "Atribuir benefício"}
              </button>
            </div>
          </div>
        ) : (
          <div className="beneficios-gestao__bulk">
            <div className="beneficios-gestao__subtabs">
              <button
                type="button"
                className={`filter-chip${bulkMode === "assign" ? " is-active" : ""}`}
                onClick={() => setBulkMode("assign")}
              >
                Atribuir
              </button>
              <button
                type="button"
                className={`filter-chip${bulkMode === "deactivate" ? " is-active" : ""}`}
                onClick={() => setBulkMode("deactivate")}
              >
                Desativar
              </button>
              <button
                type="button"
                className={`filter-chip${bulkMode === "activate" ? " is-active" : ""}`}
                onClick={() => setBulkMode("activate")}
              >
                Reativar
              </button>
            </div>
            <PeopleMultiSelect label="Pessoas" selected={selectedPeople} onChange={setSelectedPeople} />
            <DepartmentMultiSelect
              label="Departamentos"
              departments={departments}
              selectedIds={selectedDepartments}
              onChange={setSelectedDepartments}
            />
            {bulkMode === "assign" ? (
              <label className="beneficios-gestao__field">
                Se já possuir o benefício
                <select value={onDuplicate} onChange={(event) => setOnDuplicate(event.target.value)}>
                  <option value="skip">Pular existentes</option>
                  <option value="update">Atualizar existentes</option>
                </select>
              </label>
            ) : null}
            <BulkBenefitPreviewPanel
              preview={preview.data}
              isLoading={preview.isFetching}
              operationLabel={
                bulkMode === "assign"
                  ? "Preview — atribuição"
                  : bulkMode === "deactivate"
                    ? "Preview — desativar"
                    : "Preview — reativar"
              }
            />
            <div className="beneficios-gestao__form-actions">
              <button
                type="button"
                className="beneficios-gestao-btn beneficios-gestao-btn--primary"
                disabled={
                  !hasTarget ||
                  (bulkMode === "assign" && !catalogKey) ||
                  bulkAssignMutation.isPending ||
                  bulkSetActiveMutation.isPending
                }
                onClick={() => void handleBulk()}
              >
                <i className="fa-solid fa-bolt" aria-hidden="true" />
                Executar operação
              </button>
            </div>
          </div>
        )}
      </div>
      {feedback ? (
        <p className="beneficios-gestao__feedback" role="status">
          {feedback}
        </p>
      ) : null}
      {result ? (
        <p className="beneficios-gestao__feedback" role="status">
          Resultado: {result.created} criados · {result.updated} atualizados · {result.skipped} ignorados ·{" "}
          {result.failed} falhas.
        </p>
      ) : null}
      <div className="beneficios-gestao__list-header">
        <h3>Vínculos ativos</h3>
        <label className="beneficios-gestao__select">
          <span className="sr-only">Filtrar departamento</span>
          <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
            <option value="all">Todos departamentos</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name} ({dept.count})
              </option>
            ))}
          </select>
        </label>
      </div>
      {managementList.isLoading ? (
        <p className="beneficios-gestao__field-hint">Carregando vínculos…</p>
      ) : links.length === 0 ? (
        <div className="beneficios-gestao__empty">
          <i className="fa-regular fa-address-card" aria-hidden="true" />
          <p>Nenhum vínculo encontrado para os filtros selecionados.</p>
        </div>
      ) : (
        <div className="beneficios-gestao__table-wrap">
          <table className="beneficios-gestao__table">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Departamento</th>
                <th>Benefício</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {links.map((item) => (
                <tr key={item.id}>
                  <td>{item.personName}</td>
                  <td>{item.departmentName ?? "—"}</td>
                  <td>{item.title}</td>
                  <td>{item.monthlyValue != null ? `R$ ${item.monthlyValue}` : "—"}</td>
                  <td>
                    <span
                      className={`beneficios-gestao__badge ${
                        item.isActive ? "beneficios-gestao__badge--active" : "beneficios-gestao__badge--inactive"
                      }`}
                    >
                      {item.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td>
                    <div className="beneficios-gestao__table-actions">
                      <button
                        type="button"
                        className="beneficios-gestao-btn beneficios-gestao-btn--ghost beneficios-gestao-btn--sm"
                        onClick={() => {
                          setEmployeeFormError(null);
                          setEditingLinkId(item.id);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="beneficios-gestao-btn beneficios-gestao-btn--danger beneficios-gestao-btn--sm"
                        onClick={() => void handleDeactivateRow(item)}
                      >
                        Desativar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <BenefitEmployeeFormModal
        open={Boolean(editingLinkId)}
        linkId={editingLinkId}
        saving={updateEmployeeMutation.isPending}
        error={employeeFormError}
        onClose={() => setEditingLinkId(null)}
        onSubmit={(form) => void handleEmployeeSubmit(form)}
      />
    </section>
  );
}
