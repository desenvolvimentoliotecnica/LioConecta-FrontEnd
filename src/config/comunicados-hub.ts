import { comunicadosLinks } from "./navigation";
import type { HubRecentItem, HubSection } from "./pessoas-hub";

export const COMUNICADOS_HUB_PATH = "/comunicados";

const COMUNICADOS_META: Record<
  string,
  { description: string; icon: string; mod: string; count: string }
> = {
  oficiais: {
    description: "Comunicados institucionais da diretoria e áreas corporativas.",
    icon: "fa-bullhorn",
    mod: "oficiais",
    count: "8 ativos",
  },
  departamentais: {
    description: "Avisos publicados por RH, Marketing, TI e demais áreas.",
    icon: "fa-building",
    mod: "departamentais",
    count: "5 recentes",
  },
  urgentes: {
    description: "Alertas prioritários que exigem leitura imediata.",
    icon: "fa-triangle-exclamation",
    mod: "urgentes",
    count: "2 pendentes",
  },
  arquivo: {
    description: "Histórico de comunicados anteriores para consulta.",
    icon: "fa-box-archive",
    mod: "arquivo",
    count: "124 arquivados",
  },
};

export const COMUNICADOS_SECTIONS: HubSection[] = comunicadosLinks.map((link) => {
  const slug = link.path.split("/").pop() ?? link.path;
  const meta = COMUNICADOS_META[slug] ?? {
    description: "Comunicados corporativos.",
    icon: "fa-envelope-open-text",
    mod: slug,
    count: "Disponível",
  };
  return {
    id: slug,
    label: link.label,
    path: link.path,
    description: meta.description,
    icon: meta.icon,
    mod: meta.mod,
    count: meta.count,
  };
});

export const COMUNICADOS_RECENT: HubRecentItem[] = [
  {
    id: "com-oficial",
    title: "Atualização importante sobre nossa estratégia 2026",
    section: "Oficiais",
    date: "Hoje",
    href: "/comunicados/leitura?id=estrategia-2026",
    icon: "fa-bullhorn",
  },
  {
    id: "com-dept",
    title: "Campanha interna Q3 — alinhamento de áreas",
    section: "Departamentais",
    date: "Ontem",
    href: "/comunicados/departamentais",
    icon: "fa-building",
  },
  {
    id: "com-urgente",
    title: "Manutenção programada nos sistemas corporativos",
    section: "Urgentes",
    date: "02 jul 2026",
    href: "/comunicados/urgentes",
    icon: "fa-triangle-exclamation",
  },
  {
    id: "com-arquivo",
    title: "Política de home office — revisão 2025",
    section: "Arquivo",
    date: "15 jun 2026",
    href: "/comunicados/arquivo",
    icon: "fa-box-archive",
  },
];

export function filterComunicadosSections(query: string): HubSection[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return COMUNICADOS_SECTIONS;
  return COMUNICADOS_SECTIONS.filter(
    (section) =>
      section.label.toLowerCase().includes(normalized) ||
      section.description.toLowerCase().includes(normalized),
  );
}
