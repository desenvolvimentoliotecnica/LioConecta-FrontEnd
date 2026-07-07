import { pageAssets } from "../generated/pagesIndex";
import { injectScopedPageStyle } from "../utils/pageInjectedStyles";
import {
  COMUNICADO_KIND_ARQUIVO,
  COMUNICADO_KIND_DEPARTAMENTAL,
  COMUNICADO_KIND_OFICIAL,
  COMUNICADO_KIND_URGENTE,
  type ComunicadoKind,
} from "../api/types";

export type ComunicadosPageConfig = {
  pageId: string;
  path: string;
  kind: ComunicadoKind;
  listMode?: "kind" | "archived";
  title: string;
  description: string;
  breadcrumbCurrent: string;
  listAriaLabel: string;
  tagLabel: string;
  tagClass: string;
  filterChips: string[];
  showCreateButton?: boolean;
  createPath?: string;
  editorTitle: string;
  editorDescription: string;
  mandatoryDefault?: boolean;
  countLabel: (count: number) => string;
};

export const COMUNICADOS_OFICIAIS_CONFIG: ComunicadosPageConfig = {
  pageId: "comunicados-oficiais",
  path: "/comunicados/oficiais",
  kind: COMUNICADO_KIND_OFICIAL,
  title: "Comunicados Oficiais",
  description:
    "Publicações institucionais da liderança e áreas corporativas. Aqui você encontra orientações, políticas e atualizações oficiais da LioConecta.",
  breadcrumbCurrent: "Oficiais",
  listAriaLabel: "Lista de comunicados oficiais",
  tagLabel: "Comunicado oficial",
  tagClass: "",
  filterChips: ["Todos", "Recentes", "RH", "TI", "Diretoria"],
  showCreateButton: true,
  createPath: "/comunicados/oficiais/novo",
  editorTitle: "Novo comunicado oficial",
  editorDescription:
    "Redija e publique um comunicado institucional. O conteúdo ficará visível na listagem de oficiais após a publicação.",
  countLabel: (count) =>
    count === 1 ? "Exibindo 1 comunicado oficial" : `Exibindo ${count} comunicados oficiais`,
};

export const COMUNICADOS_DEPARTAMENTAIS_CONFIG: ComunicadosPageConfig = {
  pageId: "comunicados-departamentais",
  path: "/comunicados/departamentais",
  kind: COMUNICADO_KIND_DEPARTAMENTAL,
  title: "Comunicados Departamentais",
  description:
    "Avisos e atualizações publicados pelas áreas da empresa. Acompanhe o que está acontecendo no seu departamento e nos times parceiros.",
  breadcrumbCurrent: "Departamentais",
  listAriaLabel: "Lista de comunicados departamentais",
  tagLabel: "Departamental",
  tagClass: "tag--dept",
  filterChips: ["Todos", "Recentes", "RH", "Marketing", "TI", "Comercial"],
  showCreateButton: true,
  createPath: "/comunicados/departamentais/novo",
  editorTitle: "Novo comunicado departamental",
  editorDescription:
    "Publique um aviso para sua área ou departamento. O comunicado aparecerá na listagem departamental após a publicação.",
  countLabel: (count) =>
    count === 1
      ? "Exibindo 1 comunicado departamental"
      : `Exibindo ${count} comunicados departamentais`,
};

export const COMUNICADOS_URGENTES_CONFIG: ComunicadosPageConfig = {
  pageId: "comunicados-urgentes",
  path: "/comunicados/urgentes",
  kind: COMUNICADO_KIND_URGENTE,
  title: "Comunicados Urgentes",
  description:
    "Avisos prioritários que exigem atenção imediata. Confira prazos, ações necessárias e orientações de contorno.",
  breadcrumbCurrent: "Urgentes",
  listAriaLabel: "Lista de comunicados urgentes",
  tagLabel: "Urgente",
  tagClass: "tag--urgent",
  filterChips: ["Todos", "Recentes", "TI", "RH", "Compliance"],
  showCreateButton: true,
  createPath: "/comunicados/urgentes/novo",
  editorTitle: "Novo comunicado urgente",
  editorDescription:
    "Publique um aviso prioritário com ação imediata. Comunicados urgentes aparecem no topo da listagem e podem exigir confirmação de leitura.",
  mandatoryDefault: true,
  countLabel: (count) =>
    count === 1 ? "Exibindo 1 comunicado urgente" : `Exibindo ${count} comunicados urgentes`,
};

export const COMUNICADOS_ARQUIVO_CONFIG: ComunicadosPageConfig = {
  pageId: "comunicados-arquivo",
  path: "/comunicados/arquivo",
  kind: COMUNICADO_KIND_ARQUIVO,
  listMode: "archived",
  title: "Arquivo de Comunicados",
  description:
    "Comunicados históricos mantidos para consulta. Encontre publicações anteriores por tema, área ou período.",
  breadcrumbCurrent: "Arquivo",
  listAriaLabel: "Lista de comunicados arquivados",
  tagLabel: "Arquivo",
  tagClass: "tag--archive",
  filterChips: ["Todos", "2026", "2025", "Institucional", "TI"],
  editorTitle: "Novo comunicado arquivado",
  editorDescription: "Arquivar um comunicado histórico para consulta.",
  countLabel: (count) =>
    count === 1 ? "Exibindo 1 comunicado arquivado" : `Exibindo ${count} comunicados arquivados`,
};

export const COMUNICADOS_PAGE_CONFIGS = [
  COMUNICADOS_OFICIAIS_CONFIG,
  COMUNICADOS_DEPARTAMENTAIS_CONFIG,
  COMUNICADOS_URGENTES_CONFIG,
  COMUNICADOS_ARQUIVO_CONFIG,
] as const;

export const COMUNICADOS_EDITOR_CONFIGS = [
  COMUNICADOS_OFICIAIS_CONFIG,
  COMUNICADOS_DEPARTAMENTAIS_CONFIG,
  COMUNICADOS_URGENTES_CONFIG,
] as const;

export function getComunicadosConfigByPath(path: string): ComunicadosPageConfig | undefined {
  return COMUNICADOS_PAGE_CONFIGS.find((config) => config.path === path);
}

export function injectComunicadosPageStyles(pageId: string): () => void {
  const assets = pageAssets[pageId];
  if (!assets?.styles) return () => undefined;
  return injectScopedPageStyle(pageId, assets.styles);
}

export function comunicadoReaderId(comunicado: { id: string; slug?: string | null }): string {
  return comunicado.slug ?? comunicado.id;
}
