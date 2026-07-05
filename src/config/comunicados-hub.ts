import { comunicadosLinks } from "./navigation";
import type { HubRecentItem, HubSection } from "./pessoas-hub";
import type { ComunicadoHubDto, ComunicadoKind } from "../api/types";
import {
  COMUNICADO_KIND_ARQUIVO,
  COMUNICADO_KIND_DEPARTAMENTAL,
  COMUNICADO_KIND_OFICIAL,
  COMUNICADO_KIND_URGENTE,
} from "../api/types";
import { comunicadoReaderId } from "./comunicados-pages";

export const COMUNICADOS_HUB_PATH = "/comunicados";

const COMUNICADOS_META: Record<
  string,
  { description: string; icon: string; mod: string }
> = {
  oficiais: {
    description: "Comunicados institucionais da diretoria e áreas corporativas.",
    icon: "fa-bullhorn",
    mod: "oficiais",
  },
  departamentais: {
    description: "Avisos publicados por RH, Marketing, TI e demais áreas.",
    icon: "fa-building",
    mod: "departamentais",
  },
  urgentes: {
    description: "Alertas prioritários que exigem leitura imediata.",
    icon: "fa-triangle-exclamation",
    mod: "urgentes",
  },
  arquivo: {
    description: "Histórico de comunicados anteriores para consulta.",
    icon: "fa-box-archive",
    mod: "arquivo",
  },
};

const KIND_SECTION: Record<
  ComunicadoKind,
  { label: string; icon: string }
> = {
  [COMUNICADO_KIND_OFICIAL]: { label: "Oficiais", icon: "fa-bullhorn" },
  [COMUNICADO_KIND_DEPARTAMENTAL]: { label: "Departamentais", icon: "fa-building" },
  [COMUNICADO_KIND_URGENTE]: { label: "Urgentes", icon: "fa-triangle-exclamation" },
  [COMUNICADO_KIND_ARQUIVO]: { label: "Arquivo", icon: "fa-box-archive" },
};

function formatOficiaisCount(count: number): string {
  if (count === 0) return "Nenhum ativo";
  return count === 1 ? "1 ativo" : `${count} ativos`;
}

function formatDepartamentaisCount(count: number): string {
  if (count === 0) return "Nenhum recente";
  return count === 1 ? "1 recente" : `${count} recentes`;
}

function formatUrgentesCount(count: number, unread: number): string {
  if (unread > 0) {
    return unread === 1 ? "1 pendente" : `${unread} pendentes`;
  }
  if (count === 0) return "Nenhum ativo";
  return count === 1 ? "1 ativo" : `${count} ativos`;
}

function formatArquivoCount(count: number): string {
  if (count === 0) return "Nenhum arquivado";
  return count === 1 ? "1 arquivado" : `${count} arquivados`;
}

function countForSection(id: string, hub: ComunicadoHubDto): string {
  switch (id) {
    case "oficiais":
      return formatOficiaisCount(hub.oficiaisCount);
    case "departamentais":
      return formatDepartamentaisCount(hub.departamentaisCount);
    case "urgentes":
      return formatUrgentesCount(hub.urgentesCount, hub.urgentesUnreadCount);
    case "arquivo":
      return formatArquivoCount(hub.arquivoCount);
    default:
      return "Disponível";
  }
}

const MOCK_COUNTS: Record<string, string> = {
  oficiais: "8 ativos",
  departamentais: "5 recentes",
  urgentes: "2 pendentes",
  arquivo: "124 arquivados",
};

export function buildComunicadosSections(
  hub: ComunicadoHubDto | null | undefined,
  options?: { useMockFallback?: boolean },
): HubSection[] {
  const useMock = options?.useMockFallback ?? false;

  return comunicadosLinks.map((link) => {
    const slug = link.path.split("/").pop() ?? link.path;
    const meta = COMUNICADOS_META[slug] ?? {
      description: "Comunicados corporativos.",
      icon: "fa-envelope-open-text",
      mod: slug,
    };

    let count = "—";
    if (hub) {
      count = countForSection(slug, hub);
    } else if (useMock) {
      count = MOCK_COUNTS[slug] ?? "Disponível";
    }

    return {
      id: slug,
      label: link.label,
      path: link.path,
      description: meta.description,
      icon: meta.icon,
      mod: meta.mod,
      count,
    };
  });
}

function formatRecentDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `Há ${diffDays} dias`;

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

const MOCK_RECENT: HubRecentItem[] = [
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

export function buildComunicadosRecent(
  hub: ComunicadoHubDto | null | undefined,
  options?: { useMockFallback?: boolean },
): HubRecentItem[] {
  if (hub && hub.recent.length > 0) {
    return hub.recent.map((item) => {
      const section = KIND_SECTION[item.kind] ?? KIND_SECTION[COMUNICADO_KIND_OFICIAL];
      const readerId = comunicadoReaderId(item);

      return {
        id: item.id,
        title: item.title,
        section: section.label,
        date: formatRecentDate(item.publishedAt),
        href: `/comunicados/leitura?id=${encodeURIComponent(readerId)}`,
        icon: section.icon,
      };
    });
  }

  if (!hub && options?.useMockFallback) {
    return MOCK_RECENT;
  }

  return [];
}

export function filterComunicadosSections(sections: HubSection[], query: string): HubSection[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return sections;
  return sections.filter(
    (section) =>
      section.label.toLowerCase().includes(normalized) ||
      section.description.toLowerCase().includes(normalized),
  );
}
