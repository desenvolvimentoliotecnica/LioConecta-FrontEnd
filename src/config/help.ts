export type HelpCategory =
  | "all"
  | "inicio"
  | "feed"
  | "comunicados"
  | "pessoas"
  | "grupos"
  | "documentos"
  | "servicos"
  | "conta";

export type HelpArticle = {
  id: string;
  category: HelpCategory;
  question: string;
  answer: string;
  href?: string;
  hrefLabel?: string;
};

export type HelpContact = {
  id: string;
  title: string;
  description: string;
  icon: string;
  mod: string;
  channel: string;
  hours: string;
  href: string;
};

export type HelpGuide = {
  id: string;
  title: string;
  description: string;
  icon: string;
  mod: string;
  href: string;
};

export const HELP_CATEGORIES: { id: HelpCategory; label: string; icon: string }[] = [
  { id: "all", label: "Todas", icon: "fa-circle-question" },
  { id: "inicio", label: "Primeiros passos", icon: "fa-rocket" },
  { id: "feed", label: "Feed", icon: "fa-rss" },
  { id: "comunicados", label: "Comunicados", icon: "fa-bullhorn" },
  { id: "pessoas", label: "Pessoas", icon: "fa-users" },
  { id: "grupos", label: "Grupos", icon: "fa-people-group" },
  { id: "documentos", label: "Documentos", icon: "fa-folder-open" },
  { id: "servicos", label: "Serviços", icon: "fa-briefcase" },
  { id: "conta", label: "Conta e suporte", icon: "fa-user-gear" },
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: "primeiro-acesso",
    category: "inicio",
    question: "Como faço meu primeiro acesso ao LioConecta?",
    answer:
      "Use suas credenciais corporativas (e-mail @liotecnica.com.br e senha de rede). Na primeira entrada, complete seu perfil em Pessoas e explore o feed para acompanhar comunicados e novidades da empresa.",
    href: "/pessoas/perfil",
    hrefLabel: "Ir para meu perfil",
  },
  {
    id: "navegacao-portal",
    category: "inicio",
    question: "Como navegar pelo portal?",
    answer:
      "O menu superior concentra Feed, Comunicados, Pessoas, Grupos, Documentos e Serviços. Os menus laterais dão acesso rápido a Início, Analytics, Ajuda e atalhos. Use a busca global para encontrar pessoas, grupos e documentos.",
    href: "/",
    hrefLabel: "Voltar ao feed",
  },
  {
    id: "publicar-feed",
    category: "feed",
    question: "Como publicar no feed corporativo?",
    answer:
      "Na página inicial, use o compositor no topo para criar publicações, compartilhar atualizações ou participar de enquetes. Você pode mencionar colegas, adicionar hashtags e reagir às publicações de outras áreas.",
    href: "/",
    hrefLabel: "Abrir feed",
  },
  {
    id: "enquetes-feed",
    category: "feed",
    question: "Como participo de enquetes e celebrações?",
    answer:
      "Enquetes aparecem como cards no feed — basta selecionar uma opção e confirmar. Celebrações e parabenizações podem ser comentadas; use o campo de comentários para enviar mensagens à equipe.",
  },
  {
    id: "comunicados-oficiais",
    category: "comunicados",
    question: "Onde encontro comunicados oficiais e urgentes?",
    answer:
      "Acesse Comunicados no menu superior: Oficiais, Departamentais, Urgentes ou Arquivo. Comunicados urgentes também geram notificação. Ao abrir um item, a leitura completa fica disponível com histórico e autor.",
    href: "/comunicados/oficiais",
    hrefLabel: "Ver comunicados oficiais",
  },
  {
    id: "comunicado-lido",
    category: "comunicados",
    question: "Como sei se li todos os comunicados obrigatórios?",
    answer:
      "Comunicados não lidos aparecem nas Notificações e podem exibir destaque no feed. Consulte Comunicados > Urgentes para pendências com prazo e Comunicados > Arquivo para histórico.",
    href: "/notificacoes",
    hrefLabel: "Ver notificações",
  },
  {
    id: "diretorio-pessoas",
    category: "pessoas",
    question: "Como encontrar um colega no diretório?",
    answer:
      "Em Pessoas > Diretório, busque por nome, área ou cargo. Você também pode explorar Novos colaboradores, Aniversariantes do mês e o Organograma para entender a estrutura da empresa.",
    href: "/pessoas/diretorio",
    hrefLabel: "Abrir diretório",
  },
  {
    id: "organograma",
    category: "pessoas",
    question: "Como usar o organograma?",
    answer:
      "O organograma exibe a hierarquia por área e unidade. Clique em um colaborador para ver o perfil resumido e navegue entre níveis para encontrar lideranças e equipes.",
    href: "/pessoas/organograma",
    hrefLabel: "Abrir organograma",
  },
  {
    id: "grupos-entrar",
    category: "grupos",
    question: "Como entrar ou criar um grupo?",
    answer:
      "Em Grupos > Meus grupos veja os que você já participa. Em Explorar grupos, descubra comunidades por tema. Para criar um novo grupo, use Grupos > Criar grupo e defina nome, descrição e membros.",
    href: "/grupos/explorar",
    hrefLabel: "Explorar grupos",
  },
  {
    id: "documentos-politicas",
    category: "documentos",
    question: "Onde consulto políticas e formulários?",
    answer:
      "Documentos reúne Políticas internas, Manuais, Formulários, Modelos e a Biblioteca corporativa. Use filtros e busca para localizar versões vigentes antes de solicitar serviços relacionados.",
    href: "/documentos/politicas-internas",
    hrefLabel: "Ver políticas internas",
  },
  {
    id: "ferias-rh",
    category: "servicos",
    question: "Como solicitar férias ou consultar contracheque?",
    answer:
      "Em Serviços > RH & Pessoas, acesse Férias e ausências ou Contracheque. Preencha o formulário com as datas desejadas; o RH recebe a solicitação e você acompanha o status pelas notificações.",
    href: "/servicos/ferias-ausencias",
    hrefLabel: "Solicitar férias",
  },
  {
    id: "help-desk",
    category: "servicos",
    question: "Preciso de suporte de TI — o que faço?",
    answer:
      "Abra Serviços > TI & Suporte > Help Desk para registrar chamados de hardware, software, acesso a sistemas ou VPN. Para equipamentos novos, use Solicitar equipamento.",
    href: "/servicos/help-desk",
    hrefLabel: "Abrir Help Desk",
  },
  {
    id: "facilities-reserva",
    category: "servicos",
    question: "Como reservar sala ou veículo?",
    answer:
      "Em Serviços > Facilities, escolha Reservas de salas ou Reserva de veículos. Informe data, horário e finalidade. Outros serviços de Facilities incluem crachá, encomendas e manutenção predial.",
    href: "/servicos/reservas-salas",
    hrefLabel: "Reservar sala",
  },
  {
    id: "facilities-cardapio",
    category: "servicos",
    question: "Onde consulto o cardápio do refeitório?",
    answer:
      "Acesse Serviços > Facilities > Gestão de cardápio para ver a semana completa. O cardápio do dia também aparece no painel lateral do Calendário ao selecionar uma data.",
    href: "/servicos/cardapio",
    hrefLabel: "Ver cardápio",
  },
  {
    id: "notificacoes-ajuda",
    category: "conta",
    question: "Como gerencio minhas notificações?",
    answer:
      "Clique no sino na barra superior ou acesse Notificações pelo menu. Filtre por Comunicados, RH, Pessoas, Documentos, Serviços ou Grupos. Marque como lidas individualmente ou todas de uma vez.",
    href: "/notificacoes",
    hrefLabel: "Ver notificações",
  },
  {
    id: "chat-interno",
    category: "conta",
    question: "Como usar o chat interno?",
    answer:
      "O chat interno usa Microsoft Teams por trás: clique em Mensagens na barra superior para ver conversas sincronizadas. Na primeira vez, vincule sua conta corporativa do Teams quando solicitado. Depois disso, envie mensagens diretas e acompanhe respostas em tempo real pelo portal.",
  },
  {
    id: "analytics-ajuda",
    category: "conta",
    question: "O que é a página Analytics?",
    answer:
      "Analytics consolida métricas de uso do portal — engajamento no feed, leitura de comunicados, solicitações de serviços e mais. Gestores e curiosos podem filtrar por período e módulo.",
    href: "/analytics",
    hrefLabel: "Abrir Analytics",
  },
  {
    id: "senha-acesso",
    category: "conta",
    question: "Esqueci minha senha ou não consigo acessar.",
    answer:
      "Para reset de senha corporativa, contate o Help Desk de TI. Problemas de permissão em serviços específicos devem ser direcionados à área responsável (RH, Facilities ou Jurídico).",
    href: "/servicos/help-desk",
    hrefLabel: "Contatar Help Desk",
  },
];

export const HELP_CONTACTS: HelpContact[] = [
  {
    id: "help-desk",
    title: "Help Desk TI",
    description: "Suporte técnico, acessos, equipamentos e VPN.",
    icon: "fa-headset",
    mod: "ti",
    channel: "helpdesk@liotecnica.com.br · ramal 2200",
    hours: "Seg–Sex, 8h às 18h",
    href: "/servicos/help-desk",
  },
  {
    id: "rh",
    title: "Recursos Humanos",
    description: "Férias, benefícios, contracheque e dúvidas trabalhistas.",
    icon: "fa-user-group",
    mod: "rh",
    channel: "rh@liotecnica.com.br · ramal 2100",
    hours: "Seg–Sex, 9h às 17h",
    href: "/servicos/solicitacoes-rh",
  },
  {
    id: "facilities",
    title: "Facilities",
    description: "Salas, veículos, crachá, encomendas e manutenção.",
    icon: "fa-building",
    mod: "facilities",
    channel: "facilities@liotecnica.com.br · ramal 2300",
    hours: "Seg–Sex, 8h às 17h",
    href: "/servicos/reservas-salas",
  },
  {
    id: "juridico",
    title: "Jurídico & Compliance",
    description: "LGPD, código de conduta, denúncias e consultoria.",
    icon: "fa-scale-balanced",
    mod: "juridico",
    channel: "juridico@liotecnica.com.br · ramal 2400",
    hours: "Seg–Sex, 9h às 16h",
    href: "/servicos/canal-denuncias",
  },
];

export const HELP_GUIDES: HelpGuide[] = [
  {
    id: "guide-feed",
    title: "Feed e colaboração",
    description: "Publicações, reações, enquetes e interação entre áreas.",
    icon: "fa-rss",
    mod: "feed",
    href: "/",
  },
  {
    id: "guide-comunicados",
    title: "Comunicados institucionais",
    description: "Oficiais, departamentais, urgentes e arquivo.",
    icon: "fa-bullhorn",
    mod: "comunicados",
    href: "/comunicados/oficiais",
  },
  {
    id: "guide-pessoas",
    title: "Pessoas e organograma",
    description: "Diretório, perfis, aniversariantes e estrutura.",
    icon: "fa-users",
    mod: "pessoas",
    href: "/pessoas/diretorio",
  },
  {
    id: "guide-servicos",
    title: "Serviços digitais",
    description: "RH, TI, Facilities e Jurídico em um só lugar.",
    icon: "fa-briefcase",
    mod: "servicos",
    href: "/servicos/beneficios",
  },
];

export function filterHelpArticles(
  articles: HelpArticle[],
  category: HelpCategory,
  query: string,
): HelpArticle[] {
  const normalized = query.trim().toLowerCase();
  return articles.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (!normalized) return true;
    return (
      item.question.toLowerCase().includes(normalized) ||
      item.answer.toLowerCase().includes(normalized)
    );
  });
}
