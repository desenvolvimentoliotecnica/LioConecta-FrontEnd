export type PageHeadSection =
  | "pessoas"
  | "rh"
  | "ti"
  | "facilities"
  | "juridico"
  | "documentos"
  | "grupos"
  | "comunicados"
  | "plataforma";

export type PageHeadSectionMeta = {
  hubPath?: string;
  hubLabel: string;
};

export const PAGE_HEAD_SECTIONS: Record<PageHeadSection, PageHeadSectionMeta> = {
  pessoas: { hubPath: "/pessoas", hubLabel: "Pessoas" },
  rh: { hubPath: "/servicos/rh", hubLabel: "RH & Pessoas" },
  ti: { hubPath: "/servicos/ti", hubLabel: "TI & Suporte" },
  facilities: { hubLabel: "Facilities" },
  juridico: { hubLabel: "Jurídico & Compliance" },
  documentos: { hubPath: "/documentos", hubLabel: "Documentos" },
  grupos: { hubPath: "/grupos", hubLabel: "Grupos" },
  comunicados: { hubPath: "/comunicados", hubLabel: "Comunicados" },
  plataforma: { hubPath: "/admin/configuracoes-backend", hubLabel: "Administração" },
};

const TI_PAGE_IDS = new Set([
  "servicos-help-desk",
  "servicos-solicitar-equipamento",
  "servicos-acesso-sistemas",
  "servicos-vpn-acesso-remoto",
]);

const RH_PAGE_IDS = new Set([
  "servicos-rh",
  "servicos-vale-transporte",
  "servicos-reembolso",
  "servicos-adiantamento",
]);

const FACILITIES_PAGE_IDS = new Set([
  "servicos-reservas-salas",
  "servicos-reserva-veiculos",
  "servicos-cracha-visitantes",
  "servicos-encomendas-correios",
  "servicos-limpeza",
  "servicos-manutencao-predial",
  "servicos-copiadora",
  "servicos-estacionamento",
  "servicos-refeitorio",
  "servicos-climatizacao",
  "servicos-gestao-residuos",
]);

const JURIDICO_PAGE_IDS = new Set([
  "servicos-declaracoes-certidoes",
  "servicos-assinatura-digital",
  "servicos-seguro-vida",
  "servicos-canal-denuncias",
  "servicos-contratos-minutas",
  "servicos-lgpd-privacidade",
  "servicos-codigo-conduta",
  "servicos-due-diligence",
  "servicos-procuracoes",
  "servicos-consultoria-juridica",
]);

const PESSOAS_PAGE_HEAD_IDS = new Set([
  "pessoas-organograma",
  "pessoas-diretorio",
  "pessoas-novos-colaboradores",
  "pessoas-aniversariantes",
]);

const RH_PAGE_HEAD_IDS = RH_PAGE_IDS;

const SECTION_PAGE_HEAD_IDS = new Set<string>([
  ...PESSOAS_PAGE_HEAD_IDS,
  ...RH_PAGE_HEAD_IDS,
  ...TI_PAGE_IDS,
  ...FACILITIES_PAGE_IDS,
  ...JURIDICO_PAGE_IDS,
  "documentos-biblioteca",
  "documentos-formularios",
  "documentos-manuais",
  "documentos-modelos",
  "documentos-politicas",
  "grupos-criar-grupo",
  "grupos-explorar",
  "grupos-meus-grupos",
  "comunicados-arquivo",
  "comunicados-departamentais",
  "comunicados-oficiais",
  "comunicados-urgentes",
]);

export function getPageHeadSection(pageId: string): PageHeadSection | null {
  if (pageId.startsWith("pessoas-") && pageId !== "pessoas-perfil") return "pessoas";
  if (pageId.startsWith("documentos-")) return "documentos";
  if (pageId.startsWith("grupos-")) return "grupos";
  if (pageId.startsWith("comunicados-")) return "comunicados";
  if (TI_PAGE_IDS.has(pageId)) return "ti";
  if (RH_PAGE_IDS.has(pageId)) return "rh";
  if (FACILITIES_PAGE_IDS.has(pageId)) return "facilities";
  if (JURIDICO_PAGE_IDS.has(pageId)) return "juridico";
  return null;
}

export function usesSectionPageHead(pageId: string): boolean {
  return SECTION_PAGE_HEAD_IDS.has(pageId);
}

export function sectionMainClass(section: PageHeadSection): string {
  return `main main--section-${section}`;
}
