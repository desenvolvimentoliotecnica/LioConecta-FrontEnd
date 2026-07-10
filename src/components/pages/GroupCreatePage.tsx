import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { canAccessGroupApprovals } from "../../api/auth";
import { useCreateGroup } from "../../api/hooks/useGroups";
import { useMe } from "../../api/hooks/useMe";
import { GROUP_TYPE_DEPARTAMENTAL, type GroupDto, type GroupType } from "../../api/types";
import {
  GROUP_ICON_OPTIONS,
  GROUP_TYPE_OPTIONS,
  groupTypeLabel,
  injectGroupCreatePageStyles,
} from "../../config/groups";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";

type ToastState = { type: "success" | "error"; message: string } | null;

function PendingSuccess({ group, canApprove }: { group: GroupDto; canApprove: boolean }) {
  return (
    <main className="main">
      <div className="welcome-banner" style={{ marginBottom: 24 }}>
        <div className="welcome-banner__icon" aria-hidden="true">
          <i className="fa-solid fa-hourglass-half" />
        </div>
        <div>
          <div className="welcome-banner__title">Grupo enviado para aprovação</div>
          <p className="welcome-banner__text">
            <strong>{group.name}</strong> foi registrado e aguarda liberação de um administrador antes de ficar
            ativo na plataforma.
          </p>
        </div>
      </div>
      <div className="form-actions">
        <Link className="btn-secondary" to="/grupos/meus-grupos">
          Ver meus grupos
        </Link>
        {canApprove ? (
          <Link className="btn-primary" to="/grupos/aprovacoes">
            <i className="fa-solid fa-user-shield" aria-hidden="true" /> Ir para aprovações
          </Link>
        ) : null}
      </div>
    </main>
  );
}

export function GroupCreatePage() {
  const { data: me } = useMe();
  const createGroup = useCreateGroup();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<GroupType>(GROUP_TYPE_DEPARTAMENTAL);
  const [icon, setIcon] = useState<string>(GROUP_ICON_OPTIONS[0]);
  const [createdGroup, setCreatedGroup] = useState<GroupDto | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const canApprove = canAccessGroupApprovals(me);
  const canSubmit = name.trim().length > 0 && !createGroup.isPending;

  useEffect(() => injectGroupCreatePageStyles(), []);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4500);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    try {
      const result = await createGroup.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        type,
        icon,
      });
      setCreatedGroup(result);
    } catch {
      showToast("error", "Não foi possível criar o grupo. Tente novamente.");
    }
  }

  if (createdGroup) {
    return <PendingSuccess group={createdGroup} canApprove={canApprove} />;
  }

  const previewName = name.trim() || "Nome do grupo";
  const previewDesc =
    description.trim() || "A descrição aparecerá aqui conforme você preenche o formulário.";

  return (
    <main className={sectionMainClass("grupos")}>
      <SectionPageHead
        section="grupos"
        title="Criar Grupo"
        current="Criar grupo"
        description="Configure um novo espaço de colaboração. Após o envio, um administrador precisa aprovar o grupo antes de ele ficar ativo."
      />

      <div className="welcome-banner">
        <div className="welcome-banner__icon" aria-hidden="true">
          <i className="fa-solid fa-circle-plus" />
        </div>
        <div>
          <div className="welcome-banner__title">Novo grupo em poucos passos</div>
          <p className="welcome-banner__text">
            Preencha as informações abaixo e envie para aprovação. Após a liberação, colegas poderão participar
            do grupo diretamente pela página Explorar grupos.
          </p>
        </div>
      </div>

      {toast ? (
        <p
          className="page-empty-note"
          style={{ color: toast.type === "error" ? "#b91c1c" : "#15803d", marginBottom: 16 }}
          role="status"
        >
          {toast.message}
        </p>
      ) : null}

      <div className="create-layout">
        <form className="create-form" onSubmit={handleSubmit}>
          <section className="form-section" aria-labelledby="section-basic">
            <h2 className="form-section__title" id="section-basic">
              Informações básicas
            </h2>
            <p className="form-section__desc">Nome e descrição que identificam o propósito do grupo.</p>
            <div className="form-field">
              <label className="form-label" htmlFor="group-name">
                Nome do grupo
              </label>
              <input
                className="form-input"
                id="group-name"
                name="name"
                type="text"
                placeholder="Ex.: Squad Mobile 2026"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="group-desc">
                Descrição <span className="form-label__hint">(opcional)</span>
              </label>
              <textarea
                className="form-textarea"
                id="group-desc"
                name="description"
                placeholder="Descreva o objetivo, público-alvo e tipo de conteúdo compartilhado no grupo."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </section>

          <section className="form-section" aria-labelledby="section-type">
            <h2 className="form-section__title" id="section-type">
              Tipo de grupo
            </h2>
            <p className="form-section__desc">Define a categoria do grupo no catálogo interno.</p>
            <div className="option-grid" role="radiogroup" aria-label="Tipo de grupo">
              {GROUP_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`option-card${type === option.value ? " is-selected" : ""}`}
                  type="button"
                  onClick={() => setType(option.value)}
                >
                  <div
                    className="option-card__icon"
                    style={{
                      background: option.iconStyle.background,
                      color: option.iconStyle.color,
                      borderColor: option.iconStyle.borderColor,
                    }}
                  >
                    <i className={`fa-solid ${option.icon}`} aria-hidden="true" />
                  </div>
                  <div className="option-card__title">{option.label}</div>
                  <p className="option-card__text">{option.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="form-section" aria-labelledby="section-icon">
            <h2 className="form-section__title" id="section-icon">
              Ícone do grupo
            </h2>
            <p className="form-section__desc">Escolha um ícone para identificar visualmente o grupo.</p>
            <div className="icon-picker" role="radiogroup" aria-label="Ícone do grupo">
              {GROUP_ICON_OPTIONS.map((item) => (
                <button
                  key={item}
                  className={`icon-picker__btn${icon === item ? " is-selected" : ""}`}
                  type="button"
                  aria-label={item}
                  onClick={() => setIcon(item)}
                >
                  <i className={`fa-solid ${item}`} aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>

          <div className="form-actions">
            <Link className="btn-secondary" to="/grupos/meus-grupos">
              Cancelar
            </Link>
            <button className="btn-primary" type="submit" disabled={!canSubmit}>
              <i className="fa-solid fa-circle-plus" aria-hidden="true" />{" "}
              {createGroup.isPending ? "Enviando..." : "Enviar para aprovação"}
            </button>
          </div>
        </form>

        <div className="create-preview-sticky">
          <aside className="create-preview" aria-label="Pré-visualização do grupo">
            <div className="create-preview__title">Pré-visualização</div>
            <article className="group-card">
              <div className="group-card__head">
                <div className="group-card__icon" aria-hidden="true">
                  <i className={`fa-solid ${icon}`} />
                </div>
                <div>
                  <h2 className="group-card__name">{previewName}</h2>
                  <p className="group-card__desc">{previewDesc}</p>
                </div>
              </div>
              <div className="group-card__meta">
                <span>{groupTypeLabel(type)}</span>
                <span>Aguardando aprovação</span>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </main>
  );
}
