import type {
  CompassAggregatesDto,
  CompassDashboardDto,
  CompassMetaDto,
  CompassYtdPageDto,
} from "../../api/types";

const SNAPSHOT = {
  id: "snap-2026-ytd",
  name: "IBP YTD — Jul/2026",
  source: "Oracle Hyperion EPBCS",
  exportedAt: "2026-07-05T08:30:00Z",
  fiscalYear: 2026,
  periodLabel: "Jan–Jul YTD",
  hyperionVersion: "24.06",
} as const;

export const COMPASS_API_MOCK_META: CompassMetaDto = {
  snapshot: SNAPSHOT,
  hyperionBadge: "Hyperion EPBCS",
  directorias: [
    { value: "dir-industrial", label: "Industrial", count: 42 },
    { value: "dir-servicos", label: "Serviços", count: 28 },
    { value: "dir-comercial", label: "Comercial", count: 35 },
    { value: "dir-corporativo", label: "Corporativo", count: 18 },
  ],
  unidades: [
    { value: "un-sp", label: "São Paulo", count: 38 },
    { value: "un-rj", label: "Rio de Janeiro", count: 22 },
    { value: "un-mg", label: "Minas Gerais", count: 31 },
    { value: "un-export", label: "Exportação", count: 14 },
  ],
  familias: [
    { value: "fam-equip", label: "Equipamentos", count: 24 },
    { value: "fam-serv", label: "Serviços técnicos", count: 18 },
    { value: "fam-pecas", label: "Peças e consumíveis", count: 32 },
    { value: "fam-proj", label: "Projetos", count: 12 },
  ],
  tipos: [
    { value: "tipo-receita", label: "Receita", count: 45 },
    { value: "tipo-cogs", label: "COGS", count: 38 },
    { value: "tipo-opex", label: "OPEX", count: 52 },
    { value: "tipo-capex", label: "CAPEX", count: 16 },
    { value: "tipo-volume", label: "Volume", count: 28 },
  ],
};

const YTD_ROWS = [
  { id: "ytd-1", diretoria: "Industrial", unidade: "São Paulo", familia: "Equipamentos", tipo: "Receita", matriz: "BR-IND", conta: "Receita bruta", ibpAtual: 12_450_000, ibpAnterior: 11_800_000 },
  { id: "ytd-2", diretoria: "Industrial", unidade: "São Paulo", familia: "Equipamentos", tipo: "COGS", matriz: "BR-IND", conta: "Custo direto", ibpAtual: 7_200_000, ibpAnterior: 6_950_000 },
  { id: "ytd-3", diretoria: "Industrial", unidade: "Minas Gerais", familia: "Peças e consumíveis", tipo: "Receita", matriz: "BR-IND", conta: "Receita bruta", ibpAtual: 4_800_000, ibpAnterior: 5_100_000 },
  { id: "ytd-4", diretoria: "Serviços", unidade: "Rio de Janeiro", familia: "Serviços técnicos", tipo: "Receita", matriz: "BR-SRV", conta: "Receita serviços", ibpAtual: 3_200_000, ibpAnterior: 2_950_000 },
  { id: "ytd-5", diretoria: "Serviços", unidade: "São Paulo", familia: "Serviços técnicos", tipo: "OPEX", matriz: "BR-SRV", conta: "Despesas operacionais", ibpAtual: 1_450_000, ibpAnterior: 1_380_000 },
  { id: "ytd-6", diretoria: "Comercial", unidade: "Exportação", familia: "Equipamentos", tipo: "Receita", matriz: "BR-EXP", conta: "Receita exportação", ibpAtual: 8_900_000, ibpAnterior: 8_200_000 },
  { id: "ytd-7", diretoria: "Comercial", unidade: "Exportação", familia: "Projetos", tipo: "Volume", matriz: "BR-EXP", conta: "Unidades vendidas", ibpAtual: 1_240, ibpAnterior: 1_180 },
  { id: "ytd-8", diretoria: "Corporativo", unidade: "São Paulo", familia: "Projetos", tipo: "OPEX", matriz: "BR-CORP", conta: "Overhead corporativo", ibpAtual: 980_000, ibpAnterior: 920_000 },
  { id: "ytd-9", diretoria: "Industrial", unidade: "Minas Gerais", familia: "Peças e consumíveis", tipo: "Volume", matriz: "BR-IND", conta: "Unidades vendidas", ibpAtual: 18_500, ibpAnterior: 17_200 },
  { id: "ytd-10", diretoria: "Serviços", unidade: "Rio de Janeiro", familia: "Serviços técnicos", tipo: "CAPEX", matriz: "BR-SRV", conta: "Investimentos", ibpAtual: 620_000, ibpAnterior: 580_000 },
  { id: "ytd-11", diretoria: "Comercial", unidade: "São Paulo", familia: "Equipamentos", tipo: "COGS", matriz: "BR-COM", conta: "Custo comercial", ibpAtual: 2_100_000, ibpAnterior: 2_050_000 },
  { id: "ytd-12", diretoria: "Corporativo", unidade: "São Paulo", familia: "Projetos", tipo: "Receita", matriz: "BR-CORP", conta: "Receita intercompany", ibpAtual: 450_000, ibpAnterior: 420_000 },
] as const;

function withVariation(row: (typeof YTD_ROWS)[number]) {
  const ibpAtual = Number(row.ibpAtual);
  const ibpAnterior = Number(row.ibpAnterior);
  const variacao = ibpAtual - ibpAnterior;
  const variacaoPct = ibpAnterior !== 0 ? (variacao / ibpAnterior) * 100 : 0;
  return {
    ...row,
    ibpAtual,
    ibpAnterior,
    variacao,
    variacaoPct: Math.round(variacaoPct * 10) / 10,
    moeda: row.tipo === "Volume" ? "UN" : "BRL",
  };
}

const YTD_WITH_VAR = YTD_ROWS.map(withVariation) as Array<
  (typeof YTD_ROWS)[number] & { variacao: number; variacaoPct: number; moeda: string }
>;

function sumRows(rows: typeof YTD_WITH_VAR) {
  const ibpAtual = rows.reduce((s, r) => s + r.ibpAtual, 0);
  const ibpAnterior = rows.reduce((s, r) => s + r.ibpAnterior, 0);
  const variacao = ibpAtual - ibpAnterior;
  const variacaoPct = ibpAnterior !== 0 ? (variacao / ibpAnterior) * 100 : 0;
  return { ibpAtual, ibpAnterior, variacao, variacaoPct: Math.round(variacaoPct * 10) / 10 };
}

function groupAggregate(groupBy: "diretoria" | "familia" | "tipo" | "unidade" | "matriz", rows: typeof YTD_WITH_VAR): CompassAggregatesDto {
  const keyField =
    groupBy === "diretoria"
      ? "diretoria"
      : groupBy === "familia"
        ? "familia"
        : groupBy === "tipo"
          ? "tipo"
          : groupBy === "unidade"
            ? "unidade"
            : "matriz";

  const map = new Map<string, typeof YTD_WITH_VAR>();
  for (const row of rows) {
    const key = row[keyField];
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }

  const aggRows = [...map.entries()].map(([groupKey, groupRows]) => {
    const totals = sumRows(groupRows);
    return {
      groupKey,
      groupLabel: groupKey,
      ...totals,
    };
  });

  return { groupBy, rows: aggRows, totals: sumRows(rows) };
}

function buildReconciliationMatrix(rows: typeof YTD_WITH_VAR) {
  const directorias = [...new Set(rows.map((r) => r.diretoria))];
  const tipos = [...new Set(rows.map((r) => r.tipo))];
  const cells = [];
  for (const diretoria of directorias) {
    for (const tipo of tipos) {
      const matched = rows.filter((r) => r.diretoria === diretoria && r.tipo === tipo);
      if (matched.length === 0) continue;
      const totals = sumRows(matched);
      cells.push({ diretoria, tipo, ...totals });
    }
  }
  return cells;
}

export function filterYtdRows(filters: {
  diretoria?: string;
  unidade?: string;
  familia?: string;
  tipo?: string;
  search?: string;
}) {
  return YTD_WITH_VAR.filter((row) => {
    if (filters.diretoria && row.diretoria !== filters.diretoria) return false;
    if (filters.unidade && row.unidade !== filters.unidade) return false;
    if (filters.familia && row.familia !== filters.familia) return false;
    if (filters.tipo && row.tipo !== filters.tipo) return false;
    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      const hay = `${row.diretoria} ${row.unidade} ${row.familia} ${row.tipo} ${row.conta}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function buildMockYtdPage(
  page: number,
  pageSize: number,
  filters: Parameters<typeof filterYtdRows>[0],
): CompassYtdPageDto {
  const filtered = filterYtdRows(filters);
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  return {
    items,
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    totals: sumRows(filtered),
  };
}

export function buildMockAggregates(
  groupBy: "diretoria" | "familia" | "tipo" | "unidade" | "matriz",
  filters: Parameters<typeof filterYtdRows>[0],
): CompassAggregatesDto {
  return groupAggregate(groupBy, filterYtdRows(filters));
}

export function buildMockDashboard(filters: Parameters<typeof filterYtdRows>[0]): CompassDashboardDto {
  const rows = filterYtdRows(filters);
  const revenueRows = rows.filter((r) => r.tipo === "Receita");
  const revenueTotals = sumRows(revenueRows.length > 0 ? revenueRows : rows);
  const volumeRows = rows.filter((r) => r.tipo === "Volume");
  const volumeTotals = sumRows(volumeRows.length > 0 ? volumeRows : rows.slice(0, 2));
  const matrix = buildReconciliationMatrix(rows);
  const criticalGaps = matrix.filter((c) => Math.abs(c.variacaoPct) >= 8).length;

  return {
    snapshot: SNAPSHOT,
    currentPhaseLabel: "Revisão Financeira",
    cycleProgress: 72,
    alignmentIndex: 78,
    alignmentDelta: 2.4,
    kpis: [
      {
        id: "ibp-atual",
        label: "IBP Atual (YTD)",
        value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(revenueTotals.ibpAtual),
        delta: "Receita consolidada",
        trend: "up",
        icon: "fa-chart-pie",
        mod: "blue",
        href: "/compass/analise-ytd",
      },
      {
        id: "variacao-ytd",
        label: "Variação YTD",
        value: `${revenueTotals.variacaoPct >= 0 ? "+" : ""}${revenueTotals.variacaoPct}%`,
        delta: "IBP Atual vs Anterior",
        trend: revenueTotals.variacaoPct >= 0 ? "up" : "down",
        icon: "fa-arrow-trend-up",
        mod: revenueTotals.variacaoPct >= 0 ? "green" : "red",
        href: "/compass/analise-ytd",
      },
      {
        id: "volume-ytd",
        label: "Volume YTD",
        value: volumeTotals.ibpAtual.toLocaleString("pt-BR"),
        delta: `${volumeTotals.variacaoPct >= 0 ? "+" : ""}${volumeTotals.variacaoPct}% vs anterior`,
        trend: volumeTotals.variacaoPct >= 0 ? "up" : "neutral",
        icon: "fa-chart-line",
        mod: "green",
        href: "/compass/volume",
      },
      {
        id: "gaps-criticos",
        label: "Desvios críticos",
        value: String(criticalGaps),
        delta: criticalGaps > 0 ? "Variação ≥ 8%" : "controlado",
        trend: criticalGaps > 0 ? "down" : "neutral",
        icon: "fa-triangle-exclamation",
        mod: "red",
        href: "/compass/reconciliacao",
      },
      {
        id: "canais",
        label: "Canais / Unidades",
        value: String(new Set(rows.map((r) => r.unidade)).size),
        delta: "Unidades com movimento",
        trend: "neutral",
        icon: "fa-truck-ramp-box",
        mod: "amber",
        href: "/compass/canais",
      },
      {
        id: "decisoes",
        label: "Decisões pendentes",
        value: "3",
        delta: "Ciclo IBP Jul/2026",
        trend: "neutral",
        icon: "fa-gavel",
        mod: "purple",
        href: "/compass/decisoes",
      },
    ],
    alerts: criticalGaps > 0
      ? [
          {
            id: "alert-var-critica",
            type: "variacao_critica",
            severity: "critical" as const,
            title: "Variações críticas no Hyperion",
            description: "Células com Variação ≥ 8% entre IBP Atual e Anterior",
            quantity: criticalGaps,
            date: "2026-07-05",
            origin: "Oracle Hyperion EPBCS",
            link: "/compass/reconciliacao",
          },
        ]
      : [],
    alignmentHistory: [
      { label: "Mar", value: 74 },
      { label: "Abr", value: 76 },
      { label: "Mai", value: 75 },
      { label: "Jun", value: 77 },
      { label: "Jul", value: 78 },
    ],
    demandSupplyChart: groupAggregate("familia", rows).rows.slice(0, 6).map((r) => ({
      label: r.groupLabel.slice(0, 12),
      demand: r.ibpAtual,
      supply: r.ibpAnterior,
    })),
    varianceBridge: [
      { label: "IBP Anterior", value: 100, color: "#2563eb" },
      { label: "Volume", value: 3.2, color: "#10b981" },
      { label: "Preço", value: -1.1, color: "#f59e0b" },
      { label: "Mix", value: 1.8, color: "#8b5cf6" },
      { label: "Câmbio", value: -2.4, color: "#dc2626" },
      { label: "IBP Atual", value: revenueTotals.variacaoPct, color: "#0ea5e9" },
    ],
    topGaps: matrix
      .filter((c) => Math.abs(c.variacaoPct) >= 5)
      .sort((a, b) => Math.abs(b.variacaoPct) - Math.abs(a.variacaoPct))
      .slice(0, 5)
      .map((c, i) => ({
        id: `gap-${i}`,
        title: `${c.diretoria} × ${c.tipo}`,
        severity: Math.abs(c.variacaoPct) >= 8 ? ("critico" as const) : ("alto" as const),
        diretoria: c.diretoria,
        tipo: c.tipo,
        value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(c.variacao),
        variacaoPct: c.variacaoPct,
      })),
    upcomingMeetings: [
      { id: "m-1", date: "2026-07-10", time: "14:00", title: "Revisão Financeira IBP", phaseLabel: "Revisão Financeira" },
      { id: "m-2", date: "2026-07-15", time: "10:00", title: "Comitê Executivo S&OP", phaseLabel: "Comitê Executivo" },
    ],
    recentDecisions: [
      { id: "d-1", title: "Aprovar forecast exportação Q3", meetingTitle: "Pré-S&OP Demanda", ownerName: "Marcos Vieira", dueDate: "2026-07-12", impact: "R$ 890.000", status: "pendente" },
      { id: "d-2", title: "Realocar capacidade MG", meetingTitle: "S&OP Integrado", ownerName: "Vicente Lima", dueDate: "2026-07-08", impact: "R$ 320.000", status: "aprovada" },
    ],
    reconciliationMatrix: matrix,
    summaryByTipo: buildMockAggregates("tipo", filters).rows,
    summaryByDiretoria: buildMockAggregates("diretoria", filters).rows,
  };
}

export const COMPASS_API_MOCK = {
  meta: COMPASS_API_MOCK_META,
  ytd: buildMockYtdPage(1, 25, {}),
  dashboard: buildMockDashboard({}),
  aggregatesByTipo: buildMockAggregates("tipo", {}),
  aggregatesByUnidade: buildMockAggregates("unidade", {}),
  aggregatesByFamilia: buildMockAggregates("familia", {}),
  aggregatesByDiretoria: buildMockAggregates("diretoria", {}),
};
