import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useCreateGroupTopic,
  useCreateGroupTopicReply,
  useCreateGroupWallPost,
  useCreateOwnershipTransfer,
  useDeleteGroup,
  useDeleteGroupTopic,
  useDeleteGroupWallPost,
  useGroup,
  useGroupMembers,
  useGroupTopic,
  useGroupTopics,
  useGroupWall,
  useJoinGroup,
  useLeaveGroup,
  useReactToGroupWallPost,
  useResubmitGroup,
  useUpdateGroup,
  useUpdateGroupMemberRole,
} from "../../api/hooks/useGroups";
import {
  GROUP_MEMBER_ROLE_MEMBER,
  GROUP_MEMBER_ROLE_MODERATOR,
  GROUP_MEMBER_ROLE_OWNER,
  GROUP_STATUS_EXPIRED,
  GROUP_STATUS_PENDING,
  GROUP_STATUS_REJECTED,
  type GroupDto,
  type GroupMemberDto,
  type GroupMemberRole,
  type GroupTopicDto,
  type GroupType,
} from "../../api/types";
import {
  GROUP_ICON_OPTIONS,
  GROUP_TYPE_OPTIONS,
  groupMemberRoleLabel,
  groupStatusBadgeClass,
  groupStatusLabel,
  groupTypeLabel,
  injectGroupCreatePageStyles,
} from "../../config/groups";
import { UserAvatar } from "../ui/UserAvatar";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import "../../styles/comunicados-oficiais-page.css";
import "../../styles/group-status-badges.css";
import "../../styles/group-detail-page.css";

type DetailTab = "mural" | "topicos" | "membros" | "configuracoes";

function formatDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function GroupStatusBanner({ group }: { group: GroupDto }) {
  const resubmitGroup = useResubmitGroup();
  const isOwner = group.myRole === GROUP_MEMBER_ROLE_OWNER;

  if (group.status === GROUP_STATUS_PENDING) {
    return (
      <div className="group-detail__banner group-detail__banner--pending">
        <i className="fa-solid fa-hourglass-half" aria-hidden="true" />
        <span>Este grupo está aguardando aprovação de um administrador antes de ficar ativo.</span>
      </div>
    );
  }

  if (group.status === GROUP_STATUS_REJECTED) {
    return (
      <div className="group-detail__banner group-detail__banner--rejected">
        <i className="fa-solid fa-circle-xmark" aria-hidden="true" />
        <span>
          Este grupo foi rejeitado{group.rejectionReason ? `: ${group.rejectionReason}` : "."}
        </span>
      </div>
    );
  }

  if (group.status === GROUP_STATUS_EXPIRED) {
    return (
      <div className="group-detail__banner group-detail__banner--expired">
        <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />
        <span style={{ flex: 1 }}>
          Este grupo expirou{group.expiresAt ? ` em ${formatDate(group.expiresAt)}` : ""}.
          {isOwner ? " Reenvie para aprovação para reativá-lo." : ""}
        </span>
        {isOwner ? (
          <button
            className="btn-secondary"
            type="button"
            disabled={resubmitGroup.isPending}
            onClick={() =>
              void resubmitGroup.mutateAsync(group.id).catch(() => {
                // erro tratado pelo estado da mutation
              })
            }
          >
            {resubmitGroup.isPending ? "Reenviando..." : "Reenviar para aprovação"}
          </button>
        ) : null}
      </div>
    );
  }

  return null;
}

function WallTab({ group }: { group: GroupDto }) {
  const { data: posts = [], isLoading, isError } = useGroupWall(group.id);
  const createPost = useCreateGroupWallPost(group.id);
  const deletePost = useDeleteGroupWallPost(group.id);
  const reactToPost = useReactToGroupWallPost(group.id);
  const [content, setContent] = useState("");

  const isMember = group.isMember;
  const canModerate =
    group.myRole === GROUP_MEMBER_ROLE_OWNER || group.myRole === GROUP_MEMBER_ROLE_MODERATOR;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    try {
      await createPost.mutateAsync({ content: trimmed });
      setContent("");
    } catch {
      // erro exibido via createPost.isError
    }
  }

  async function handleDelete(postId: string) {
    if (!window.confirm("Excluir esta publicação do mural?")) return;
    await deletePost.mutateAsync(postId).catch(() => undefined);
  }

  return (
    <div>
      {isMember ? (
        <form className="group-detail__composer" onSubmit={handleSubmit}>
          <textarea
            placeholder="Compartilhe uma atualização com o grupo..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
            aria-label="Nova publicação no mural"
          />
          {createPost.isError ? (
            <p className="page-empty-note" style={{ color: "#b91c1c", margin: 0 }}>
              Não foi possível publicar. Tente novamente.
            </p>
          ) : null}
          <div className="group-detail__composer-actions">
            <button
              className="btn-primary"
              type="submit"
              disabled={createPost.isPending || content.trim().length === 0}
            >
              <i className="fa-solid fa-paper-plane" aria-hidden="true" />{" "}
              {createPost.isPending ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </form>
      ) : null}

      {isLoading ? (
        <p className="page-empty-note">Carregando mural...</p>
      ) : isError ? (
        <p className="page-empty-note">Não foi possível carregar o mural do grupo.</p>
      ) : posts.length === 0 ? (
        <p className="page-empty-note">Nenhuma publicação no mural ainda.</p>
      ) : (
        <div className="group-detail__wall-list">
          {posts.map((post) => (
            <article className="group-detail__post" key={post.id}>
              <div className="group-detail__post-head">
                <UserAvatar className="avatar" photoUrl={post.author.photoUrl} />
                <div>
                  <div className="group-detail__post-author">{post.author.name}</div>
                  <div className="group-detail__post-time">{formatDate(post.createdAt)}</div>
                </div>
              </div>
              <p className="group-detail__post-body">{post.content}</p>
              <div className="group-detail__post-footer">
                <button
                  className={`group-detail__post-like${post.viewerReacted ? " is-active" : ""}`}
                  type="button"
                  disabled={!isMember}
                  onClick={() => void reactToPost.mutateAsync(post.id)}
                >
                  <i
                    className={post.viewerReacted ? "fa-solid fa-heart" : "fa-regular fa-heart"}
                    aria-hidden="true"
                  />
                  {post.reactionCount}
                </button>
                {post.canDelete || canModerate ? (
                  <button
                    className="group-detail__post-delete"
                    type="button"
                    aria-label="Excluir publicação"
                    onClick={() => void handleDelete(post.id)}
                  >
                    <i className="fa-regular fa-trash-can" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function TopicThread({
  group,
  topicId,
  onBack,
}: {
  group: GroupDto;
  topicId: string;
  onBack: () => void;
}) {
  const { data: topic, isLoading, isError } = useGroupTopic(group.id, topicId);
  const createReply = useCreateGroupTopicReply(group.id, topicId);
  const [reply, setReply] = useState("");

  async function handleReply(event: FormEvent) {
    event.preventDefault();
    const trimmed = reply.trim();
    if (!trimmed) return;
    try {
      await createReply.mutateAsync({ content: trimmed });
      setReply("");
    } catch {
      // erro exibido via createReply.isError
    }
  }

  return (
    <div>
      <button className="group-detail__thread-back" type="button" onClick={onBack}>
        <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Voltar para tópicos
      </button>

      {isLoading ? (
        <p className="page-empty-note">Carregando tópico...</p>
      ) : isError || !topic ? (
        <p className="page-empty-note">Não foi possível carregar este tópico.</p>
      ) : (
        <>
          <div className="group-detail__thread-header">
            <div className="official-card__meta" style={{ marginBottom: 8 }}>
              <div className="official-card__author">
                <UserAvatar className="avatar" photoUrl={topic.author.photoUrl} />
                {topic.author.name}
              </div>
              <span className="official-card__date">{formatDate(topic.createdAt)}</span>
            </div>
            <h2 className="group-detail__thread-title">{topic.title}</h2>
            <p className="group-detail__thread-body">{topic.content}</p>
          </div>

          <h3 className="form-section__title" style={{ marginBottom: 12 }}>
            {topic.replies.length === 0
              ? "Nenhuma resposta ainda"
              : topic.replies.length === 1
                ? "1 resposta"
                : `${topic.replies.length} respostas`}
          </h3>

          {topic.replies.length > 0 ? (
            <div className="group-detail__reply-list">
              {topic.replies.map((r) => (
                <div className="group-detail__reply" key={r.id}>
                  <div className="official-card__author" style={{ marginBottom: 6 }}>
                    <UserAvatar className="avatar" photoUrl={r.author.photoUrl} />
                    {r.author.name}
                    <span className="group-detail__post-time" style={{ marginLeft: 6 }}>
                      {formatDate(r.createdAt)}
                    </span>
                  </div>
                  <p className="group-detail__post-body" style={{ marginBottom: 0 }}>
                    {r.content}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {group.isMember ? (
            <form className="group-detail__composer" onSubmit={handleReply}>
              <textarea
                placeholder="Escreva uma resposta..."
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                aria-label="Nova resposta"
              />
              {createReply.isError ? (
                <p className="page-empty-note" style={{ color: "#b91c1c", margin: 0 }}>
                  Não foi possível enviar a resposta.
                </p>
              ) : null}
              <div className="group-detail__composer-actions">
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={createReply.isPending || reply.trim().length === 0}
                >
                  {createReply.isPending ? "Enviando..." : "Responder"}
                </button>
              </div>
            </form>
          ) : null}
        </>
      )}
    </div>
  );
}

function TopicsTab({ group }: { group: GroupDto }) {
  const { data: topics = [], isLoading, isError } = useGroupTopics(group.id);
  const createTopic = useCreateGroupTopic(group.id);
  const deleteTopic = useDeleteGroupTopic(group.id);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const canModerate =
    group.myRole === GROUP_MEMBER_ROLE_OWNER || group.myRole === GROUP_MEMBER_ROLE_MODERATOR;

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;
    try {
      await createTopic.mutateAsync({ title: title.trim(), content: content.trim() });
      setTitle("");
      setContent("");
      setShowForm(false);
    } catch {
      // erro exibido via createTopic.isError
    }
  }

  async function handleDelete(topic: GroupTopicDto, event: ReactMouseEvent) {
    event.stopPropagation();
    if (!window.confirm(`Excluir o tópico "${topic.title}"?`)) return;
    await deleteTopic.mutateAsync(topic.id).catch(() => undefined);
  }

  if (selectedTopicId) {
    return (
      <TopicThread
        group={group}
        topicId={selectedTopicId}
        onBack={() => setSelectedTopicId(null)}
      />
    );
  }

  return (
    <div>
      {group.isMember ? (
        <div className="group-detail__topics-toolbar">
          <button className="btn-primary" type="button" onClick={() => setShowForm((v) => !v)}>
            <i className="fa-solid fa-circle-plus" aria-hidden="true" /> Novo tópico
          </button>
        </div>
      ) : null}

      {showForm ? (
        <form className="group-detail__composer" onSubmit={handleCreate} style={{ marginBottom: 16 }}>
          <input
            className="form-input"
            type="text"
            placeholder="Título do tópico"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-label="Título do tópico"
          />
          <textarea
            placeholder="Descreva o assunto do tópico..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
            aria-label="Conteúdo do tópico"
          />
          {createTopic.isError ? (
            <p className="page-empty-note" style={{ color: "#b91c1c", margin: 0 }}>
              Não foi possível criar o tópico.
            </p>
          ) : null}
          <div className="group-detail__composer-actions" style={{ gap: 8 }}>
            <button className="btn-secondary" type="button" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
            <button
              className="btn-primary"
              type="submit"
              disabled={createTopic.isPending || !title.trim() || !content.trim()}
            >
              {createTopic.isPending ? "Criando..." : "Criar tópico"}
            </button>
          </div>
        </form>
      ) : null}

      {isLoading ? (
        <p className="page-empty-note">Carregando tópicos...</p>
      ) : isError ? (
        <p className="page-empty-note">Não foi possível carregar os tópicos.</p>
      ) : topics.length === 0 ? (
        <p className="page-empty-note">Nenhum tópico criado ainda.</p>
      ) : (
        <div className="group-detail__topic-list">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="group-detail__topic-item"
              role="button"
              tabIndex={0}
              onClick={() => setSelectedTopicId(topic.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedTopicId(topic.id);
                }
              }}
            >
              <div className="group-detail__topic-main">
                <div className="group-detail__topic-title">{topic.title}</div>
                <div className="group-detail__topic-meta">
                  {topic.author.name} · {formatDate(topic.lastActivityAt ?? topic.createdAt)}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="group-detail__topic-replies">
                  <strong>{topic.replyCount}</strong>
                  respostas
                </div>
                {canModerate ? (
                  <button
                    className="group-detail__post-delete"
                    type="button"
                    aria-label="Excluir tópico"
                    onClick={(event) => void handleDelete(topic, event)}
                  >
                    <i className="fa-regular fa-trash-can" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MembersTab({ group }: { group: GroupDto }) {
  const { data: members = [], isLoading, isError } = useGroupMembers(group.id);
  const updateRole = useUpdateGroupMemberRole(group.id);
  const createTransfer = useCreateOwnershipTransfer(group.id);
  const [transferTargetId, setTransferTargetId] = useState("");
  const [transferMessage, setTransferMessage] = useState<string | null>(null);

  const isOwner = group.myRole === GROUP_MEMBER_ROLE_OWNER;

  const transferCandidates = useMemo(
    () => members.filter((member) => member.role !== GROUP_MEMBER_ROLE_OWNER),
    [members],
  );

  async function handleRoleChange(member: GroupMemberDto, role: GroupMemberRole) {
    await updateRole.mutateAsync({ memberId: member.id, role }).catch(() => undefined);
  }

  async function handleTransfer(event: FormEvent) {
    event.preventDefault();
    if (!transferTargetId) return;
    setTransferMessage(null);
    try {
      await createTransfer.mutateAsync({ toPersonId: transferTargetId });
      setTransferMessage("Solicitação de transferência enviada. O novo proprietário precisa aceitar.");
      setTransferTargetId("");
    } catch {
      setTransferMessage("Não foi possível solicitar a transferência de propriedade.");
    }
  }

  if (isLoading) {
    return <p className="page-empty-note">Carregando membros...</p>;
  }
  if (isError) {
    return <p className="page-empty-note">Não foi possível carregar os membros do grupo.</p>;
  }

  return (
    <div>
      <div className="group-detail__members-list">
        {members.map((member) => (
          <div className="group-detail__member-row" key={member.id}>
            <div className="group-detail__member-main">
              <UserAvatar className="avatar" photoUrl={member.person.photoUrl} />
              <div>
                <div className="group-detail__member-name">{member.person.name}</div>
                <div className="group-detail__member-title">
                  {member.person.title ?? member.person.departmentName ?? ""}
                </div>
              </div>
            </div>
            <span className="group-role-badge">{groupMemberRoleLabel(member.role)}</span>
            {isOwner && member.role !== GROUP_MEMBER_ROLE_OWNER ? (
              <div className="group-detail__member-actions">
                {member.role === GROUP_MEMBER_ROLE_MEMBER ? (
                  <button
                    className="group-detail__member-btn"
                    type="button"
                    disabled={updateRole.isPending}
                    onClick={() => void handleRoleChange(member, GROUP_MEMBER_ROLE_MODERATOR)}
                  >
                    Tornar moderador
                  </button>
                ) : (
                  <button
                    className="group-detail__member-btn"
                    type="button"
                    disabled={updateRole.isPending}
                    onClick={() => void handleRoleChange(member, GROUP_MEMBER_ROLE_MEMBER)}
                  >
                    Remover moderação
                  </button>
                )}
              </div>
            ) : null}
          </div>
        ))}
        {members.length === 0 ? <p className="page-empty-note">Nenhum membro encontrado.</p> : null}
      </div>

      {isOwner && transferCandidates.length > 0 ? (
        <form className="group-detail__transfer-box" onSubmit={handleTransfer}>
          <i className="fa-solid fa-right-left" aria-hidden="true" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#9a3412" }}>
            Transferir propriedade do grupo para:
          </span>
          <select
            value={transferTargetId}
            onChange={(event) => setTransferTargetId(event.target.value)}
            aria-label="Selecionar novo proprietário"
          >
            <option value="">Selecione um membro</option>
            {transferCandidates.map((member) => (
              <option key={member.id} value={member.person.id}>
                {member.person.name}
              </option>
            ))}
          </select>
          <button className="btn-primary" type="submit" disabled={!transferTargetId || createTransfer.isPending}>
            {createTransfer.isPending ? "Enviando..." : "Solicitar transferência"}
          </button>
          {transferMessage ? (
            <p className="page-empty-note" style={{ margin: 0, width: "100%" }}>
              {transferMessage}
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}

function SettingsTab({ group }: { group: GroupDto }) {
  const navigate = useNavigate();
  const updateGroup = useUpdateGroup(group.id);
  const deleteGroup = useDeleteGroup();

  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");
  const [type, setType] = useState<GroupType>(group.type);
  const [icon, setIcon] = useState(group.icon);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setName(group.name);
    setDescription(group.description ?? "");
    setType(group.type);
    setIcon(group.icon);
  }, [group]);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaveMessage(null);
    try {
      await updateGroup.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        type,
        icon,
      });
      setSaveMessage("Alterações salvas com sucesso.");
    } catch {
      setSaveMessage("Não foi possível salvar as alterações.");
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Excluir permanentemente o grupo "${group.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    try {
      await deleteGroup.mutateAsync(group.id);
      navigate("/grupos/meus-grupos");
    } catch {
      window.alert("Não foi possível excluir o grupo. Tente novamente.");
    }
  }

  return (
    <div>
      <form className="form-section" onSubmit={handleSave} style={{ maxWidth: 640 }}>
        <h2 className="form-section__title">Informações do grupo</h2>
        <p className="form-section__desc">Atualize nome, descrição, tipo e ícone do grupo.</p>

        <div className="form-field">
          <label className="form-label" htmlFor="settings-name">
            Nome do grupo
          </label>
          <input
            className="form-input"
            id="settings-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="settings-desc">
            Descrição
          </label>
          <textarea
            className="form-textarea"
            id="settings-desc"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="form-field">
          <span className="form-label">Tipo de grupo</span>
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
              </button>
            ))}
          </div>
        </div>

        <div className="form-field">
          <span className="form-label">Ícone do grupo</span>
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
        </div>

        {saveMessage ? (
          <p
            className="page-empty-note"
            style={{ color: updateGroup.isError ? "#b91c1c" : "#15803d", textAlign: "left" }}
          >
            {saveMessage}
          </p>
        ) : null}

        <div className="form-actions">
          <button className="btn-primary" type="submit" disabled={updateGroup.isPending || !name.trim()}>
            {updateGroup.isPending ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>

      <div className="group-detail__settings-danger">
        <h3>Excluir grupo</h3>
        <p>
          Ao excluir este grupo, todo o conteúdo do mural, tópicos e a lista de membros serão removidos
          permanentemente.
        </p>
        <button className="btn-danger" type="button" disabled={deleteGroup.isPending} onClick={() => void handleDelete()}>
          {deleteGroup.isPending ? "Excluindo..." : "Excluir grupo"}
        </button>
      </div>
    </div>
  );
}

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: group, isLoading, isError } = useGroup(id);
  const joinGroup = useJoinGroup();
  const leaveGroup = useLeaveGroup();
  const [tab, setTab] = useState<DetailTab>("mural");
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => injectGroupCreatePageStyles(), []);

  const isOwner = group?.myRole === GROUP_MEMBER_ROLE_OWNER;

  async function handleJoin() {
    if (!id) return;
    setActionError(null);
    try {
      await joinGroup.mutateAsync(id);
    } catch {
      setActionError("Não foi possível entrar no grupo.");
    }
  }

  async function handleLeave() {
    if (!id || !group) return;
    if (!window.confirm(`Sair do grupo "${group.name}"?`)) return;
    setActionError(null);
    try {
      await leaveGroup.mutateAsync(id);
      navigate("/grupos/meus-grupos");
    } catch {
      setActionError("Não foi possível sair do grupo.");
    }
  }

  if (isLoading) {
    return (
      <main className={sectionMainClass("grupos")}>
        <p className="page-empty-note">Carregando grupo...</p>
      </main>
    );
  }

  if (isError || !group) {
    return (
      <main className={sectionMainClass("grupos")}>
        <SectionPageHead
          section="grupos"
          title="Grupo não encontrado"
          current="Grupo"
          description="Não foi possível carregar este grupo. Ele pode ter sido removido ou você não tem acesso a ele."
        />
        <Link className="btn-secondary" to="/grupos/explorar">
          Voltar para explorar grupos
        </Link>
      </main>
    );
  }

  const typeMeta = GROUP_TYPE_OPTIONS.find((option) => option.value === group.type);

  return (
    <main className={sectionMainClass("grupos")}>
      <SectionPageHead
        section="grupos"
        title={group.name}
        current={group.name}
        description={group.description || `Grupo ${groupTypeLabel(group.type)} com ${group.memberCount} membros.`}
        actions={
          <div className="group-detail__header-actions">
            <span className={groupStatusBadgeClass(group.status)}>{groupStatusLabel(group.status)}</span>
            {actionError ? (
              <span className="page-empty-note" style={{ color: "#b91c1c", margin: 0 }}>
                {actionError}
              </span>
            ) : null}
            {!group.isMember ? (
              <button
                className="btn-primary"
                type="button"
                disabled={joinGroup.isPending}
                onClick={() => void handleJoin()}
              >
                <i className="fa-solid fa-user-plus" aria-hidden="true" />{" "}
                {joinGroup.isPending ? "Entrando..." : "Participar"}
              </button>
            ) : !isOwner ? (
              <button
                className="btn-secondary"
                type="button"
                disabled={leaveGroup.isPending}
                onClick={() => void handleLeave()}
              >
                <i className="fa-solid fa-right-from-bracket" aria-hidden="true" /> Sair do grupo
              </button>
            ) : null}
          </div>
        }
      />

      <GroupStatusBanner group={group} />

      <div className="group-detail__tabs" role="tablist" aria-label="Seções do grupo">
        <button
          className={`group-detail__tab${tab === "mural" ? " is-active" : ""}`}
          type="button"
          role="tab"
          aria-selected={tab === "mural"}
          onClick={() => setTab("mural")}
        >
          <i className={`fa-solid ${typeMeta?.icon ?? "fa-note-sticky"}`} aria-hidden="true" /> Mural
          <span className="group-detail__tab-count">{group.postCount}</span>
        </button>
        <button
          className={`group-detail__tab${tab === "topicos" ? " is-active" : ""}`}
          type="button"
          role="tab"
          aria-selected={tab === "topicos"}
          onClick={() => setTab("topicos")}
        >
          <i className="fa-solid fa-comments" aria-hidden="true" /> Tópicos
          <span className="group-detail__tab-count">{group.topicCount}</span>
        </button>
        <button
          className={`group-detail__tab${tab === "membros" ? " is-active" : ""}`}
          type="button"
          role="tab"
          aria-selected={tab === "membros"}
          onClick={() => setTab("membros")}
        >
          <i className="fa-solid fa-users" aria-hidden="true" /> Membros
          <span className="group-detail__tab-count">{group.memberCount}</span>
        </button>
        {isOwner ? (
          <button
            className={`group-detail__tab${tab === "configuracoes" ? " is-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={tab === "configuracoes"}
            onClick={() => setTab("configuracoes")}
          >
            <i className="fa-solid fa-gear" aria-hidden="true" /> Configurações
          </button>
        ) : null}
      </div>

      {tab === "mural" ? <WallTab group={group} /> : null}
      {tab === "topicos" ? <TopicsTab group={group} /> : null}
      {tab === "membros" ? <MembersTab group={group} /> : null}
      {tab === "configuracoes" && isOwner ? <SettingsTab group={group} /> : null}
    </main>
  );
}
