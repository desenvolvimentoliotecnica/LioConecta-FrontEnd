type DescriptionField = {
  label: string;
  value: string;
};

type DescriptionSection = {
  title: string | null;
  fields: DescriptionField[];
};

function looksLikeHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value.trim());
}

function decodeHtmlEntities(value: string): string {
  if (typeof document === "undefined") {
    return value
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'");
  }

  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function stripTags(value: string): string {
  return decodeHtmlEntities(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim(),
  );
}

function normalizeLabel(label: string): string {
  return stripTags(label)
    .replace(/^[\d.)\-\s]+/, "")
    .replace(/:+\s*$/g, "")
    .trim();
}

function normalizeValue(value: string): string {
  return stripTags(value).replace(/^:+\s*/, "").trim();
}

/**
 * GLPI forms emit broken nested HTML (`<p><b>Q</b>: <p>A</p>...`).
 * Parse before the browser rewrites the DOM.
 */
export function parseHelpDeskDescriptionSections(html: string): DescriptionSection[] {
  const cleaned = html
    .replace(/<h2[^>]*>\s*<\/h2>/gi, "")
    .replace(/\r\n?/g, "\n")
    .trim();

  if (!cleaned) return [];

  const chunks = cleaned.split(/<h2[^>]*>/i);
  const sections: DescriptionSection[] = [];

  for (const chunk of chunks) {
    if (!chunk.trim()) continue;

    let title: string | null = null;
    let body = chunk;

    const titleClose = chunk.search(/<\/h2>/i);
    if (titleClose >= 0) {
      title = stripTags(chunk.slice(0, titleClose)) || null;
      body = chunk.slice(titleClose).replace(/^<\/h2>/i, "");
    }

    const fields: DescriptionField[] = [];
    const fieldPattern = /<b>([\s\S]*?)<\/b>\s*:?\s*([\s\S]*?)(?=(?:<br\s*\/?>\s*)?<b>|$)/gi;
    let match: RegExpExecArray | null;
    while ((match = fieldPattern.exec(body)) !== null) {
      const label = normalizeLabel(match[1] ?? "");
      const value = normalizeValue(match[2] ?? "");
      if (!label && !value) continue;
      fields.push({ label: label || "Campo", value: value || "—" });
    }

    if (title || fields.length > 0) {
      sections.push({ title, fields });
    }
  }

  if (sections.length === 0) {
    const plain = stripTags(cleaned);
    if (plain) {
      sections.push({ title: null, fields: [{ label: "Descrição", value: plain }] });
    }
  }

  return sections;
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
    const sections = parseHelpDeskDescriptionSections(content);
    if (sections.some((section) => section.fields.length > 0 || section.title)) {
      return (
        <div className="hd-ticket-detail__description hd-ticket-detail__description--structured">
          {sections.map((section, sectionIndex) => (
            <section key={`section-${sectionIndex}`} className="hd-desc-section">
              {section.title ? <h4 className="hd-desc-section__title">{section.title}</h4> : null}
              <dl className="hd-desc-fields">
                {section.fields.map((field, fieldIndex) => (
                  <div key={`field-${sectionIndex}-${fieldIndex}`} className="hd-desc-field">
                    <dt>{field.label}:</dt>
                    <dd>{field.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      );
    }

    return (
      <div
        className="hd-ticket-detail__description hd-ticket-detail__description--html"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return <div className="hd-ticket-detail__description">{content}</div>;
}
