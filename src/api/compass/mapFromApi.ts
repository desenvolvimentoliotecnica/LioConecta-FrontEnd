import type { GapSeverity } from "../../config/compass/types";
import type {
  CompassAggregatesDto,
  CompassDashboardDto,
  CompassMetaDto,
  CompassYtdPageDto,
} from "../types";

type ApiSnapshot = {
  id: string;
  label: string;
  versionAtual: string;
  versionAnterior: string;
  sourceSystem: string;
  importedAt: string;
  rowCount: number;
};

type ApiMeta = {
  snapshot: ApiSnapshot;
  directorias: string[];
  unidades: string[];
  familias: string[];
  tipos: string[];
};

type ApiKpi = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: string;
  icon: string;
  mod: string;
};

type ApiBridgeItem = {
  diretoria: string;
  ibpAtual: number;
  ibpAnterior: number;
  variacao: number;
};

type ApiVarianceItem = {
  tipo: string;
  familiaComercial: string;
  skuCode: string;
  skuDescription: string;
  cliente: string;
  matriz: string;
  diretoria: string;
  unidade: string;
  ibpAtual: number;
  ibpAnterior: number;
  variacao: number;
};

type ApiAlert = {
  id: string;
  severity: string;
  title: string;
  description: string;
  quantity: number;
  link: string;
};

type ApiDashboard = {
  snapshot: ApiSnapshot;
  kpis: ApiKpi[];
  bridgeByDiretoria: ApiBridgeItem[];
  topVariances: ApiVarianceItem[];
  alerts: ApiAlert[];
};

type ApiYtdRow = {
  id: string;
  tipo: string;
  familiaComercial: string;
  skuCode: string;
  skuDescription: string;
  clienteHyperion: string;
  cliente: string;
  matriz: string;
  diretoria: string;
  unidade: string;
  ibpAtual: number;
  ibpAnterior: number;
  variacao: number;
};

type ApiYtdPage = {
  items: ApiYtdRow[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

type ApiAggregateRow = {
  groupKey: string;
  ibpAtual: number;
  ibpAnterior: number;
  variacao: number;
  rowCount: number;
};

type ApiAggregates = {
  groupBy: string;
  items: ApiAggregateRow[];
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function variacaoPct(atual: number, anterior: number): number {
  if (anterior === 0) return 0;
  return Math.round(((atual - anterior) / anterior) * 1000) / 10;
}

function sumTotals(rows: { ibpAtual: number; ibpAnterior: number; variacao: number }[]) {
  const ibpAtual = rows.reduce((s, r) => s + r.ibpAtual, 0);
  const ibpAnterior = rows.reduce((s, r) => s + r.ibpAnterior, 0);
  const variacao = rows.reduce((s, r) => s + r.variacao, 0);
  return { ibpAtual, ibpAnterior, variacao, variacaoPct: variacaoPct(ibpAtual, ibpAnterior) };
}

function mapSnapshot(snapshot: ApiSnapshot) {
  const yearMatch = snapshot.label.match(/20\d{2}/);
  return {
    id: snapshot.id,
    name: snapshot.label,
    source: snapshot.sourceSystem || "Oracle Hyperion EPBCS",
    exportedAt: snapshot.importedAt,
    fiscalYear: yearMatch ? Number(yearMatch[0]) : new Date(snapshot.importedAt).getFullYear(),
    periodLabel: snapshot.versionAtual || "YTD",
    hyperionVersion: snapshot.versionAnterior || null,
  };
}

function mapDimensions(values: string[]) {
  return values.map((label) => ({
    value: slugify(label) || label,
    label,
    count: null,
  }));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
    value,
  );
}

function severityFromPct(pct: number): GapSeverity {
  const abs = Math.abs(pct);
  if (abs >= 8) return "critico";
  if (abs >= 5) return "alto";
  if (abs >= 2) return "medio";
  return "baixo";
}

const KPI_HREFS: Record<string, string> = {
  revenue: "/compass/analise-ytd",
  contrib: "/compass/financeiro",
  volume: "/compass/volume",
  variance_rows: "/compass/reconciliacao",
  total_rows: "/compass/analise-ytd",
  source: "/compass/analise-ytd",
};

export function mapCompassMetaFromApi(raw: ApiMeta): CompassMetaDto {
  return {
    snapshot: mapSnapshot(raw.snapshot),
    hyperionBadge: "Hyperion EPBCS",
    directorias: mapDimensions(raw.directorias ?? []),
    unidades: mapDimensions(raw.unidades ?? []),
    familias: mapDimensions(raw.familias ?? []),
    tipos: mapDimensions(raw.tipos ?? []),
  };
}

export function mapCompassDashboardFromApi(raw: ApiDashboard): CompassDashboardDto {
  const bridge = raw.bridgeByDiretoria ?? [];
  const topVariances = raw.topVariances ?? [];
  const revenueBridge = bridge.reduce(
    (acc, item) => ({
      ibpAtual: acc.ibpAtual + item.ibpAtual,
      ibpAnterior: acc.ibpAnterior + item.ibpAnterior,
      variacao: acc.variacao + item.variacao,
    }),
    { ibpAtual: 0, ibpAnterior: 0, variacao: 0 },
  );
  const revenuePct = variacaoPct(revenueBridge.ibpAtual, revenueBridge.ibpAnterior);

  const reconciliationMatrix = topVariances.map((row) => {
    const pct = variacaoPct(row.ibpAtual, row.ibpAnterior);
    return {
      diretoria: row.diretoria,
      tipo: row.tipo,
      ibpAtual: row.ibpAtual,
      ibpAnterior: row.ibpAnterior,
      variacao: row.variacao,
      variacaoPct: pct,
    };
  });

  return {
    snapshot: mapSnapshot(raw.snapshot),
    currentPhaseLabel: "Revisão Financeira",
    cycleProgress: 72,
    alignmentIndex: 78,
    alignmentDelta: revenuePct,
    kpis: (raw.kpis ?? []).map((kpi) => ({
      id: kpi.id,
      label: kpi.label,
      value: kpi.value,
      delta: kpi.delta,
      trend: (kpi.trend === "up" || kpi.trend === "down" ? kpi.trend : "neutral") as "up" | "down" | "neutral",
      icon: kpi.icon,
      mod: kpi.mod,
      href: KPI_HREFS[kpi.id],
    })),
    alerts: (raw.alerts ?? []).map((alert) => ({
      id: alert.id,
      type: alert.id,
      severity: alert.severity,
      title: alert.title,
      description: alert.description,
      quantity: alert.quantity,
      link: alert.link,
    })),
    alignmentHistory: [
      { label: "Mar", value: 74 },
      { label: "Abr", value: 76 },
      { label: "Mai", value: 75 },
      { label: "Jun", value: 77 },
      { label: "Jul", value: 78 },
    ],
    demandSupplyChart: bridge.slice(0, 8).map((item) => ({
      label: item.diretoria.slice(0, 16),
      demand: item.ibpAtual,
      supply: item.ibpAnterior,
    })),
    varianceBridge: [
      { label: "IBP Anterior", value: 100, color: "#2563eb" },
      { label: "Variação", value: revenuePct, color: revenuePct >= 0 ? "#10b981" : "#dc2626" },
      { label: "IBP Atual", value: revenuePct, color: "#0ea5e9" },
    ],
    topGaps: topVariances.slice(0, 5).map((row, index) => {
      const pct = variacaoPct(row.ibpAtual, row.ibpAnterior);
      return {
        id: `gap-${index}`,
        title: `${row.diretoria} × ${row.tipo}`,
        severity: severityFromPct(pct),
        diretoria: row.diretoria,
        tipo: row.tipo,
        value: formatCurrency(row.variacao),
        variacaoPct: pct,
      };
    }),
    upcomingMeetings: [],
    recentDecisions: [],
    reconciliationMatrix,
    summaryByTipo: [],
    summaryByDiretoria: bridge.map((item) => ({
      groupKey: item.diretoria,
      groupLabel: item.diretoria,
      ibpAtual: item.ibpAtual,
      ibpAnterior: item.ibpAnterior,
      variacao: item.variacao,
      variacaoPct: variacaoPct(item.ibpAtual, item.ibpAnterior),
    })),
  };
}

export function mapCompassYtdFromApi(raw: ApiYtdPage): CompassYtdPageDto {
  const items = (raw.items ?? []).map((row) => {
    const pct = variacaoPct(row.ibpAtual, row.ibpAnterior);
    const isVolume = row.tipo.toLowerCase().includes("volume");
    return {
      id: row.id,
      diretoria: row.diretoria,
      unidade: row.unidade,
      familia: row.familiaComercial,
      tipo: row.tipo,
      matriz: row.matriz,
      conta: row.skuDescription || row.skuCode,
      ibpAtual: row.ibpAtual,
      ibpAnterior: row.ibpAnterior,
      variacao: row.variacao,
      variacaoPct: pct,
      moeda: isVolume ? "UN" : "BRL",
    };
  });

  return {
    items,
    page: raw.page,
    pageSize: raw.pageSize,
    totalItems: raw.totalCount,
    totalPages: raw.totalPages,
    totals: sumTotals(items),
  };
}

export function mapCompassAggregatesFromApi(raw: ApiAggregates): CompassAggregatesDto {
  const rows = (raw.items ?? []).map((item) => ({
    groupKey: item.groupKey,
    groupLabel: item.groupKey,
    ibpAtual: item.ibpAtual,
    ibpAnterior: item.ibpAnterior,
    variacao: item.variacao,
    variacaoPct: variacaoPct(item.ibpAtual, item.ibpAnterior),
    rowCount: item.rowCount,
  }));

  return {
    groupBy: raw.groupBy as CompassAggregatesDto["groupBy"],
    rows,
    totals: sumTotals(rows),
  };
}
