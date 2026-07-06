function looksLikeHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value.trim());
}

type Props = {
  value?: string | null;
};

export function HelpDeskTicketDescription({ value }: Props) {
  const content = value?.trim();
  if (!content) {
    return <div className="hd-ticket-detail__description">—</div>;
  }

  if (looksLikeHtml(content)) {
    return (
      <div
        className="hd-ticket-detail__description hd-ticket-detail__description--html"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return <div className="hd-ticket-detail__description">{content}</div>;
}
