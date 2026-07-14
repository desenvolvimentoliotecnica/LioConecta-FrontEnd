type Props = {
  status: string;
  label: string;
};

function statusModifier(status: string): string {
  switch (status) {
    case "1":
      return "new";
    case "2":
      return "assigned";
    case "3":
      return "planned";
    case "4":
      return "pending";
    case "5":
      return "solved";
    case "6":
      return "closed";
    case "10":
      return "approval";
    default:
      return "unknown";
  }
}

export function formatHelpDeskStatusLabel(label: string): string {
  const trimmed = label.trim();
  if (/^em atendimento/i.test(trimmed)) {
    return "Em atendimento";
  }
  return trimmed;
}

export function HelpDeskTicketStatusChip({ status, label }: Props) {
  const modifier = statusModifier(status);
  return (
    <span className={`hd-ticket-status hd-ticket-status--${modifier}`}>
      {formatHelpDeskStatusLabel(label)}
    </span>
  );
}
