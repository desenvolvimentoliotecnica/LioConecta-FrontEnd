const AREA_TONE_MAP: Array<{ match: (area: string) => boolean; tone: string }> = [
  { match: (area) => area.includes("tecnologia de alimentos"), tone: "food-tech" },
  { match: (area) => area === "tecnologia" || area.startsWith("tecnologia "), tone: "tech" },
  { match: (area) => area.includes("qualidade"), tone: "quality" },
  { match: (area) => area.includes("compliance"), tone: "compliance" },
  { match: (area) => area.includes("gestão") || area.includes("gestao"), tone: "management" },
  { match: (area) => area.includes("dados"), tone: "data" },
  { match: (area) => area.includes("opera"), tone: "operations" },
  { match: (area) => area.includes("engenharia"), tone: "engineering" },
  { match: (area) => area.includes("manuten"), tone: "maintenance" },
  { match: (area) => area.includes("produtividade"), tone: "productivity" },
  { match: (area) => area.includes("institucional"), tone: "institutional" },
  { match: (area) => area.includes("geral"), tone: "general" },
];

const FALLBACK_TONES = [
  "accent-a",
  "accent-b",
  "accent-c",
  "accent-d",
  "accent-e",
  "accent-f",
] as const;

function resolveAreaTone(area: string): string {
  const normalized = area.trim().toLowerCase();
  const mapped = AREA_TONE_MAP.find((entry) => entry.match(normalized));
  if (mapped) return mapped.tone;

  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash + normalized.charCodeAt(i)) % FALLBACK_TONES.length;
  }
  return FALLBACK_TONES[hash] ?? "general";
}

type Props = {
  area: string;
};

export function UniLioCourseAreaChip({ area }: Props) {
  const label = area.trim() || "—";
  const tone = resolveAreaTone(label);

  return (
    <span className={`unilio-course-area unilio-course-area--${tone}`} title={label}>
      {label}
    </span>
  );
}
