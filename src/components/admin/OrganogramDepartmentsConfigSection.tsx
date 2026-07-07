import { useMemo, useState } from "react";
import {
  useCreateOrgDepartment,
  useImportDepartmentsFromDirectory,
  useOrgChartDepartmentMappings,
  useOrgChartDepartments,
  useUpdateOrgDepartment,
  useUpdateOrgDepartmentMapping,
} from "../../api/hooks/useOrgChartGovernance";
import "../../styles/organogram-governance-page.css";

type Feedback = { type: "success" | "error"; message: string } | null;

const EMPTY_DEPARTMENT_FORM = {
  name: "",
  sortOrder: 0,
  isActive: true,
};

export function OrganogramDepartmentsConfigSection() {
  const departmentsQuery = useOrgChartDepartments();
  const mappingsQuery = useOrgChartDepartmentMappings();
  const importMutation = useImportDepartmentsFromDirectory();
  const createDepartment = useCreateOrgDepartment();
  const updateDepartment = useUpdateOrgDepartment();
  const updateMapping = useUpdateOrgDepartmentMapping();

  const [feedback, setFeedback] = useState<Feedback>(null);
  const [newDepartment, setNewDepartment] = useState(EMPTY_DEPARTMENT_FORM);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [editDepartmentForm, setEditDepartmentForm] = useState(EMPTY_DEPARTMENT_FORM);

  const activeDepartments = useMemo(
    () => (departmentsQuery.data ?? []).filter((department) => department.isActive),
    [departmentsQuery.data]
  );

  const handleImport = async () => {
    setFeedback(null);
    try {
      const result = await importMutation.mutateAsync({ createMissingDepartments: true });
      setFeedback({
        type: "success",
        message: `Importação concluída — ${result.mappingsImported} nomes do diretório, ${result.departmentsCreated} departamentos criados, ${result.departmentsLinked} vinculados automaticamente.`,
      });
      await Promise.all([departmentsQuery.refetch(), mappingsQuery.refetch()]);
    } catch {
      setFeedback({
        type: "error",
        message: "Não foi possível importar departamentos do diretório/AD.",
      });
    }
  };

  const handleCreateDepartment = async () => {
    const name = newDepartment.name.trim();
    if (!name) return;

    setFeedback(null);
    try {
      await createDepartment.mutateAsync({
        name,
        sortOrder: newDepartment.sortOrder,
        isActive: newDepartment.isActive,
        parentDepartmentId: null,
      });
      setNewDepartment(EMPTY_DEPARTMENT_FORM);
      setFeedback({ type: "success", message: `Departamento "${name}" criado.` });
    } catch {
      setFeedback({ type: "error", message: "Não foi possível criar o departamento." });
    }
  };

  const startEditDepartment = (id: string, name: string, sortOrder: number, isActive: boolean) => {
    setEditingDepartmentId(id);
    setEditDepartmentForm({ name, sortOrder, isActive });
  };

  const handleSaveDepartment = async () => {
    if (!editingDepartmentId) return;
    const name = editDepartmentForm.name.trim();
    if (!name) return;

    setFeedback(null);
    try {
      await updateDepartment.mutateAsync({
        id: editingDepartmentId,
        body: {
          name,
          sortOrder: editDepartmentForm.sortOrder,
          isActive: editDepartmentForm.isActive,
          parentDepartmentId: null,
        },
      });
      setEditingDepartmentId(null);
      setFeedback({ type: "success", message: "Departamento atualizado." });
    } catch {
      setFeedback({ type: "error", message: "Não foi possível atualizar o departamento." });
    }
  };

  const handleMappingChange = async (mappingId: string, orgDepartmentId: string) => {
    setFeedback(null);
    try {
      await updateMapping.mutateAsync({
        id: mappingId,
        body: {
          orgDepartmentId: orgDepartmentId || null,
          updateOrgDepartmentId: true,
        },
      });
    } catch {
      setFeedback({ type: "error", message: "Não foi possível salvar o mapeamento de/para." });
    }
  };

  const isBusy =
    importMutation.isPending ||
    createDepartment.isPending ||
    updateDepartment.isPending ||
    updateMapping.isPending;

  return (
    <div className="org-governance__panel" aria-label="Departamentos do organograma">
      <div className="org-governance__intro-head">
        <span className="org-governance__intro-icon" aria-hidden="true">
          <i className="fa-solid fa-building" />
        </span>
        <div>
          <h3 className="org-governance__intro-title">Departamentos e de/para do diretório</h3>
          <p className="org-governance__intro-text">
            Importe os nomes de departamento vindos do Microsoft Graph/AD, cadastre os departamentos
            governados do organograma e configure o mapeamento (de → para). O drawer de edição usa os
            departamentos governados nesta lista.
          </p>
        </div>
      </div>

      <div className="org-governance__toolbar">
        <button
          type="button"
          className="org-governance__btn org-governance__btn--primary"
          onClick={() => void handleImport()}
          disabled={isBusy}
        >
          {importMutation.isPending ? "Importando…" : "Importar do diretório/AD"}
        </button>
      </div>

      {feedback ? (
        <div className={`org-governance__alert org-governance__alert--${feedback.type}`} role="status">
          {feedback.message}
        </div>
      ) : null}

      <div className="org-governance__split">
        <div>
          <h4 className="org-governance__intro-title">Departamentos governados</h4>
          <p className="org-governance__intro-text" style={{ marginBottom: 12 }}>
            Nomes exibidos no organograma e no drawer de edição.
          </p>

          <div className="org-governance__inline-form">
            <input
              type="text"
              placeholder="Novo departamento"
              value={newDepartment.name}
              onChange={(event) =>
                setNewDepartment((current) => ({ ...current, name: event.target.value }))
              }
            />
            <button
              type="button"
              className="org-governance__btn org-governance__btn--primary"
              onClick={() => void handleCreateDepartment()}
              disabled={isBusy || !newDepartment.name.trim()}
            >
              Adicionar
            </button>
          </div>

          {departmentsQuery.isLoading ? (
            <p className="org-governance__empty">Carregando departamentos…</p>
          ) : !departmentsQuery.data?.length ? (
            <p className="org-governance__empty">
              Nenhum departamento cadastrado. Use &quot;Importar do diretório/AD&quot; ou adicione manualmente.
            </p>
          ) : (
            <div className="org-governance__table-wrap">
              <table className="org-governance__table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Ordem</th>
                    <th>Status</th>
                    <th aria-label="Ações" />
                  </tr>
                </thead>
                <tbody>
                  {departmentsQuery.data.map((department) => {
                    const isEditing = editingDepartmentId === department.id;
                    return (
                      <tr key={department.id}>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editDepartmentForm.name}
                              onChange={(event) =>
                                setEditDepartmentForm((current) => ({
                                  ...current,
                                  name: event.target.value,
                                }))
                              }
                            />
                          ) : (
                            department.name
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              value={editDepartmentForm.sortOrder}
                              onChange={(event) =>
                                setEditDepartmentForm((current) => ({
                                  ...current,
                                  sortOrder: Number(event.target.value) || 0,
                                }))
                              }
                              style={{ width: 72 }}
                            />
                          ) : (
                            department.sortOrder
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <label className="org-governance__checkbox">
                              <input
                                type="checkbox"
                                checked={editDepartmentForm.isActive}
                                onChange={(event) =>
                                  setEditDepartmentForm((current) => ({
                                    ...current,
                                    isActive: event.target.checked,
                                  }))
                                }
                              />
                              Ativo
                            </label>
                          ) : department.isActive ? (
                            "Ativo"
                          ) : (
                            "Inativo"
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <button
                              type="button"
                              className="org-governance__btn"
                              onClick={() => void handleSaveDepartment()}
                              disabled={isBusy}
                            >
                              Salvar
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="org-governance__btn"
                              onClick={() =>
                                startEditDepartment(
                                  department.id,
                                  department.name,
                                  department.sortOrder,
                                  department.isActive
                                )
                              }
                            >
                              Editar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside>
          <h4 className="org-governance__intro-title">Mapeamento de/para (AD → organograma)</h4>
          <p className="org-governance__intro-text" style={{ marginBottom: 12 }}>
            Cada linha é um nome vindo do diretório. Escolha o departamento governado correspondente.
          </p>

          {mappingsQuery.isLoading ? (
            <p className="org-governance__empty">Carregando mapeamentos…</p>
          ) : !mappingsQuery.data?.length ? (
            <p className="org-governance__empty">
              Nenhum departamento importado do diretório. Execute a importação acima após o sync do Graph.
            </p>
          ) : (
            <div className="org-governance__table-wrap">
              <table className="org-governance__table">
                <thead>
                  <tr>
                    <th>Nome no AD/Graph</th>
                    <th>Colaboradores</th>
                    <th>Departamento (para)</th>
                  </tr>
                </thead>
                <tbody>
                  {mappingsQuery.data.map((mapping) => (
                    <tr key={mapping.id}>
                      <td>{mapping.sourceName}</td>
                      <td>{mapping.employeeCount}</td>
                      <td>
                        <select
                          className="org-governance__select"
                          value={mapping.orgDepartmentId ?? ""}
                          onChange={(event) =>
                            void handleMappingChange(mapping.id, event.target.value)
                          }
                          disabled={isBusy}
                        >
                          <option value="">— Não mapeado —</option>
                          {activeDepartments.map((department) => (
                            <option key={department.id} value={department.id}>
                              {department.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
