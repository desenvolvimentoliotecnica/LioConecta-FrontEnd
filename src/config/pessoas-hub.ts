import { pessoasLinks } from "./navigation";

export type HubSection = {
  id: string;
  label: string;
  path: string;
  description: string;
  icon: string;
  mod: string;
  count: string;
  disabled?: boolean;
};

export type HubRecentItem = {
  id: string;
  title: string;
  section: string;
  date: string;
  href: string;
  icon: string;
};

export const PESSOAS_SECTIONS: HubSection[] = [
  {
    id: "diretorio",
    label: pessoasLinks[0].label,
    path: pessoasLinks[0].path,
    description: "Busque colegas por nome, área, cargo ou unidade.",
    icon: "fa-address-book",
    mod: "diretorio",
    count: "842 colaboradores",
  },
  {
    id: "novos",
    label: pessoasLinks[1].label,
    path: pessoasLinks[1].path,
    description: "Conheça quem acabou de entrar na Liotécnica.",
    icon: "fa-user-plus",
    mod: "novos",
    count: "6 este mês",
  },
  {
    id: "aniversariantes",
    label: pessoasLinks[2].label,
    path: pessoasLinks[2].path,
    description: "Celebre e parabenize colegas que fazem aniversário.",
    icon: "fa-cake-candles",
    mod: "aniversariantes",
    count: "12 esta semana",
  },
  {
    id: "organograma",
    label: pessoasLinks[3].label,
    path: pessoasLinks[3].path,
    description: "Visualize a estrutura hierárquica por área e time.",
    icon: "fa-sitemap",
    mod: "organograma",
    count: "18 departamentos",
  },
  {
    id: "ramais",
    label: pessoasLinks[4].label,
    path: pessoasLinks[4].path,
    description: "Consulte ramais por nome, departamento ou número.",
    icon: "fa-phone",
    mod: "ramais",
    count: "295 ramais",
  },
];

export const PESSOAS_RECENT: HubRecentItem[] = [
  {
    id: "pessoa-julia",
    title: "Julia Santos",
    section: "Marketing · Analista",
    date: "Acessado hoje",
    href: "/pessoas/perfil",
    icon: "fa-user",
  },
  {
    id: "pessoa-carlos",
    title: "Carlos Mendes",
    section: "TI · Coordenador",
    date: "Ontem",
    href: "/pessoas/diretorio",
    icon: "fa-user",
  },
  {
    id: "pessoa-organograma",
    title: "Organograma — Tecnologia",
    section: "Organograma",
    date: "02 jul 2026",
    href: "/pessoas/organograma",
    icon: "fa-sitemap",
  },
  {
    id: "pessoa-aniv",
    title: "Aniversariantes de julho",
    section: "Aniversariantes",
    date: "01 jul 2026",
    href: "/pessoas/aniversariantes",
    icon: "fa-cake-candles",
  },
];

export function filterPessoasSections(query: string): HubSection[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return PESSOAS_SECTIONS;
  return PESSOAS_SECTIONS.filter(
    (section) =>
      section.label.toLowerCase().includes(normalized) ||
      section.description.toLowerCase().includes(normalized),
  );
}
