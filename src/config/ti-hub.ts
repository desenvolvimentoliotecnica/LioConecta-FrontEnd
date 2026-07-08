import { tiLinks } from "./navigation";
import type { HubRecentItem, HubSection } from "./pessoas-hub";

export const TI_HUB_PATH = "/servicos/ti";

const TI_META: Record<string, { description: string; icon: string; mod: string; count: string }> = {
  "help-desk": {
    description: "Abra chamados, acompanhe incidentes e tire dúvidas com o suporte.",
    icon: "fa-headset",
    mod: "help-desk",
    count: "2 chamados abertos",
  },
  "solicitar-equipamento": {
    description: "Solicite notebooks, periféricos e acessórios de TI.",
    icon: "fa-laptop",
    mod: "equipamento",
    count: "Catálogo disponível",
  },
  "acesso-sistemas": {
    description: "Hub corporativo com links para sistemas internos e externos por ambiente.",
    icon: "fa-table-cells",
    mod: "acesso",
    count: "Catálogo dinâmico",
  },
  "vpn-acesso-remoto": {
    description: "Configure VPN e acesse a rede corporativa remotamente.",
    icon: "fa-shield-halved",
    mod: "vpn",
    count: "Guia passo a passo",
  },
};

export const TI_SECTIONS: HubSection[] = tiLinks.map((link) => {
  const slug = link.path.split("/").pop() ?? link.path;
  const meta = TI_META[slug] ?? {
    description: "Serviço de Tecnologia da Informação.",
    icon: "fa-laptop-code",
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

export const TI_RECENT: HubRecentItem[] = [
  {
    id: "ti-chamado",
    title: "Chamado #4821 — VPN instável",
    section: "Help Desk",
    date: "Hoje",
    href: "/servicos/help-desk",
    icon: "fa-headset",
  },
  {
    id: "ti-equipamento",
    title: "Solicitação de monitor — aprovada",
    section: "Solicitar equipamento",
    date: "Ontem",
    href: "/servicos/solicitar-equipamento",
    icon: "fa-laptop",
  },
  {
    id: "ti-acesso",
    title: "Acesso ao ERP — pendente",
    section: "Acesso a sistemas",
    date: "30 jun 2026",
    href: "/servicos/acesso-sistemas",
    icon: "fa-key",
  },
  {
    id: "ti-vpn",
    title: "Configuração VPN — MacBook",
    section: "VPN e acesso remoto",
    date: "28 jun 2026",
    href: "/servicos/vpn-acesso-remoto",
    icon: "fa-shield-halved",
  },
];

export function filterTiSections(query: string): HubSection[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return TI_SECTIONS;
  return TI_SECTIONS.filter(
    (section) =>
      section.label.toLowerCase().includes(normalized) ||
      section.description.toLowerCase().includes(normalized),
  );
}
