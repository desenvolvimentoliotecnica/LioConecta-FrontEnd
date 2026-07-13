export type CompassHelpText = string | readonly string[];

export type CompassHelpContent = {
  title: string;
  oQueE: CompassHelpText;
  origemHyperion?: CompassHelpText;
  colunas?: CompassHelpText;
  formulas?: CompassHelpText;
  filtros?: CompassHelpText;
  interpretacao?: CompassHelpText;
  exemplo?: CompassHelpText;
};

const hyperionBase =
  "Os valores são extraídos do Oracle Hyperion EPBCS (Enterprise Planning and Budgeting Cloud Service), cubo IBP consolidado da Lio Técnica.";

const variacaoFormula =
  "Variação = IBP Atual − IBP Anterior. Variação % = (Variação ÷ IBP Anterior) × 100. Valores positivos indicam crescimento versus a versão anterior do plano integrado.";

const filtrosPadrao =
  "Diretoria, Unidade, Família, Tipo e busca textual aplicam-se a todas as visões Hyperion. Filtros combinados restringem linhas YTD e agregações.";

export const COMPASS_HELP: Record<string, CompassHelpContent> = {
  "nav-overview": {
    title: "Visão Geral",
    oQueE: "Dashboard executivo com KPIs YTD, alertas de variação e painéis consolidados do ciclo IBP.",
    origemHyperion: hyperionBase,
    filtros: filtrosPadrao,
    interpretacao: "Use como ponto de partida para identificar desvios entre IBP Atual e Anterior antes das reuniões S&OP.",
  },
  "nav-analise-ytd": {
    title: "Análise YTD",
    oQueE: "Tabela paginada com 11 colunas de detalhamento linha a linha do plano integrado year-to-date.",
    origemHyperion: hyperionBase,
    colunas: "Diretoria, Unidade, Família, Tipo, Matriz, Conta, IBP Atual, IBP Anterior, Variação (R$), Variação (%), Moeda.",
    formulas: variacaoFormula,
    filtros: filtrosPadrao,
  },
  "nav-ciclo": {
    title: "Ciclo IBP",
    oQueE: "Linha do tempo das 6 fases do Integrated Business Planning — da coleta Hyperion ao comitê executivo.",
    origemHyperion: "A fase Coleta importa snapshots EPBCS; fases seguintes consomem IBP Atual vs Anterior.",
    interpretacao: "Progresso indica maturidade do ciclo corrente, não substitui validação contábil no Hyperion.",
  },
  "nav-volume": {
    title: "Volume",
    oQueE: "Visão de volume YTD agregada por família de produto/serviço a partir do tipo Volume no cubo IBP.",
    origemHyperion: hyperionBase,
    formulas: variacaoFormula,
    filtros: filtrosPadrao,
  },
  "nav-canais": {
    title: "Canais",
    oQueE: "Distribuição IBP por unidade/canal de negócio — compara IBP Atual vs Anterior por região ou canal.",
    origemHyperion: hyperionBase,
    formulas: variacaoFormula,
    filtros: filtrosPadrao,
  },
  "nav-financeiro": {
    title: "Financeiro",
    oQueE: "Cascade P&L por tipo contábil (Receita, COGS, OPEX, CAPEX) derivado das agregações Hyperion.",
    origemHyperion: hyperionBase,
    formulas: variacaoFormula,
    interpretacao: "Bridge de variância decompõe delta de receita entre versões IBP.",
  },
  "nav-reconciliacao": {
    title: "Reconciliação",
    oQueE: "Matriz Diretoria × Tipo com variações YTD — identifica células com maior desalinhamento entre versões IBP.",
    origemHyperion: hyperionBase,
    formulas: variacaoFormula,
    interpretacao: "Células com |Variação %| ≥ 8% são tratadas como desvios críticos no ciclo S&OP.",
  },
  "nav-reunioes": {
    title: "Reuniões",
    oQueE: "Agenda de rituais IBP vinculados às fases do ciclo e aos dados Hyperion em revisão.",
    origemHyperion: "Pautas referenciam snapshot EPBCS vigente e gaps da matriz de reconciliação.",
  },
  "nav-decisoes": {
    title: "Decisões",
    oQueE: "Registro de decisões tomadas ou pendentes no ciclo IBP com impacto financeiro estimado.",
    origemHyperion: "Impactos devem ser refletidos na próxima versão IBP exportada do Hyperion.",
  },
  "nav-cenarios": {
    title: "Cenários",
    oQueE: "Simulações what-if sobre o plano integrado antes de publicar nova versão no EPBCS.",
    origemHyperion: "Cenários aprovados alimentam versão IBP Anterior na próxima rodada de consolidação.",
  },
  "nav-relatorios": {
    title: "Relatórios",
    oQueE: "Exportações executivas do ciclo IBP e dados Hyperion (PDF, Excel, bridges).",
    origemHyperion: "Relatórios futuros consumirão API /compass/ytd e /compass/aggregates.",
  },
  "filter-diretoria": {
    title: "Filtro — Diretoria",
    oQueE: "Restringe dados à diretoria selecionada no cubo IBP Hyperion.",
    origemHyperion: "Dimensão Diretoria mapeada do EPBCS — valores conforme meta /compass/meta.",
    filtros: filtrosPadrao,
  },
  "filter-unidade": {
    title: "Filtro — Unidade",
    oQueE: "Filtra por unidade operacional ou canal (ex.: São Paulo, Exportação).",
    origemHyperion: "Dimensão Unidade do cubo IBP.",
    filtros: filtrosPadrao,
  },
  "filter-familia": {
    title: "Filtro — Família",
    oQueE: "Segmenta por família de produto ou linha de serviço no plano integrado.",
    origemHyperion: "Dimensão Família exportada do Hyperion EPBCS.",
    filtros: filtrosPadrao,
  },
  "filter-tipo": {
    title: "Filtro — Tipo",
    oQueE: "Filtra por tipo contábil: Receita, COGS, OPEX, CAPEX ou Volume.",
    origemHyperion: "Dimensão Tipo alimenta agregações P&L e visões de volume.",
    filtros: filtrosPadrao,
  },
  "filter-search": {
    title: "Busca textual",
    oQueE: "Pesquisa livre em diretoria, unidade, família, tipo, matriz e conta nas linhas YTD.",
    filtros: filtrosPadrao,
  },
  "filter-hyperion-badge": {
    title: "Badge Hyperion",
    oQueE: "Indica snapshot EPBCS ativo — nome, período fiscal e data da última exportação.",
    origemHyperion: "Retornado por GET /api/v1/compass/meta → snapshot.",
    exemplo: "IBP YTD — Jul/2026 · Oracle Hyperion EPBCS · exportado em 05/07/2026.",
  },
  "kpi-ibp-atual": {
    title: "KPI — IBP Atual (YTD)",
    oQueE: "Soma consolidada de receita YTD na versão corrente do plano integrado (IBP Atual).",
    origemHyperion: hyperionBase,
    formulas: "IBP Atual = Σ linhas tipo Receita no período YTD selecionado.",
    interpretacao: "Versão publicada mais recente no EPBCS após ciclo de consolidação.",
  },
  "kpi-variacao-ytd": {
    title: "KPI — Variação YTD",
    oQueE: "Percentual de variação agregada entre IBP Atual e IBP Anterior na receita YTD.",
    formulas: variacaoFormula,
    interpretacao: "Positivo = crescimento vs versão anterior; negativo = retração.",
  },
  "kpi-volume-ytd": {
    title: "KPI — Volume YTD",
    oQueE: "Unidades consolidadas no tipo Volume — comparativo Atual vs Anterior.",
    origemHyperion: hyperionBase,
    formulas: variacaoFormula,
  },
  "kpi-gaps-criticos": {
    title: "KPI — Desvios críticos",
    oQueE: "Contagem de células Diretoria×Tipo com |Variação %| ≥ 8%.",
    formulas: variacaoFormula,
    interpretacao: "Priorize reconciliação antes do comitê executivo.",
  },
  "kpi-canais": {
    title: "KPI — Canais / Unidades",
    oQueE: "Quantidade de unidades com movimento IBP no filtro corrente.",
    origemHyperion: hyperionBase,
  },
  "kpi-decisoes": {
    title: "KPI — Decisões pendentes",
    oQueE: "Decisões IBP aguardando aprovação no ciclo corrente.",
    interpretacao: "Complementa dados Hyperion com governança S&OP.",
  },
  "panel-alertas": {
    title: "Alertas executivos",
    oQueE: "Notificações automáticas sobre variações críticas, gaps e pendências do ciclo.",
    origemHyperion: "Alertas de variação derivam de thresholds sobre IBP Atual vs Anterior.",
    interpretacao: "Clique para navegar à reconciliação ou governança correspondente.",
  },
  "panel-demanda-supply": {
    title: "Família — IBP Atual vs Anterior",
    oQueE: "Gráfico comparando IBP Atual e Anterior por família (proxy demanda/supply YTD).",
    origemHyperion: hyperionBase,
    formulas: variacaoFormula,
  },
  "panel-variance-bridge": {
    title: "Bridge de variância",
    oQueE: "Decomposição do delta de receita entre IBP Anterior e IBP Atual (volume, preço, mix, câmbio).",
    origemHyperion: "Drivers calculados no EPBCS ou derivados no backend Compass.",
    formulas: variacaoFormula,
    exemplo: "Plano base 100 → +Volume 3,2% → −Preço 1,1% → IBP Atual.",
  },
  "panel-top-gaps": {
    title: "Principais desvios",
    oQueE: "Top 5 células Diretoria×Tipo por magnitude de variação percentual.",
    formulas: variacaoFormula,
    interpretacao: "Severidade crítica quando |Variação %| ≥ 8%.",
  },
  "panel-reunioes": {
    title: "Próximas reuniões",
    oQueE: "Rituais IBP agendados — Pré-S&OP, S&OP integrado, revisão financeira e comitê executivo.",
    origemHyperion: "Pautas devem referenciar snapshot Hyperion vigente.",
  },
  "panel-decisoes-recentes": {
    title: "Decisões recentes",
    oQueE: "Últimas decisões registradas no ciclo com impacto financeiro e status.",
    interpretacao: "Decisões aprovadas devem ser input para próxima versão IBP no EPBCS.",
  },
  "panel-ciclo-diagram": {
    title: "Diagrama do ciclo IBP",
    oQueE: "Visualização das 6 fases — destaca fase ativa do ciclo corrente.",
    origemHyperion: "Coleta = import EPBCS; Revisão Financeira = validação IBP Atual vs Anterior.",
  },
  "ytd-table": {
    title: "Tabela YTD — 11 colunas",
    oQueE: "Detalhamento linha a linha do cubo IBP Hyperion year-to-date.",
    colunas: "Diretoria · Unidade · Família · Tipo · Matriz · Conta · IBP Atual · IBP Anterior · Variação · Var. % · Moeda.",
    formulas: variacaoFormula,
    origemHyperion: hyperionBase,
    filtros: filtrosPadrao,
    exemplo: "Industrial / SP / Equipamentos / Receita — Atual R$ 12,4M vs Anterior R$ 11,8M → +5,1%.",
  },
  "ytd-col-ibp-atual": {
    title: "Coluna — IBP Atual",
    oQueE: "Valor na versão corrente do plano integrado exportado do Hyperion EPBCS.",
    origemHyperion: hyperionBase,
    interpretacao: "Versão mais recente aprovada no ciclo IBP.",
  },
  "ytd-col-ibp-anterior": {
    title: "Coluna — IBP Anterior",
    oQueE: "Valor na versão anterior do plano — baseline para cálculo de variação.",
    origemHyperion: "Snapshot EPBCS imediatamente anterior na linha do tempo IBP.",
    interpretacao: "Referência para medir evolução entre rodadas de consolidação.",
  },
  "ytd-col-variacao": {
    title: "Colunas — Variação",
    oQueE: "Delta absoluto (R$ ou UN) e percentual entre IBP Atual e IBP Anterior.",
    formulas: variacaoFormula,
  },
  "volume-table": {
    title: "Tabela de volume",
    oQueE: "Agregação por família filtrando tipo Volume no cubo IBP.",
    formulas: variacaoFormula,
    origemHyperion: hyperionBase,
  },
  "canais-table": {
    title: "Tabela de canais",
    oQueE: "Agregação IBP por unidade/canal — IBP Atual, Anterior e Variação.",
    formulas: variacaoFormula,
    origemHyperion: hyperionBase,
  },
  "financeiro-pl": {
    title: "Cascade P&L",
    oQueE: "Demonstração por tipo contábil (Receita → COGS → OPEX → CAPEX) com variação YTD.",
    formulas: variacaoFormula,
    origemHyperion: hyperionBase,
    interpretacao: "Agregação groupBy=tipo via /compass/aggregates.",
  },
  "financeiro-bridge": {
    title: "Bridge P&L — receita",
    oQueE: "Waterfall de drivers entre IBP Anterior e IBP Atual na receita consolidada.",
    formulas: variacaoFormula,
  },
  "reconciliacao-matrix": {
    title: "Matriz Diretoria × Tipo",
    oQueE: "Heatmap de variação YTD cruzando diretorias (linhas) e tipos contábeis (colunas).",
    formulas: variacaoFormula,
    origemHyperion: hyperionBase,
    interpretacao: "Intensidade da cor proporcional à |Variação %|. Diagonal N/A — cruzamento diretoria/tipo.",
    exemplo: "Industrial × Receita +5,5% · Serviços × OPEX +5,1%.",
  },
  "reconciliacao-gaps-list": {
    title: "Lista de desvios",
    oQueE: "Detalhamento tabular dos maiores desvios com diretoria, tipo, valor e severidade.",
    formulas: variacaoFormula,
  },
  "ciclo-progresso": {
    title: "Progresso do ciclo",
    oQueE: "Percentual de conclusão das fases IBP e checklist por etapa.",
    origemHyperion: "Coleta Hyperion deve estar 100% antes de Pré-S&OP Demanda.",
  },
  "ciclo-fases": {
    title: "Fases do ciclo",
    oQueE: "Cards por fase com datas, status e checklist — 6 etapas padrão S&OP/IBP.",
    origemHyperion: "Fase Coleta = export EPBCS; Revisão Financeira = validação IBP Atual vs Anterior.",
  },
  "shell-persona": {
    title: "Seu perfil no Compass",
    oQueE: [
      "Este selo no topo mostra como o Compass se apresenta para você: o quanto da empresa você enxerga e o tipo de acompanhamento que faz sentido no seu dia a dia.",
      "Não é um cargo formal nem uma função de RH — é só a forma de organizar a visão de cada pessoa no planejamento do negócio, para que cada um veja o que precisa sem se perder em informação de outras áreas.",
    ],
    interpretacao: [
      "Há três jeitos principais de usar o Compass:",
      "Executivo — visão ampla de toda a empresa. Serve para quem acompanha o resultado consolidado, compara áreas e precisa do panorama completo antes das reuniões de planejamento.",
      "Planejador — foco na sua diretoria. Os números e filtros já vêm alinhados à área em que você atua, para trabalhar o plano com mais profundidade no seu recorte.",
      "Contribuidor — também vê o recorte da sua área, mas principalmente para acompanhar e consultar. É a visão de quem participa do ciclo sem precisar alterar o que já está em análise.",
      "O nome que aparece no selo é o seu perfil neste momento. Ele segue a área à qual você está ligado no ciclo de planejamento e pode ser diferente do de um colega de outra diretoria.",
    ],
    exemplo: [
      "Se o selo mostrar Executivo, você pode navegar por todas as diretorias e comparar o conjunto.",
      "Se mostrar Planejador, a tela já favorece a sua área — o detalhe do que importa para o seu time.",
      "Se mostrar Contribuidor, você acompanha o andamento com tranquilidade; as ações de mudança ficam mais limitadas.",
    ],
  },
  "fallback-banner": {
    title: "Dados locais (fallback)",
    oQueE: "Quando a API Compass não responde, exibe JSON mock local mantendo a UI funcional.",
    interpretacao: "Banner indica que valores não refletem snapshot Hyperion em tempo real.",
  },
};

export function getCompassHelp(id: string): CompassHelpContent | undefined {
  return COMPASS_HELP[id];
}

export const COMPASS_HELP_IDS = Object.keys(COMPASS_HELP);
