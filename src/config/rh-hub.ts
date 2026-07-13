import { canAccessServicosNavItem } from "../api/auth";
import type { MeDto } from "../api/types";
import { servicosLinks } from "./navigation";
import type { HubRecentItem, HubSection } from "./pessoas-hub";

export const RH_HUB_PATH = "/servicos/rh";

const RH_ICONS: Record<string, string> = {
  beneficios: "fa-gift",
  contracheque: "fa-money-check-dollar",
  ferias: "fa-umbrella-beach",
  solicitacoes: "fa-file-signature",
  ponto: "fa-clock",
  "vale-transporte": "fa-bus",
};

const RH_DESCRIPTIONS: Record<string, string> = {
  beneficios: "Planos de saúde, alimentação, mobilidade e qualidade de vida.",
  contracheque: "Consulte holerites e histórico de pagamentos.",
  ferias: "Solicite, acompanhe e consulte saldo de férias e ausências.",
  solicitacoes: "Abra e acompanhe demandas junto ao time de RH.",
  ponto: "Registros, espelho de ponto e ajustes de jornada.",
  "vale-transporte": "Solicitações e alterações de benefício de transporte.",
};

const RH_COUNTS: Record<string, string> = {
  beneficios: "12 benefícios",
  contracheque: "Últimos 12 meses",
  ferias: "3 solicitações abertas",
  solicitacoes: "Central de atendimento",
  ponto: "Espelho mensal",
  "vale-transporte": "Cartão ativo",
};

const RH_MOD: Record<string, string> = {
  beneficios: "beneficios",
  contracheque: "contracheque",
  "ferias-ausencias": "ferias",
  "solicitacoes-rh": "solicitacoes",
  "ponto-eletronico": "ponto",
  "vale-transporte": "vale-transporte",
};

function toRhSection(link: (typeof servicosLinks)[number]): HubSection {
  const slug = link.path.split("/").pop() ?? link.path;
  return {
    id: slug,
    label: link.label,
    path: link.path,
    description: RH_DESCRIPTIONS[slug] ?? "Serviço de Recursos Humanos.",
    icon: RH_ICONS[slug] ?? "fa-user-group",
    mod: RH_MOD[slug] ?? slug,
    count: RH_COUNTS[slug] ?? "Disponível",
  };
}

export const RH_SECTIONS: HubSection[] = servicosLinks.map(toRhSection);

export const RH_RECENT: HubRecentItem[] = [
  {
    id: "rh-ferias",
    title: "Solicitação de férias — julho",
    section: "Férias e ausências",
    date: "Hoje",
    href: "/servicos/ferias-ausencias",
    icon: "fa-umbrella-beach",
  },
  {
    id: "rh-contracheque",
    title: "Contracheque — junho 2026",
    section: "Contracheque",
    date: "Ontem",
    href: "/servicos/contracheque",
    icon: "fa-money-check-dollar",
  },
  {
    id: "rh-beneficios",
    title: "Plano de saúde — dependentes",
    section: "Benefícios",
    date: "02 jul 2026",
    href: "/servicos/beneficios",
    icon: "fa-gift",
  },
  {
    id: "rh-solicitacao",
    title: "Declaração de vínculo",
    section: "Solicitações RH",
    date: "28 jun 2026",
    href: "/servicos/solicitacoes-rh",
    icon: "fa-file-signature",
  },
];

export function filterRhSections(query: string, me?: MeDto | null): HubSection[] {
  const visible = servicosLinks
    .filter((link) => canAccessServicosNavItem(me ?? undefined, link))
    .map(toRhSection);
  const normalized = query.trim().toLowerCase();
  if (!normalized) return visible;
  return visible.filter(
    (section) =>
      section.label.toLowerCase().includes(normalized) ||
      section.description.toLowerCase().includes(normalized),
  );
}
