type Props = {
  status: string;
};

function statusMeta(status: string) {
  switch (status) {
    case "draft":
      return { label: "Rascunho", tone: "draft" as const };
    case "pending_approval":
      return { label: "Em aprovação", tone: "pending" as const };
    case "published":
    case "active":
      return { label: "Publicado", tone: "published" as const };
    case "rejected":
      return { label: "Rejeitado", tone: "rejected" as const };
    default:
      return { label: status, tone: "neutral" as const };
  }
}

export function UniLioCourseStatusChip({ status }: Props) {
  const meta = statusMeta(status);
  return (
    <span className={`unilio-course-status unilio-course-status--${meta.tone}`}>
      {meta.label}
    </span>
  );
}
