type StatusProps = {
  status: string;
  unread?: boolean;
};

type VisibilityProps = {
  visibility: string;
};

function questionStatusMeta(status: string) {
  switch (status) {
    case "answered":
      return { label: "Respondida", tone: "answered" as const };
    case "closed":
      return { label: "Encerrada", tone: "closed" as const };
    default:
      return { label: "Aberta", tone: "open" as const };
  }
}

export function UniLioQuestionStatusChip({ status, unread = false }: StatusProps) {
  const meta = questionStatusMeta(status);
  return (
    <span className="unilio-instrutor-table__chip-group">
      <span className={`unilio-question-status unilio-question-status--${meta.tone}`}>{meta.label}</span>
      {unread ? <span className="unilio-questions-inbox__unread" title="Não lida">!</span> : null}
    </span>
  );
}

export function UniLioQuestionVisibilityChip({ visibility }: VisibilityProps) {
  const isPublic = visibility === "public";
  return (
    <span className={`unilio-question-visibility unilio-question-visibility--${isPublic ? "public" : "private"}`}>
      {isPublic ? "FAQ" : "Privada"}
    </span>
  );
}
