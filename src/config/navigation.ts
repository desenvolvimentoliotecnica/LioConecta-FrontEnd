import { PERMISSIONS } from "./rbac/permissions";

export type NavLinkItem = {
  label: string;
  path: string;
  benefitsManageOnly?: boolean;
  leaveManageOnly?: boolean;
  pontoManageOnly?: boolean;
  payslipsAuditOnly?: boolean;
  /** Single key or OR-list — hide unless the user has at least one. */
  permission?: string | readonly string[];
};

export type NavDropdown = {
  label: string;
  id: string;
  items: NavLinkItem[];
  services?: boolean;
  headings?: { label: string; className: string; icon: string }[];
};

export const FEED_PATH = "/";

export const comunicadosLinks: NavLinkItem[] = [
  { label: "Oficiais", path: "/comunicados/oficiais" },
  { label: "Departamentais", path: "/comunicados/departamentais" },
  { label: "Urgentes", path: "/comunicados/urgentes" },
  { label: "Arquivo", path: "/comunicados/arquivo" },
  { label: "Notícias", path: "/noticias" },
];

export const pessoasLinks: NavLinkItem[] = [
  { label: "Diretório", path: "/pessoas/diretorio" },
  { label: "Novos colaboradores", path: "/pessoas/novos-colaboradores" },
  { label: "Aniversariantes", path: "/pessoas/aniversariantes" },
  { label: "Organograma", path: "/pessoas/organograma" },
  { label: "Lista de Ramais", path: "/pessoas/ramais" },
];

export const gruposLinks: NavLinkItem[] = [
  { label: "Meus grupos", path: "/grupos/meus-grupos" },
  { label: "Explorar grupos", path: "/grupos/explorar" },
  { label: "Criar grupo", path: "/grupos/criar" },
  { label: "Aprovações", path: "/grupos/aprovacoes" },
];

export const documentosLinks: NavLinkItem[] = [
  { label: "Políticas internas", path: "/documentos/politicas-internas" },
  { label: "Manuais e procedimentos", path: "/documentos/manuais-procedimentos" },
  { label: "Formulários", path: "/documentos/formularios" },
  { label: "Modelos de documentos", path: "/documentos/modelos" },
  { label: "Biblioteca corporativa", path: "/documentos/biblioteca" },
  { label: "Wiki", path: "/documentos/wiki" },
];

export const servicosLinks: NavLinkItem[] = [
  { label: "Benefícios", path: "/servicos/beneficios" },
  { label: "Gestão de benefícios", path: "/servicos/beneficios/gestao", benefitsManageOnly: true },
  { label: "Contracheque", path: "/servicos/contracheque" },
  { label: "Acessos ao contracheque", path: "/servicos/contracheque/acessos", payslipsAuditOnly: true },
  { label: "Férias e ausências", path: "/servicos/ferias-ausencias" },
  { label: "Gestão de férias", path: "/servicos/ferias-ausencias/gestao", leaveManageOnly: true },
  { label: "Solicitações RH", path: "/servicos/solicitacoes-rh" },
  { label: "Clima organizacional", path: "/servicos/clima" },
  { label: "Feedback", path: "/feedback" },
  { label: "Triagem de feedback", path: "/feedback/triagem" },
  { label: "Ponto eletrônico", path: "/servicos/ponto-eletronico" },
  { label: "Gestão de ponto", path: "/servicos/ponto-eletronico/gestao", pontoManageOnly: true },
  { label: "Movimentações", path: "/servicos/movimentacoes" },
  {
    label: "Vale-transporte",
    path: "/servicos/vale-transporte",
    permission: [PERMISSIONS.transport.read, PERMISSIONS.transport.manage],
  },
  {
    label: "Reembolso de despesas",
    path: "/servicos/reembolso-despesas",
    permission: [PERMISSIONS.reimbursement.read, PERMISSIONS.reimbursement.manage],
  },
  {
    label: "Adiantamento de viagem",
    path: "/servicos/adiantamento-viagem",
    permission: [PERMISSIONS.travelAdvance.read, PERMISSIONS.travelAdvance.manage],
  },
];

export const tiLinks: NavLinkItem[] = [
  { label: "Help Desk", path: "/servicos/help-desk" },
  { label: "Solicitar equipamento", path: "/servicos/solicitar-equipamento" },
  { label: "Acesso a sistemas", path: "/servicos/acesso-sistemas" },
  { label: "VPN e acesso remoto", path: "/servicos/vpn-acesso-remoto" },
];

export const facilitiesLinks: NavLinkItem[] = [
  { label: "Reservas de salas", path: "/servicos/reservas-salas" },
  { label: "Reserva de veículos", path: "/servicos/reserva-veiculos" },
  { label: "Crachá e visitantes", path: "/servicos/cracha-visitantes" },
  { label: "Encomendas e correios", path: "/servicos/encomendas-correios" },
  { label: "Limpeza e higienização", path: "/servicos/limpeza" },
  { label: "Manutenção predial", path: "/servicos/manutencao-predial" },
  { label: "Copiadora e impressão", path: "/servicos/copiadora" },
  { label: "Estacionamento", path: "/servicos/estacionamento" },
  { label: "Refeitório e copa", path: "/servicos/refeitorio" },
  { label: "Gestão de cardápio", path: "/servicos/cardapio" },
  { label: "Climatização", path: "/servicos/climatizacao" },
  { label: "Gestão de resíduos", path: "/servicos/gestao-residuos" },
];

export const juridicoLinks: NavLinkItem[] = [
  { label: "Declarações e certidões", path: "/servicos/declaracoes-certidoes" },
  { label: "Assinatura digital", path: "/servicos/assinatura-digital" },
  { label: "Seguro de vida", path: "/servicos/seguro-vida" },
  { label: "Canal de denúncias", path: "/servicos/canal-denuncias" },
  { label: "Contratos e minutas", path: "/servicos/contratos-minutas" },
  { label: "LGPD e privacidade", path: "/servicos/lgpd-privacidade" },
  { label: "Código de conduta", path: "/servicos/codigo-conduta" },
  { label: "Due diligence", path: "/servicos/due-diligence" },
  { label: "Procurações e poderes", path: "/servicos/procuracoes" },
  { label: "Consultoria jurídica", path: "/servicos/consultoria-juridica" },
];

export const adminLinks: NavLinkItem[] = [
  { label: "Configurações do Backend", path: "/admin/configuracoes-backend" },
  { label: "Controle de acesso", path: "/admin/controle-acesso" },
  { label: "Trilha de auditoria", path: "/admin/trilha-auditoria" },
  { label: "Observabilidade", path: "/admin/observabilidade" },
  { label: "Workers", path: "/admin/workers" },
  { label: "TOTVS RM — Ponto", path: "/admin/totvs-rm" },
  { label: "E-mail — Fila", path: "/admin/email" },
  { label: "E-mail — SMTP", path: "/admin/email/config" },
  { label: "Governança do organograma", path: "/admin/governanca/organograma" },
];

export const allServicosLinks: NavLinkItem[] = [
  ...servicosLinks,
  ...tiLinks,
  ...facilitiesLinks,
  ...juridicoLinks,
];

export const servicosHeadings = [
  { label: "RH & Pessoas", className: "topbar__menu-heading--rh", icon: "fa-user-group" },
  { label: "Financeiro", className: "topbar__menu-heading--financeiro", icon: "fa-coins" },
  { label: "TI & Suporte", className: "topbar__menu-heading--ti", icon: "fa-headset" },
  { label: "Facilities", className: "topbar__menu-heading--facilities", icon: "fa-building" },
  { label: "Jurídico & Compliance", className: "topbar__menu-heading--juridico", icon: "fa-scale-balanced" },
];

export const pessoasSectionPrefix = "/pessoas/";

export const documentosSectionPrefix = "/documentos/";

export const gruposSectionPrefix = "/grupos/";

export function isGruposSectionActive(pathname: string): boolean {
  return pathname === "/grupos" || pathname.startsWith(gruposSectionPrefix);
}

export function isDocumentosSectionActive(pathname: string): boolean {
  return pathname === "/documentos" || pathname.startsWith(documentosSectionPrefix);
}

export function isComunicadosSectionActive(pathname: string): boolean {
  return (
    pathname === "/comunicados" ||
    pathname.startsWith("/comunicados/") ||
    pathname === "/noticias" ||
    pathname.startsWith("/noticias/")
  );
}

export function isDropdownActive(pathname: string, items: NavLinkItem[]): boolean {
  return items.some((item) => item.path !== "#" && pathname.startsWith(item.path));
}

export function isPessoasSectionActive(pathname: string): boolean {
  return pathname === "/pessoas" || pathname.startsWith(pessoasSectionPrefix);
}
