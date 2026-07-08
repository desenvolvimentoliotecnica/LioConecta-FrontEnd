import type { NavLinkItem } from "./navigation";
import {
  FEED_PATH,
  comunicadosLinks,
  documentosLinks,
  facilitiesLinks,
  gruposLinks,
  juridicoLinks,
  pessoasLinks,
  servicosLinks,
  tiLinks,
} from "./navigation";

export type PageMaturity = "integrated" | "partial" | "prototype" | "soon";

export const MATURITY_META: Record<PageMaturity, { label: string; className: string }> = {
  integrated: { label: "Integrado", className: "topbar__maturity-badge--integrated" },
  partial: { label: "Parcial", className: "topbar__maturity-badge--partial" },
  prototype: { label: "Protótipo", className: "topbar__maturity-badge--prototype" },
  soon: { label: "Em breve", className: "topbar__maturity-badge--soon" },
};

export const PAGE_MATURITY: Record<string, PageMaturity> = {
  [FEED_PATH]: "partial",

  "/comunicados/oficiais": "integrated",
  "/comunicados/departamentais": "integrated",
  "/comunicados/urgentes": "integrated",
  "/comunicados/arquivo": "integrated",

  "/pessoas/diretorio": "partial",
  "/pessoas/novos-colaboradores": "partial",
  "/pessoas/aniversariantes": "partial",
  "/pessoas/organograma": "partial",
  "/pessoas/ramais": "integrated",

  "/grupos/meus-grupos": "partial",
  "/grupos/explorar": "integrated",
  "/grupos/criar": "integrated",
  "/grupos/aprovacoes": "integrated",

  "/documentos/politicas-internas": "prototype",
  "/documentos/manuais-procedimentos": "prototype",
  "/documentos/formularios": "prototype",
  "/documentos/modelos": "prototype",
  "/documentos/biblioteca": "prototype",

  "/servicos/beneficios": "integrated",
  "/servicos/contracheque": "integrated",
  "/servicos/ferias-ausencias": "integrated",
  "/servicos/ferias-ausencias/gestao": "integrated",
  "/servicos/solicitacoes-rh": "prototype",
  "/servicos/ponto-eletronico": "integrated",
  "/servicos/vale-transporte": "prototype",
  "/servicos/reembolso-despesas": "prototype",
  "/servicos/adiantamento-viagem": "prototype",

  "/servicos/help-desk": "integrated",
  "/servicos/solicitar-equipamento": "prototype",
  "/servicos/acesso-sistemas": "integrated",
  "/servicos/vpn-acesso-remoto": "prototype",

  "/servicos/reservas-salas": "prototype",
  "/servicos/reserva-veiculos": "prototype",
  "/servicos/cracha-visitantes": "prototype",
  "/servicos/encomendas-correios": "prototype",
  "/servicos/limpeza": "prototype",
  "/servicos/manutencao-predial": "prototype",
  "/servicos/copiadora": "prototype",
  "/servicos/estacionamento": "prototype",
  "/servicos/refeitorio": "prototype",
  "/servicos/cardapio": "integrated",
  "/servicos/climatizacao": "prototype",
  "/servicos/gestao-residuos": "prototype",

  "/servicos/declaracoes-certidoes": "prototype",
  "/servicos/assinatura-digital": "prototype",
  "/servicos/seguro-vida": "prototype",
  "/servicos/canal-denuncias": "prototype",
  "/servicos/contratos-minutas": "prototype",
  "/servicos/lgpd-privacidade": "prototype",
  "/servicos/codigo-conduta": "prototype",
  "/servicos/due-diligence": "prototype",
  "/servicos/procuracoes": "prototype",
  "/servicos/consultoria-juridica": "prototype",

  "/compass": "prototype",
  "/compass/analise-ytd": "prototype",
  "/compass/ciclo": "prototype",
  "/compass/volume": "prototype",
  "/compass/canais": "prototype",
  "/compass/financeiro": "prototype",
  "/compass/reconciliacao": "prototype",
  "/compass/reunioes": "prototype",
  "/compass/decisoes": "prototype",
  "/compass/cenarios": "prototype",
  "/compass/relatorios": "prototype",
};

export const TOPBAR_NAV_ITEMS: NavLinkItem[] = [
  { label: "Feed", path: FEED_PATH },
  ...comunicadosLinks,
  ...pessoasLinks,
  ...gruposLinks,
  ...documentosLinks,
  ...servicosLinks,
  ...tiLinks,
  ...facilitiesLinks,
  ...juridicoLinks,
];

export const MATURITY_LEGEND: PageMaturity[] = ["integrated", "partial", "prototype", "soon"];

export function getPageMaturity(path: string): PageMaturity {
  if (path === "#") return "soon";
  return PAGE_MATURITY[path] ?? "prototype";
}

export function isMaturityDone(maturity: PageMaturity): boolean {
  return maturity === "integrated" || maturity === "partial";
}

export function roadmapIdForPath(path: string, label: string): string {
  if (path === "#") {
    return `soon-${label.toLowerCase().replace(/\s+/g, "-")}`;
  }
  return path.replace(/^\//, "").replace(/\//g, "-") || "feed";
}
