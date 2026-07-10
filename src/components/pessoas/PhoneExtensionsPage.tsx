import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useCreatePhoneExtension,
  useDeletePhoneExtension,
  usePhoneExtensions,
  usePhoneExtensionsBootstrap,
  useUpdatePhoneExtension,
} from "../../api/hooks/usePhoneExtensions";
import { useOrgChartDepartments } from "../../api/hooks/useOrgChartGovernance";
import { useRamaisSettings } from "../../api/hooks/useRamaisSettings";
import { useMe } from "../../api/hooks/useMe";
import type { PhoneExtensionDto } from "../../api/types";
import { canManageRamais } from "../../config/ramais/settings";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import {
  emptyPhoneExtensionForm,
  formFromDto,
  formToRequest,
  PhoneExtensionFormModal,
  type PhoneExtensionFormState,
} from "./PhoneExtensionFormModal";
import "../../styles/ramais-page.css";

export function PhoneExtensionsPage() {
  const { data: me } = useMe();
  const { data: settings, isError: settingsError } = useRamaisSettings();
  const bootstrap = usePhoneExtensionsBootstrap();
  const orgDepartments = useOrgChartDepartments();

  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<PhoneExtensionDto | null>(null);
  const [formInitial, setFormInitial] = useState(emptyPhoneExtensionForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const list = usePhoneExtensions({
    q: query,
    department: department || undefined,
    includeInactive,
  });

  const createMutation = useCreatePhoneExtension();
  const updateMutation = useUpdatePhoneExtension();
  const deleteMutation = useDeletePhoneExtension();

  const canManage =
    (bootstrap.data?.canManage ?? false) || (!settingsError && canManageRamais(me, settings));

  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    for (const dept of bootstrap.data?.departments ?? []) {
      if (dept.trim()) set.add(dept.trim());
    }
    for (const dept of orgDepartments.data ?? []) {
      if (dept.name?.trim()) set.add(dept.name.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [bootstrap.data?.departments, orgDepartments.data]);

  const items = list.data ?? [];
  const total = bootstrap.data?.total ?? items.length;
  const saving = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setEditing(null);
    setFormInitial(emptyPhoneExtensionForm());
    setFormError(null);
    setEditorOpen(true);
  };

  const openEdit = (item: PhoneExtensionDto) => {
    setEditing(item);
    setFormInitial(formFromDto(item));
    setFormError(null);
    setEditorOpen(true);
  };

  const handleSubmit = async (form: PhoneExtensionFormState) => {
    setFormError(null);
    const body = formToRequest(form);
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, body });
        setFeedback("Ramal atualizado.");
      } else {
        await createMutation.mutateAsync(body);
        setFeedback("Ramal criado.");
      }
      setEditorOpen(false);
    } catch {
      setFormError("Não foi possível salvar o ramal. Verifique os campos e permissões.");
    }
  };

  const handleDelete = async (item: PhoneExtensionDto) => {
    const confirmed = window.confirm(`Excluir o ramal ${item.extension} de ${item.name}?`);
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      setFeedback("Ramal excluído.");
    } catch {
      setFeedback("Não foi possível excluir este ramal.");
    }
  };

  return (
    <main className={sectionMainClass("pessoas")}>
      <SectionPageHead
        section="pessoas"
        title="Lista de Ramais"
        current="Lista de Ramais"
        description="Consulte ramais por nome, departamento ou número. RH e e-mails autorizados podem gerir o cadastro."
        actions={
          canManage ? (
            <button type="button" className="ramais-btn ramais-btn--primary" onClick={openCreate}>
              <i className="fa-solid fa-plus" aria-hidden="true" />
              Novo ramal
            </button>
          ) : null
        }
        toolbar={
          <div className="page-toolbar" aria-label="Filtros de ramais">
            <label className="page-search page-search--wide">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                className="page-search__input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pesquisar nome, ramal, cargo…"
                aria-label="Pesquisar ramais"
              />
            </label>
            <div className="page-toolbar__filters">
              <label className="ramais-page__select">
                <span className="sr-only">Departamento</span>
                <select value={department} onChange={(event) => setDepartment(event.target.value)}>
                  <option value="">Todos os departamentos</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </label>
              {canManage ? (
                <label className="ramais-page__check">
                  <input
                    type="checkbox"
                    checked={includeInactive}
                    onChange={(event) => setIncludeInactive(event.target.checked)}
                  />
                  Incluir inativos
                </label>
              ) : null}
            </div>
          </div>
        }
      />

      <div className="welcome-banner welcome-banner--ramais">
        <div className="welcome-banner__icon" aria-hidden="true">
          <i className="fa-solid fa-phone" />
        </div>
        <div>
          <div className="welcome-banner__title">Diretório de ramais</div>
          <p className="welcome-banner__text">
            {list.isLoading ? "Carregando…" : `${items.length} exibidos · ${total} ativos no total`}
          </p>
        </div>
      </div>

      {feedback ? (
        <p className="ramais-page__feedback" role="status">
          {feedback}
        </p>
      ) : null}

      {list.isError ? (
        <div className="ramais-page__empty">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          <p>Não foi possível carregar a lista de ramais.</p>
        </div>
      ) : items.length === 0 && !list.isLoading ? (
        <div className="ramais-page__empty">
          <i className="fa-regular fa-address-book" aria-hidden="true" />
          <p>Nenhum ramal encontrado para os filtros informados.</p>
        </div>
      ) : (
        <section className="ramais-page__grid" aria-label="Lista de ramais">
          {items.map((item) => (
            <article key={item.id} className={`ramais-card${item.isActive ? "" : " ramais-card--inactive"}`}>
              <header className="ramais-card__head">
                <div>
                  <h3 className="ramais-card__name">
                    {item.personSlug ? (
                      <Link to={`/pessoas/perfil?slug=${encodeURIComponent(item.personSlug)}`}>
                        {item.name}
                      </Link>
                    ) : (
                      item.name
                    )}
                  </h3>
                  <p className="ramais-card__meta">
                    {[item.title, item.department].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="ramais-card__ext" title="Ramal">
                  <i className="fa-solid fa-phone" aria-hidden="true" />
                  {item.extension}
                </span>
              </header>

              <dl className="ramais-card__details">
                {item.email ? (
                  <>
                    <dt>E-mail</dt>
                    <dd>
                      <a href={`mailto:${item.email}`}>{item.email}</a>
                    </dd>
                  </>
                ) : null}
                {item.mobile ? (
                  <>
                    <dt>Celular</dt>
                    <dd>{item.mobile}</dd>
                  </>
                ) : null}
                {item.managerName ? (
                  <>
                    <dt>Gestor</dt>
                    <dd>{item.managerName}</dd>
                  </>
                ) : null}
                {item.personSlug ? (
                  <>
                    <dt>Pessoa</dt>
                    <dd>
                      <Link to={`/pessoas/perfil?slug=${encodeURIComponent(item.personSlug)}`}>
                        {item.personName ?? item.personSlug}
                      </Link>
                    </dd>
                  </>
                ) : null}
              </dl>

              {canManage ? (
                <footer className="ramais-card__actions">
                  <button type="button" className="ramais-btn ramais-btn--ghost" onClick={() => openEdit(item)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="ramais-btn ramais-btn--danger"
                    onClick={() => void handleDelete(item)}
                    disabled={deleteMutation.isPending}
                  >
                    Excluir
                  </button>
                </footer>
              ) : null}
            </article>
          ))}
        </section>
      )}

      <PhoneExtensionFormModal
        open={editorOpen}
        title={editing ? "Editar ramal" : "Novo ramal"}
        initial={formInitial}
        departmentOptions={departmentOptions}
        saving={saving}
        error={formError}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
