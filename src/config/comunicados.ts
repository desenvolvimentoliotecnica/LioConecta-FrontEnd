export type ComunicadoKind = "oficial" | "departamental" | "urgente" | "arquivo";

export type Comunicado = {
  id: string;
  kind: ComunicadoKind;
  tag: string;
  tagClass: string;
  listLabel: string;
  listPath: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  authorAvatar: string;
  heroImage: string;
  paragraphs: string[];
};

function body(
  excerpt: string,
  middle = "Este comunicado reúne orientações, prazos e responsabilidades para todas as áreas e unidades da LioConecta.",
  closing = "Em caso de dúvidas, consulte sua liderança direta ou entre em contato com a área emissora pelos canais oficiais de suporte.",
): string[] {
  return [excerpt, middle, closing];
}

export const comunicadosCatalog: Comunicado[] = [
  {
    id: "estrategia-2026",
    kind: "oficial",
    tag: "Comunicado oficial",
    tagClass: "",
    listLabel: "Oficiais",
    listPath: "/comunicados/oficiais",
    title: "Atualização importante sobre nossa estratégia 2026",
    excerpt:
      "Estamos lançando novas iniciativas de colaboração e bem-estar para todos os colaboradores. Leia os detalhes completos e compartilhe com sua equipe.",
    date: "04 jul 2026",
    author: "Recursos Humanos",
    authorAvatar: "/avatar-rh.png",
    heroImage: "/bg-announcement.png",
    paragraphs: body(
      "A liderança da LioConecta apresenta as diretrizes estratégicas para 2026, com foco em colaboração entre áreas, bem-estar no trabalho e inovação contínua.",
      "Entre as iniciativas estão programas de desenvolvimento, trilhas de carreira revisadas, ações de saúde mental e novos rituais de alinhamento entre times.",
      "Gestores devem socializar este comunicado com suas equipes até sexta-feira e registrar dúvidas no canal oficial de Recursos Humanos.",
    ),
  },
  {
    id: "seguranca-informacao",
    kind: "oficial",
    tag: "Comunicado oficial",
    tagClass: "",
    listLabel: "Oficiais",
    listPath: "/comunicados/oficiais",
    title: "Nova política de segurança da informação",
    excerpt:
      "A partir da próxima semana, todos os colaboradores devem atualizar suas senhas e concluir o treinamento obrigatório de segurança.",
    date: "02 jul 2026",
    author: "Tecnologia da Informação",
    authorAvatar: "/avatar-ti.png",
    heroImage: "/bg-comunicado-security.png",
    paragraphs: body(
      "A TI publica a nova política de segurança da informação, alinhada às melhores práticas de mercado e aos requisitos de compliance da empresa.",
      "Todos devem trocar a senha corporativa, revisar permissões de acesso e concluir o módulo de treinamento disponível no portal de serviços.",
      "O não cumprimento até o prazo informado pode resultar em restrições temporárias de acesso a sistemas críticos.",
    ),
  },
  {
    id: "ferias-coletivas-2026",
    kind: "oficial",
    tag: "Comunicado oficial",
    tagClass: "",
    listLabel: "Oficiais",
    listPath: "/comunicados/oficiais",
    title: "Calendário de férias coletivas 2026",
    excerpt:
      "Informamos o calendário de férias coletivas para o final do ano. Consulte as datas por unidade e registre sua preferência até sexta-feira.",
    date: "28 jun 2026",
    author: "Recursos Humanos",
    authorAvatar: "/avatar-rh.png",
    heroImage: "/bg-benefits.png",
    paragraphs: body(
      "O calendário de férias coletivas foi definido em conjunto com a liderança das unidades e está disponível para consulta por área.",
      "Colaboradores elegíveis devem registrar preferências no sistema de RH até sexta-feira às 18h.",
      "Dúvidas sobre elegibilidade ou exceções devem ser encaminhadas ao gestor direto e ao time de Recursos Humanos.",
    ),
  },
  {
    id: "parcerias-estrategicas-2026",
    kind: "oficial",
    tag: "Comunicado oficial",
    tagClass: "",
    listLabel: "Oficiais",
    listPath: "/comunicados/oficiais",
    title: "Novas parcerias estratégicas para 2026",
    excerpt:
      "A LioConecta anuncia parcerias que ampliam oportunidades de desenvolvimento e colaboração entre áreas e unidades.",
    date: "20 jun 2026",
    author: "Diretoria",
    authorAvatar: "/avatar-marketing.png",
    heroImage: "/bg-news.png",
    paragraphs: body(
      "A Diretoria comunica a formalização de novas parcerias estratégicas voltadas a desenvolvimento profissional, inovação e expansão de competências internas.",
      "As iniciativas incluem programas conjuntos com instituições parceiras, trilhas de capacitação e projetos interáreas.",
      "Materiais complementares serão publicados nas próximas semanas no portal de documentos corporativos.",
    ),
  },
  {
    id: "centro-inovacao",
    kind: "oficial",
    tag: "Comunicado oficial",
    tagClass: "",
    listLabel: "Oficiais",
    listPath: "/comunicados/oficiais",
    title: "Inauguração do centro de inovação",
    excerpt:
      "O novo centro de inovação e pesquisa aplicada já está em operação. Conheça os espaços, agendas e formas de participação dos times.",
    date: "12 jun 2026",
    author: "Tecnologia da Informação",
    authorAvatar: "/avatar-ti.png",
    heroImage: "/bg-news-innovation.png",
    paragraphs: body(
      "O centro de inovação e pesquisa aplicada foi inaugurado e já recebe times para imersões, hackathons internos e prototipagem de soluções.",
      "As agendas de uso podem ser consultadas no calendário compartilhado e reservadas pelo portal de Facilities.",
      "Times interessados em participar de projetos piloto devem enviar proposta resumida ao comitê de inovação.",
    ),
  },
  {
    id: "kickoff-campanha-h2",
    kind: "departamental",
    tag: "Departamental",
    tagClass: "tag--dept",
    listLabel: "Departamentais",
    listPath: "/comunicados/departamentais",
    title: "Kick-off da campanha interna do segundo semestre",
    excerpt:
      "O time de Marketing convida todas as áreas para o alinhamento da campanha interna. Participe da reunião e confira o calendário de ações.",
    date: "03 jul 2026",
    author: "Marketing",
    authorAvatar: "/avatar-marketing.png",
    heroImage: "/bg-marketing-event.png",
    paragraphs: body(
      "O Marketing convida representantes de todas as áreas para o kick-off da campanha interna do segundo semestre.",
      "A reunião apresentará o calendário de ações, peças de apoio e responsabilidades por departamento.",
      "Confirme a participação do seu time até quarta-feira pelo formulário indicado neste comunicado.",
    ),
  },
  {
    id: "manutencao-sistemas",
    kind: "departamental",
    tag: "Departamental",
    tagClass: "tag--dept",
    listLabel: "Departamentais",
    listPath: "/comunicados/departamentais",
    title: "Janela de manutenção dos sistemas internos",
    excerpt:
      "No sábado, das 8h às 12h, alguns sistemas ficarão indisponíveis para atualização. Planeje suas atividades com antecedência.",
    date: "01 jul 2026",
    author: "Tecnologia da Informação",
    authorAvatar: "/avatar-ti.png",
    heroImage: "/bg-comunicado-security.png",
    paragraphs: body(
      "A TI informa janela de manutenção programada para atualização de sistemas internos críticos.",
      "Durante o período, ERP, portal de serviços e alguns relatórios ficarão indisponíveis.",
      "Planeje atividades dependentes desses sistemas e acompanhe o status em tempo real no canal oficial de TI.",
    ),
  },
  {
    id: "onboarding-julho",
    kind: "departamental",
    tag: "Departamental",
    tagClass: "tag--dept",
    listLabel: "Departamentais",
    listPath: "/comunicados/departamentais",
    title: "Onboarding dos novos colaboradores de julho",
    excerpt:
      "Gestores devem confirmar a agenda de integração e indicar padrinhos para os novos membros que chegam na próxima semana.",
    date: "30 jun 2026",
    author: "Recursos Humanos",
    authorAvatar: "/avatar-rh.png",
    heroImage: "/bg-benefits.png",
    paragraphs: body(
      "Recursos Humanos publica a agenda de integração dos novos colaboradores que iniciam em julho.",
      "Gestores devem confirmar presença nas etapas obrigatórias e indicar padrinhos responsáveis pelo acolhimento.",
      "O checklist completo de onboarding está disponível no portal de Pessoas.",
    ),
  },
  {
    id: "metas-comercial-julho",
    kind: "departamental",
    tag: "Departamental",
    tagClass: "tag--dept",
    listLabel: "Departamentais",
    listPath: "/comunicados/departamentais",
    title: "Metas e rituais do time comercial em julho",
    excerpt:
      "Confira o novo formato das reuniões semanais, o ranking de indicadores e os materiais de apoio para o ciclo comercial.",
    date: "27 jun 2026",
    author: "Comercial",
    authorAvatar: "/avatar-carlos-mendes.png",
    heroImage: "/bg-social-coffee.png",
    paragraphs: body(
      "O time Comercial comunica o novo formato das reuniões semanais e as metas do ciclo de julho.",
      "Indicadores, ranking parcial e materiais de apoio foram atualizados na biblioteca do departamento.",
      "Líderes regionais devem revisar o plano com suas equipes até segunda-feira.",
    ),
  },
  {
    id: "pesquisa-evento-integracao",
    kind: "departamental",
    tag: "Departamental",
    tagClass: "tag--dept",
    listLabel: "Departamentais",
    listPath: "/comunicados/departamentais",
    title: "Pesquisa de preferências para o evento de integração",
    excerpt:
      "O Marketing está coletando sugestões de atividades e horários para o próximo evento de integração entre áreas.",
    date: "24 jun 2026",
    author: "Marketing",
    authorAvatar: "/avatar-marketing.png",
    heroImage: "/bg-poll.png",
    paragraphs: body(
      "Marketing abre pesquisa para definir formato, horários e atividades do próximo evento de integração entre áreas.",
      "A participação de todos os colaboradores é importante para equilibrar preferências e logística.",
      "O formulário ficará disponível até o fim da semana no link indicado neste comunicado.",
    ),
  },
  {
    id: "senha-18h",
    kind: "urgente",
    tag: "Urgente",
    tagClass: "tag--urgent",
    listLabel: "Urgentes",
    listPath: "/comunicados/urgentes",
    title: "Ação imediata: atualize sua senha até às 18h",
    excerpt:
      "Identificamos tentativas de acesso indevido. Todos os colaboradores devem trocar a senha corporativa ainda hoje e ativar a autenticação em dois fatores.",
    date: "04 jul 2026 · 09:15",
    author: "Tecnologia da Informação",
    authorAvatar: "/avatar-ti.png",
    heroImage: "/bg-comunicado-security.png",
    paragraphs: body(
      "A TI identificou tentativas de acesso indevido e solicita ação imediata de todos os colaboradores.",
      "Atualize sua senha corporativa até às 18h de hoje e ative a autenticação em dois fatores.",
      "Em caso de dificuldade, acione o help desk pelo canal prioritário informado no portal de serviços de TI.",
    ),
  },
  {
    id: "prazo-documentos-beneficios",
    kind: "urgente",
    tag: "Urgente",
    tagClass: "tag--urgent",
    listLabel: "Urgentes",
    listPath: "/comunicados/urgentes",
    title: "Prazo final para envio de documentos de benefícios",
    excerpt:
      "Colaboradores com pendências devem enviar a documentação até amanhã às 12h para não perder a elegibilidade no ciclo atual.",
    date: "03 jul 2026 · 16:40",
    author: "Recursos Humanos",
    authorAvatar: "/avatar-rh.png",
    heroImage: "/bg-announcement.png",
    paragraphs: body(
      "Recursos Humanos reforça o prazo final para envio de documentação pendente relacionada a benefícios.",
      "Colaboradores com pendências devem anexar os arquivos no portal até amanhã às 12h.",
      "Após o prazo, a elegibilidade no ciclo atual poderá ser suspensa até regularização.",
    ),
  },
  {
    id: "vpn-contorno",
    kind: "urgente",
    tag: "Urgente",
    tagClass: "tag--urgent",
    listLabel: "Urgentes",
    listPath: "/comunicados/urgentes",
    title: "Instabilidade no acesso VPN — contorno temporário",
    excerpt:
      "Equipes remotas devem usar o link alternativo de acesso enquanto a VPN principal é restabelecida. Previsão de normalização: 14h.",
    date: "02 jul 2026 · 11:20",
    author: "Tecnologia da Informação",
    authorAvatar: "/avatar-ti.png",
    heroImage: "/bg-poll-remote.png",
    paragraphs: body(
      "A TI reporta instabilidade no acesso via VPN principal e disponibiliza contorno temporário para equipes remotas.",
      "Utilize o link alternativo publicado no portal de serviços até a normalização prevista para 14h.",
      "Atualizações serão comunicadas no mesmo canal assim que a operação for restabelecida.",
    ),
  },
  {
    id: "treinamento-compliance",
    kind: "urgente",
    tag: "Urgente",
    tagClass: "tag--urgent",
    listLabel: "Urgentes",
    listPath: "/comunicados/urgentes",
    title: "Confirmação obrigatória de presença no treinamento de compliance",
    excerpt:
      "Quem ainda não confirmou a participação precisa responder até o fim do dia. A lista será enviada à liderança amanhã pela manhã.",
    date: "01 jul 2026 · 08:05",
    author: "Recursos Humanos",
    authorAvatar: "/avatar-rh.png",
    heroImage: "/bg-benefits.png",
    paragraphs: body(
      "Recursos Humanos solicita confirmação obrigatória de presença no treinamento de compliance.",
      "Colaboradores pendentes devem responder até o fim do dia pelo link oficial.",
      "A lista final será encaminhada à liderança amanhã pela manhã.",
    ),
  },
  {
    id: "resultados-q1-2026",
    kind: "arquivo",
    tag: "Arquivo",
    tagClass: "tag--archive",
    listLabel: "Arquivo",
    listPath: "/comunicados/arquivo",
    title: "Resultados do primeiro trimestre e prioridades do semestre",
    excerpt:
      "Registro do comunicado institucional com o balanço do trimestre e as diretrizes de execução para as áreas.",
    date: "15 mai 2026",
    author: "Diretoria",
    authorAvatar: "/avatar-marketing.png",
    heroImage: "/bg-news.png",
    paragraphs: body(
      "Comunicado arquivado com o balanço do primeiro trimestre e as prioridades definidas para o semestre.",
      "O documento consolida indicadores, destaques por área e diretrizes de execução.",
      "Mantido no arquivo para consulta histórica e referência em planejamentos futuros.",
    ),
  },
  {
    id: "migracao-colaboracao",
    kind: "arquivo",
    tag: "Arquivo",
    tagClass: "tag--archive",
    listLabel: "Arquivo",
    listPath: "/comunicados/arquivo",
    title: "Migração concluída do ambiente de colaboração",
    excerpt:
      "Comunicado histórico sobre a conclusão da migração de ferramentas e os novos padrões de uso para os times.",
    date: "02 abr 2026",
    author: "Tecnologia da Informação",
    authorAvatar: "/avatar-ti.png",
    heroImage: "/bg-news-innovation.png",
    paragraphs: body(
      "Registro histórico da conclusão da migração do ambiente de colaboração corporativa.",
      "O comunicado descreve novos padrões de uso, ferramentas substituídas e canais oficiais de suporte.",
      "Consulte este documento para contexto sobre a transição realizada no primeiro semestre.",
    ),
  },
  {
    id: "encerramento-2025",
    kind: "arquivo",
    tag: "Arquivo",
    tagClass: "tag--archive",
    listLabel: "Arquivo",
    listPath: "/comunicados/arquivo",
    title: "Encerramento do ano e calendário de recesso",
    excerpt:
      "Orientações de recesso, plantões e contatos de emergência publicados no final de 2025.",
    date: "18 dez 2025",
    author: "Recursos Humanos",
    authorAvatar: "/avatar-rh.png",
    heroImage: "/bg-celebration.png",
    paragraphs: body(
      "Comunicado arquivado com orientações de encerramento do ano e calendário de recesso de 2025.",
      "Inclui informações sobre plantões, contatos de emergência e retorno das atividades.",
      "Mantido para consulta histórica e referência em ciclos futuros.",
    ),
  },
  {
    id: "evento-integracao-2025",
    kind: "arquivo",
    tag: "Arquivo",
    tagClass: "tag--archive",
    listLabel: "Arquivo",
    listPath: "/comunicados/arquivo",
    title: "Cobertura e materiais do evento anual de integração",
    excerpt:
      "Galeria, apresentações e resumo das atividades do evento anual, mantidos para consulta das áreas.",
    date: "10 nov 2025",
    author: "Marketing",
    authorAvatar: "/avatar-marketing.png",
    heroImage: "/bg-marketing-event.png",
    paragraphs: body(
      "Arquivo com cobertura, apresentações e resumo das atividades do evento anual de integração.",
      "Materiais permanecem disponíveis para consulta das áreas e onboarding de novos colaboradores.",
      "Solicitações de republicação devem ser feitas ao time de Marketing.",
    ),
  },
  {
    id: "pesquisa-clima-2025",
    kind: "arquivo",
    tag: "Arquivo",
    tagClass: "tag--archive",
    listLabel: "Arquivo",
    listPath: "/comunicados/arquivo",
    title: "Resultado da pesquisa de clima organizacional",
    excerpt:
      "Síntese dos resultados e planos de ação definidos a partir da pesquisa de clima do segundo semestre de 2025.",
    date: "22 set 2025",
    author: "Recursos Humanos",
    authorAvatar: "/avatar-rh.png",
    heroImage: "/bg-poll.png",
    paragraphs: body(
      "Comunicado arquivado com a síntese dos resultados da pesquisa de clima organizacional do segundo semestre de 2025.",
      "Apresenta planos de ação definidos por área e indicadores acompanhados pela liderança.",
      "Documento de referência para comparativos em ciclos posteriores.",
    ),
  },
];

const byId = new Map(comunicadosCatalog.map((c) => [c.id, c]));

export function getComunicadoById(id: string): Comunicado | undefined {
  return byId.get(id);
}

export function comunicadoReaderPath(id: string): string {
  return `/comunicados/leitura?id=${encodeURIComponent(id)}`;
}
