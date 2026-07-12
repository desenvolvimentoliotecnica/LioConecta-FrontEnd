import { documentosLinks } from "./navigation";

export type DocumentSection = {
  id: string;
  label: string;
  path: string;
  description: string;
  icon: string;
  mod: string;
  count: string;
};

export type RecentDocument = {
  id: string;
  title: string;
  section: string;
  date: string;
  href: string;
};

export const DOCUMENT_SECTIONS: DocumentSection[] = [
  {
    id: "politicas",
    label: documentosLinks[0].label,
    path: documentosLinks[0].path,
    description: "Normas, regulamentos e diretrizes corporativas vigentes.",
    icon: "fa-shield-halved",
    mod: "politicas",
    count: "24 documentos",
  },
  {
    id: "manuais",
    label: documentosLinks[1].label,
    path: documentosLinks[1].path,
    description: "Guias operacionais, fluxos de trabalho e instruções por área.",
    icon: "fa-book",
    mod: "manuais",
    count: "18 documentos",
  },
  {
    id: "formularios",
    label: documentosLinks[2].label,
    path: documentosLinks[2].path,
    description: "Formulários oficiais para solicitações, cadastros e registros.",
    icon: "fa-file-pen",
    mod: "formularios",
    count: "32 formulários",
  },
  {
    id: "modelos",
    label: documentosLinks[3].label,
    path: documentosLinks[3].path,
    description: "Templates de e-mails, apresentações, contratos e comunicações.",
    icon: "fa-copy",
    mod: "modelos",
    count: "15 modelos",
  },
  {
    id: "biblioteca",
    label: documentosLinks[4].label,
    path: documentosLinks[4].path,
    description: "Acervo completo de materiais de referência e publicações internas.",
    icon: "fa-books",
    mod: "biblioteca",
    count: "56 publicações",
  },
  {
    id: "wiki",
    label: documentosLinks[5].label,
    path: documentosLinks[5].path,
    description: "Base de conhecimento de TI — acesso, hardware e software.",
    icon: "fa-book-open",
    mod: "wiki",
    count: "6 artigos",
  },
];

export const RECENT_DOCUMENTS: RecentDocument[] = [
  {
    id: "doc-viagens",
    title: "Política de viagens e despesas",
    section: "Biblioteca corporativa",
    date: "03 jul 2026",
    href: "/documentos/biblioteca",
  },
  {
    id: "doc-seguranca",
    title: "Política de segurança da informação",
    section: "Políticas internas",
    date: "02 jul 2026",
    href: "/documentos/politicas-internas",
  },
  {
    id: "doc-ferias",
    title: "Formulário de solicitação de férias",
    section: "Formulários",
    date: "28 jun 2026",
    href: "/documentos/formularios",
  },
  {
    id: "doc-onboarding",
    title: "Manual de onboarding",
    section: "Manuais e procedimentos",
    date: "25 jun 2026",
    href: "/documentos/manuais-procedimentos",
  },
  {
    id: "doc-comunicado",
    title: "Modelo de comunicado departamental",
    section: "Modelos de documentos",
    date: "20 jun 2026",
    href: "/documentos/modelos",
  },
];

export const DOCUMENTOS_HUB_PATH = "/documentos";

export function filterDocumentSections(query: string): DocumentSection[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return DOCUMENT_SECTIONS;
  return DOCUMENT_SECTIONS.filter(
    (section) =>
      section.label.toLowerCase().includes(normalized) ||
      section.description.toLowerCase().includes(normalized),
  );
}
