import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import { RBAC_ADMIN_PERMISSIONS } from "../../config/rbac/permissions";
import {
  useCreateRbacRole,
  useCreateRbacTestUser,
  useDeleteRbacRole,
  useDeleteRbacTestUser,
  useRbacPermissions,
  useRbacRoles,
  useRbacTestUsers,
  useResetRbacTestUserPassword,
  useUpdateRbacRole,
  useUpdateRbacTestUser,
} from "../../api/hooks/useRbacAdmin";
import type {
  BusinessArea,
  PersonSummaryDto,
  RoleDto,
  TestUserDto,
  UpsertRoleRequest,
} from "../../api/types";
import { PeopleMultiSelect } from "../beneficios/PeopleMultiSelect";
import { usePortalConfirm } from "../../hooks/usePortalConfirm";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import { ContrachequeModal } from "../contracheque/ContrachequeModal";
import { AssignmentsTab } from "./rbac/AssignmentsTab";
import { RoleDetailModal } from "./rbac/RoleDetailModal";
import {
  apiErrorMessage,
  fromBusinessAreaApiValue,
  fromBusinessAreaApiValueRequired,
  toBusinessAreaApiValue,
  toBusinessAreaApiValueRequired,
} from "./rbac/rbacUi";
import "../../styles/contracheque-page.css";
import "../../styles/controle-acesso-page.css";

type ControleTab = "roles" | "assignments" | "test-users" | "permissions";

const TABS: { id: ControleTab; label: string; icon: string }[] = [
  { id: "roles", label: "Regras", icon: "fa-user-shield" },
  { id: "assignments", label: "Atribuições", icon: "fa-link" },
  { id: "test-users", label: "Usuários de teste", icon: "fa-flask" },
  { id: "permissions", label: "Catálogo de permissões", icon: "fa-list-check" },
];

const BUSINESS_AREAS: BusinessArea[] = [
  "Core",
  "RH",
  "Financeiro",
  "Contabil",
  "TI",
  "Facilities",
  "Juridico",
  "Marketing",
  "Pessoas",
  "Projetos",
  "Planejamento",
  "Plataforma",
  "Analytics",
  "Quiosque",
  "UniLio",
];

function parseTab(value: string | null): ControleTab {
  if (value === "assignments" || value === "test-users" || value === "permissions") return value;
  return "roles";
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(value),
  );
}

function businessAreaLabel(area: BusinessArea | null | undefined): string {
  if (area === null || area === undefined) return "—";
  if (typeof area === "number") {
    const label = BUSINESS_AREAS[area];
    return label !== undefined ? String(label) : String(area);
  }
  return area;
}

function scopeLabel(scope: string | number): string {
  if (typeof scope === "number") {
    return ["Self", "Team", "Department", "Global"][scope] ?? String(scope);
  }
  return scope;
}

export function ControleAcessoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));
  const { hasAnyPermission, isLoading: permissionsLoading } = usePermissions();
  const { ask, confirmModal } = usePortalConfirm();

  const setTab = (next: ControleTab) => {
    setSearchParams(next === "roles" ? {} : { tab: next });
  };

  if (permissionsLoading) {
    return (
      <main className="main">
        <p className="controle-acesso__status">Carregando permissões…</p>
      </main>
    );
  }

  if (!hasAnyPermission(RBAC_ADMIN_PERMISSIONS)) {
    return (
      <main className="main">
        <section className="controle-acesso__denied" role="alert">
          <h2>Acesso restrito</h2>
          <p>Somente perfis com permissões RBAC ou administradores podem gerir controle de acesso.</p>
          <p className="controle-acesso__denied-hint">
            Permissões necessárias: <code>rbac.roles.manage</code>,{" "}
            <code>rbac.assignments.manage</code> ou <code>rbac.test_users.manage</code>.
          </p>
          <p className="controle-acesso__denied-hint">
            <Link to="/">Voltar ao início</Link>
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className={sectionMainClass("plataforma")}>
      <SectionPageHead
        section="plataforma"
        title="Controle de acesso (RBAC)"
        current="Controle de acesso"
        description="Regras dinâmicas, atribuições por sujeito, usuários de teste e catálogo de permissões."
        actions={
          <Link className="controle-acesso-page__head-action" to="/admin/configuracoes-backend">
            <i className="fa-solid fa-server" aria-hidden="true" />
            Config. Backend
          </Link>
        }
        toolbar={
          <div className="page-toolbar">
            <div className="page-filters" role="tablist" aria-label="Seções RBAC">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  className={`filter-chip${tab === item.id ? " is-active" : ""}`}
                  onClick={() => setTab(item.id)}
                >
                  <i className={`fa-solid ${item.icon}`} aria-hidden="true" /> {item.label}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {tab === "roles" ? <RolesTab ask={ask} /> : null}
      {tab === "assignments" ? <AssignmentsTab /> : null}
      {tab === "test-users" ? <TestUsersTab ask={ask} /> : null}
      {tab === "permissions" ? <PermissionsTab /> : null}
      {confirmModal}
    </main>
  );
}

function RolesTab({
  ask,
}: {
  ask: ReturnType<typeof usePortalConfirm>["ask"];
}) {
  const rolesQuery = useRbacRoles();
  const createRole = useCreateRbacRole();
  const updateRole = useUpdateRbacRole();
  const deleteRole = useDeleteRbacRole();
  const [search, setSearch] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDto | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = rolesQuery.data ?? [];
    if (!q) return items;
    return items.filter(
      (role) =>
        role.name.toLowerCase().includes(q) ||
        role.slug.toLowerCase().includes(q) ||
        role.description.toLowerCase().includes(q),
    );
  }, [rolesQuery.data, search]);

  const openCreate = () => {
    setEditingRole(null);
    setModalOpen(true);
  };

  const openEdit = (role: RoleDto) => {
    setEditingRole(role);
    setModalOpen(true);
  };

  const handleDelete = async (role: RoleDto) => {
    if (role.isSystem) return;
    const confirmed = await ask({
      title: "Excluir regra",
      message: `Remover a regra "${role.name}"? Atribuições vinculadas também serão afetadas.`,
      confirmLabel: "Excluir",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      await deleteRole.mutateAsync(role.id);
      if (selectedRoleId === role.id) setSelectedRoleId(null);
      setFeedback(`Regra "${role.name}" removida.`);
    } catch (error) {
      setFeedback(apiErrorMessage(error));
    }
  };

  return (
    <>
      <section className="controle-acesso__panel">
        <div className="controle-acesso__intro">
          <div className="controle-acesso__intro-icon" aria-hidden="true">
            <i className="fa-solid fa-user-shield" />
          </div>
          <div>
            <div className="controle-acesso__intro-title">Regras e templates</div>
            <p className="controle-acesso__intro-text">
              Regras de sistema e templates de key user são somente leitura. Regras personalizadas podem
              ser criadas e editadas aqui.
            </p>
          </div>
        </div>

        <div className="controle-acesso__toolbar">
          <input
            className="controle-acesso__search"
            type="search"
            placeholder="Buscar regra…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Buscar regra"
          />
          <div className="controle-acesso__toolbar-end">
            <button type="button" className="controle-acesso-btn controle-acesso-btn--primary" onClick={openCreate}>
              <i className="fa-solid fa-plus" aria-hidden="true" /> Nova regra
            </button>
          </div>
        </div>

        {feedback ? <p className="controle-acesso__status">{feedback}</p> : null}
        {rolesQuery.isLoading ? <p className="controle-acesso__status">Carregando regras…</p> : null}
        {rolesQuery.isError ? (
          <p className="controle-acesso__status controle-acesso__status--error">
            Não foi possível carregar regras.
          </p>
        ) : null}

        {!rolesQuery.isLoading && filteredRoles.length === 0 ? (
          <p className="controle-acesso__empty">Nenhuma regra encontrada.</p>
        ) : (
          <div className="controle-acesso__table-wrap">
            <table className="controle-acesso__table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Área</th>
                  <th>Permissões</th>
                  <th>Flags</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role) => (
                  <tr key={role.id}>
                    <td>
                      <strong>{role.name}</strong>
                      <div className="controle-acesso__permission-key">{role.slug}</div>
                      {role.description ? (
                        <div className="controle-acesso__permission-desc">{role.description}</div>
                      ) : null}
                    </td>
                    <td>{businessAreaLabel(role.businessArea)}</td>
                    <td>{role.permissionCount}</td>
                    <td>
                      <div className="controle-acesso__role-tags">
                        {role.isSystem ? (
                          <span className="controle-acesso__badge controle-acesso__badge--system">Sistema</span>
                        ) : null}
                        {role.isKeyUserTemplate ? (
                          <span className="controle-acesso__badge controle-acesso__badge--template">Template</span>
                        ) : null}
                        {!role.isActive ? (
                          <span className="controle-acesso__badge controle-acesso__badge--inactive">Inativa</span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className="controle-acesso__actions">
                        <button
                          type="button"
                          className="controle-acesso-btn controle-acesso-btn--ghost"
                          onClick={() => setSelectedRoleId(role.id)}
                        >
                          Detalhes
                        </button>
                        {!role.isSystem && !role.isKeyUserTemplate ? (
                          <>
                            <button
                              type="button"
                              className="controle-acesso-btn controle-acesso-btn--ghost"
                              onClick={() => openEdit(role)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="controle-acesso-btn controle-acesso-btn--danger"
                              onClick={() => void handleDelete(role)}
                              disabled={deleteRole.isPending}
                            >
                              Excluir
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedRoleId ? (
        <RoleDetailModal
          roleId={selectedRoleId}
          roleName={rolesQuery.data?.find((item) => item.id === selectedRoleId)?.name}
          onClose={() => setSelectedRoleId(null)}
          onSaved={(message) => setFeedback(message)}
        />
      ) : null}

      {modalOpen ? (
        <RoleFormModal
          role={editingRole}
          pending={createRole.isPending || updateRole.isPending}
          onClose={() => setModalOpen(false)}
          onSubmit={async (body) => {
            try {
              if (editingRole) {
                await updateRole.mutateAsync({ id: editingRole.id, body });
                setFeedback(`Regra "${body.name}" atualizada.`);
              } else {
                await createRole.mutateAsync(body);
                setFeedback(`Regra "${body.name}" criada.`);
              }
              setModalOpen(false);
            } catch (error) {
              setFeedback(apiErrorMessage(error));
            }
          }}
        />
      ) : null}
    </>
  );
}

function RoleFormModal({
  role,
  pending,
  onClose,
  onSubmit,
}: {
  role: RoleDto | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (body: UpsertRoleRequest) => Promise<void>;
}) {
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [businessArea, setBusinessArea] = useState<BusinessArea | "">(
    fromBusinessAreaApiValue(role?.businessArea),
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      businessArea: toBusinessAreaApiValue(businessArea),
    });
  };

  return (
    <ContrachequeModal
      open
      title={role ? "Editar regra" : "Nova regra"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="controle-acesso-role-form"
            className="pay-modal__btn"
            disabled={pending}
          >
            {pending ? "Salvando…" : "Salvar"}
          </button>
        </>
      }
    >
      <form
        id="controle-acesso-role-form"
        className="controle-acesso__modal-form"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <div className="controle-acesso__field">
          <label htmlFor="role-name">Nome</label>
          <input
            id="role-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
        <div className="controle-acesso__field">
          <label htmlFor="role-description">Descrição</label>
          <textarea
            id="role-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div className="controle-acesso__field">
          <label htmlFor="role-area">Área de negócio</label>
          <select
            id="role-area"
            value={String(businessArea)}
            onChange={(event) => setBusinessArea(event.target.value as BusinessArea | "")}
          >
            <option value="">—</option>
            {BUSINESS_AREAS.map((area) => (
              <option key={String(area)} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      </form>
    </ContrachequeModal>
  );
}

function TestUsersTab({
  ask,
}: {
  ask: ReturnType<typeof usePortalConfirm>["ask"];
}) {
  const testUsersQuery = useRbacTestUsers();
  const createTestUser = useCreateRbacTestUser();
  const updateTestUser = useUpdateRbacTestUser();
  const deleteTestUser = useDeleteRbacTestUser();
  const resetPassword = useResetRbacTestUserPassword();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<TestUserDto | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleDelete = async (user: TestUserDto) => {
    const confirmed = await ask({
      title: "Excluir usuário de teste",
      message: `Remover "${user.displayName}" (${user.email})?`,
      confirmLabel: "Excluir",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      await deleteTestUser.mutateAsync(user.id);
      setFeedback(`Usuário "${user.displayName}" removido.`);
    } catch (error) {
      setFeedback(apiErrorMessage(error));
    }
  };

  const handleResetPassword = async (user: TestUserDto) => {
    const password = window.prompt(`Nova senha para ${user.email}:`);
    if (!password?.trim()) return;
    try {
      await resetPassword.mutateAsync({ id: user.id, body: { password } });
      setFeedback(`Senha redefinida para ${user.email}.`);
    } catch (error) {
      setFeedback(apiErrorMessage(error));
    }
  };

  return (
    <>
      <section className="controle-acesso__panel">
        <div className="controle-acesso__intro">
          <div className="controle-acesso__intro-icon" aria-hidden="true">
            <i className="fa-solid fa-flask" />
          </div>
          <div>
            <div className="controle-acesso__intro-title">Usuários de teste</div>
            <p className="controle-acesso__intro-text">
              Contas locais independentes do LDAP para validação de permissões. Opcionalmente vincule um
              colaborador do diretório; sem vínculo, o login cria automaticamente um perfil técnico para a
              sessão.
            </p>
          </div>
        </div>

        <div className="controle-acesso__toolbar">
          <div className="controle-acesso__toolbar-end">
            <button
              type="button"
              className="controle-acesso-btn controle-acesso-btn--primary"
              onClick={() => {
                setEditingUser(null);
                setModalOpen(true);
              }}
            >
              <i className="fa-solid fa-plus" aria-hidden="true" /> Novo usuário de teste
            </button>
          </div>
        </div>

        {feedback ? <p className="controle-acesso__status">{feedback}</p> : null}
        {testUsersQuery.isLoading ? <p className="controle-acesso__status">Carregando usuários…</p> : null}
        {testUsersQuery.isError ? (
          <p className="controle-acesso__status controle-acesso__status--error">
            Não foi possível carregar usuários de teste.
          </p>
        ) : null}

        {!testUsersQuery.isLoading && (testUsersQuery.data ?? []).length === 0 ? (
          <p className="controle-acesso__empty">Nenhum usuário de teste cadastrado.</p>
        ) : (
          <div className="controle-acesso__table-wrap">
            <table className="controle-acesso__table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Área</th>
                  <th>Regras</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {(testUsersQuery.data ?? []).map((user) => (
                  <tr key={user.id}>
                    <td>{user.displayName}</td>
                    <td>{user.email}</td>
                    <td>{businessAreaLabel(user.businessArea)}</td>
                    <td>
                      <div className="controle-acesso__role-tags">
                        {user.roleNames.map((roleName) => (
                          <span key={roleName} className="controle-acesso__badge">
                            {roleName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {user.isActive ? (
                        <span className="controle-acesso__badge controle-acesso__badge--scope">Ativo</span>
                      ) : (
                        <span className="controle-acesso__badge controle-acesso__badge--inactive">Inativo</span>
                      )}
                      {user.expiresAt ? (
                        <div className="controle-acesso__permission-desc">
                          Expira {formatDateTime(user.expiresAt)}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <div className="controle-acesso__actions">
                        <button
                          type="button"
                          className="controle-acesso-btn controle-acesso-btn--ghost"
                          onClick={() => {
                            setEditingUser(user);
                            setModalOpen(true);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="controle-acesso-btn controle-acesso-btn--ghost"
                          onClick={() => void handleResetPassword(user)}
                        >
                          Senha
                        </button>
                        <button
                          type="button"
                          className="controle-acesso-btn controle-acesso-btn--danger"
                          onClick={() => void handleDelete(user)}
                          disabled={deleteTestUser.isPending}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen ? (
        <TestUserFormModal
          user={editingUser}
          pending={createTestUser.isPending || updateTestUser.isPending}
          onClose={() => setModalOpen(false)}
          onSubmit={async (payload) => {
            try {
              if ("update" in payload && payload.update) {
                await updateTestUser.mutateAsync({ id: editingUser!.id, body: payload.update });
                setFeedback(`Usuário "${payload.update.displayName}" atualizado.`);
              } else if ("create" in payload && payload.create) {
                await createTestUser.mutateAsync(payload.create);
                setFeedback(`Usuário "${payload.create.displayName}" criado.`);
              }
              setModalOpen(false);
            } catch (error) {
              setFeedback(apiErrorMessage(error));
            }
          }}
        />
      ) : null}
    </>
  );
}

function TestUserFormModal({
  user,
  pending,
  onClose,
  onSubmit,
}: {
  user: TestUserDto | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    create?: import("../../api/types").CreateTestUserRequest;
    update?: import("../../api/types").UpdateTestUserRequest;
  }) => Promise<void>;
}) {
  const rolesQuery = useRbacRoles();
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [businessArea, setBusinessArea] = useState<BusinessArea>(
    fromBusinessAreaApiValueRequired(user?.businessArea),
  );
  const [templateRoleId, setTemplateRoleId] = useState("");
  const [linkedPerson, setLinkedPerson] = useState<PersonSummaryDto[]>([]);
  const [notes, setNotes] = useState(user?.notes ?? "");
  const [isActive, setIsActive] = useState(user?.isActive ?? true);

  const handleLinkedPersonChange = (people: PersonSummaryDto[]) => {
    setLinkedPerson(people.length <= 1 ? people : [people[people.length - 1]!]);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const optionalPersonId = linkedPerson[0]?.id ?? (user ? user.optionalPersonId ?? null : null);
    if (user) {
      await onSubmit({
        update: {
          displayName: displayName.trim(),
          businessArea: toBusinessAreaApiValueRequired(businessArea),
          optionalPersonId,
          isActive,
          expiresAt: user.expiresAt ?? null,
          notes: notes.trim() || null,
        },
      });
      return;
    }
    await onSubmit({
      create: {
        email: email.trim(),
        password,
        displayName: displayName.trim(),
        businessArea: toBusinessAreaApiValueRequired(businessArea),
        optionalPersonId,
        notes: notes.trim() || null,
        templateRoleId: templateRoleId || null,
      },
    });
  };

  return (
    <ContrachequeModal
      open
      title={user ? "Editar usuário de teste" : "Novo usuário de teste"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="controle-acesso-test-user-form"
            className="pay-modal__btn"
            disabled={pending}
          >
            {pending ? "Salvando…" : "Salvar"}
          </button>
        </>
      }
    >
      <form
        id="controle-acesso-test-user-form"
        className="controle-acesso__modal-form"
        onSubmit={(event) => void handleSubmit(event)}
      >
        {!user ? (
          <>
            <div className="controle-acesso__field">
              <label htmlFor="test-user-email">E-mail</label>
              <input
                id="test-user-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="controle-acesso__field">
              <label htmlFor="test-user-password">Senha</label>
              <input
                id="test-user-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          </>
        ) : null}
        <div className="controle-acesso__field">
          <label htmlFor="test-user-name">Nome de exibição</label>
          <input
            id="test-user-name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
            autoFocus={Boolean(user)}
          />
        </div>
        <div className="controle-acesso__field">
          <label htmlFor="test-user-area">Área de negócio</label>
          <select
            id="test-user-area"
            value={String(businessArea)}
            onChange={(event) => setBusinessArea(event.target.value as BusinessArea)}
          >
            {BUSINESS_AREAS.map((area) => (
              <option key={String(area)} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
        <div className="controle-acesso__field">
          <PeopleMultiSelect
            label="Colaborador vinculado (opcional)"
            selected={linkedPerson}
            onChange={handleLinkedPersonChange}
            placeholder="Buscar colaborador do diretório…"
          />
          <p className="controle-acesso__permission-desc">
            Use para simular o login como um colaborador real. Se ficar em branco, o sistema cria um perfil
            técnico automaticamente no primeiro acesso.
          </p>
          {user?.optionalPersonId && linkedPerson.length === 0 ? (
            <p className="controle-acesso__permission-desc">
              Esta conta já possui um perfil vinculado internamente. Selecione outro colaborador acima apenas se
              quiser substituir.
            </p>
          ) : null}
        </div>
        {!user ? (
          <div className="controle-acesso__field">
            <label htmlFor="test-user-template-role">Regra inicial</label>
            <select
              id="test-user-template-role"
              value={templateRoleId}
              onChange={(event) => setTemplateRoleId(event.target.value)}
            >
              <option value="">Nenhuma (atribuir depois)</option>
              {(rolesQuery.data ?? []).map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {user ? (
          <div className="controle-acesso__field">
            <label htmlFor="test-user-active">Ativo</label>
            <select
              id="test-user-active"
              value={isActive ? "true" : "false"}
              onChange={(event) => setIsActive(event.target.value === "true")}
            >
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
        ) : null}
        <div className="controle-acesso__field">
          <label htmlFor="test-user-notes">Observações</label>
          <textarea id="test-user-notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
        </div>
      </form>
    </ContrachequeModal>
  );
}

function PermissionsTab() {
  const permissionsQuery = useRbacPermissions();
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = permissionsQuery.data ?? [];
    return items.filter((item) => {
      const area = businessAreaLabel(item.businessArea);
      if (areaFilter && area !== areaFilter) return false;
      if (!q) return true;
      return (
        item.key.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.module.toLowerCase().includes(q)
      );
    });
  }, [areaFilter, permissionsQuery.data, search]);

  return (
    <section className="controle-acesso__panel">
      <div className="controle-acesso__intro">
        <div className="controle-acesso__intro-icon" aria-hidden="true">
          <i className="fa-solid fa-list-check" />
        </div>
        <div>
          <div className="controle-acesso__intro-title">Catálogo de permissões</div>
          <p className="controle-acesso__intro-text">
            Matriz completa definida no backend (<code>PermissionCatalog</code>). Somente leitura —
            alterações exigem deploy da API.
          </p>
        </div>
      </div>

      <div className="controle-acesso__readonly-note">
        <i className="fa-solid fa-lock" aria-hidden="true" />
        Visualização somente leitura
      </div>

      <div className="controle-acesso__toolbar">
        <input
          className="controle-acesso__search"
          type="search"
          placeholder="Buscar permissão…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Buscar permissão"
        />
        <select
          className="controle-acesso__select"
          value={areaFilter}
          onChange={(event) => setAreaFilter(event.target.value)}
          aria-label="Filtrar por área"
        >
          <option value="">Todas as áreas</option>
          {BUSINESS_AREAS.map((area) => (
            <option key={String(area)} value={area}>
              {area}
            </option>
          ))}
        </select>
        <span className="controle-acesso__status">
          {filtered.length} de {(permissionsQuery.data ?? []).length} permissões
        </span>
      </div>

      {permissionsQuery.isLoading ? <p className="controle-acesso__status">Carregando catálogo…</p> : null}
      {permissionsQuery.isError ? (
        <p className="controle-acesso__status controle-acesso__status--error">
          Não foi possível carregar o catálogo de permissões.
        </p>
      ) : null}

      {!permissionsQuery.isLoading && filtered.length === 0 ? (
        <p className="controle-acesso__empty">Nenhuma permissão encontrada.</p>
      ) : (
        <div className="controle-acesso__table-wrap">
          <table className="controle-acesso__table">
            <thead>
              <tr>
                <th>Chave</th>
                <th>Label</th>
                <th>Módulo</th>
                <th>Área</th>
                <th>Escopos permitidos</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.key}>
                  <td className="controle-acesso__permission-key">{item.key}</td>
                  <td>
                    <strong>{item.label}</strong>
                    <div className="controle-acesso__permission-desc">{item.description}</div>
                    {item.menuPath ? (
                      <div className="controle-acesso__permission-desc">Menu: {item.menuPath}</div>
                    ) : null}
                  </td>
                  <td>{item.module}</td>
                  <td>{businessAreaLabel(item.businessArea)}</td>
                  <td>
                    <div className="controle-acesso__role-tags">
                      {item.allowedScopes.map((scope) => (
                        <span key={`${item.key}-${scopeLabel(scope)}`} className="controle-acesso__badge controle-acesso__badge--scope">
                          {scopeLabel(scope)}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
