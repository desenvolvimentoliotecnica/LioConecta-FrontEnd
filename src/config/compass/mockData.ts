import { LOOP_MOCK_DATA } from "../loop/mockData";
import type { CompassDataset, CompassPerson } from "./types";

const today = new Date();

function daysFromNow(offset: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function daysAgo(offset: number): string {
  return daysFromNow(-offset);
}

function monthStart(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

function monthEnd(year: number, month: number): string {
  const d = new Date(year, month, 0);
  return d.toISOString().slice(0, 10);
}

const loopPeopleAsCompass: CompassPerson[] = LOOP_MOCK_DATA.people.map((p) => ({
  id: p.id,
  name: p.name,
  role: p.role,
  area: p.area,
  businessUnitId:
    p.id === "p-felipe" || p.id === "p-camila"
      ? "bu-servicos"
      : p.id === "p-juliana" || p.id === "p-patricia"
        ? "bu-servicos"
        : "bu-industrial",
}));

const financePeople: CompassPerson[] = [
  {
    id: "p-marcos",
    name: "Marcos Vieira",
    role: "Controller",
    area: "Financeiro",
    businessUnitId: "bu-industrial",
  },
  {
    id: "p-natalia",
    name: "Natália Rocha",
    role: "Analista FP&A",
    area: "Financeiro",
    businessUnitId: "bu-servicos",
  },
  {
    id: "p-vicente",
    name: "Vicente Lima",
    role: "Gerente Supply",
    area: "Supply Chain",
    businessUnitId: "bu-industrial",
  },
];

const exportPerson: CompassPerson = {
  id: "p-rafael",
  name: "Rafael Mendonça",
  role: "Gerente Exportação",
  area: "Comercial Internacional",
  businessUnitId: "bu-export",
};

const cyclePhaseTemplate = (ownerId: string, activePhaseIndex: number) => [
  { phase: "coleta" as const, progress: 100, status: "concluido" as const, startDate: daysAgo(28), endDate: daysAgo(24), ownerId },
  { phase: "pre_sop_demanda" as const, progress: 100, status: "concluido" as const, startDate: daysAgo(23), endDate: daysAgo(18), ownerId: "p-natalia" },
  { phase: "pre_sop_supply" as const, progress: 100, status: "concluido" as const, startDate: daysAgo(17), endDate: daysAgo(12), ownerId: "p-vicente" },
  { phase: "sop_integrado" as const, progress: 100, status: "concluido" as const, startDate: daysAgo(11), endDate: daysAgo(6), ownerId },
  {
    phase: "revisao_financeira" as const,
    progress: activePhaseIndex >= 4 ? (activePhaseIndex === 4 ? 67 : 100) : 0,
    status: activePhaseIndex === 4 ? "em_andamento" as const : activePhaseIndex > 4 ? "concluido" as const : "pendente" as const,
    startDate: activePhaseIndex >= 4 ? daysAgo(5) : undefined,
    endDate: activePhaseIndex > 4 ? daysAgo(2) : undefined,
    ownerId: "p-marcos",
  },
  {
    phase: "executive" as const,
    progress: activePhaseIndex >= 5 ? 100 : 0,
    status: activePhaseIndex >= 5 ? "concluido" as const : "pendente" as const,
    startDate: activePhaseIndex >= 5 ? daysAgo(1) : undefined,
    endDate: activePhaseIndex >= 5 ? daysAgo(0) : undefined,
    ownerId: "p-leonardo",
  },
  {
    phase: "fechado" as const,
    progress: activePhaseIndex >= 6 ? 100 : 0,
    status: activePhaseIndex >= 6 ? "concluido" as const : "pendente" as const,
    ownerId: "p-leonardo",
  },
];

export const COMPASS_MOCK_DATA: CompassDataset = {
  people: [...loopPeopleAsCompass, ...financePeople, exportPerson],
  businessUnits: [
    {
      id: "bu-industrial",
      name: "Industrial",
      description: "Fabricação de equipamentos e componentes",
      managerId: "p-leonardo",
      region: "Sudeste",
    },
    {
      id: "bu-servicos",
      name: "Serviços",
      description: "Manutenção, consultoria e suporte técnico",
      managerId: "p-camila",
      region: "Nacional",
    },
    {
      id: "bu-export",
      name: "Export",
      description: "Operações de exportação e mercados internacionais",
      managerId: "p-rafael",
      region: "Global",
    },
  ],
  productLines: [
    { id: "pl-ind-motores", businessUnitId: "bu-industrial", name: "Motores Industriais", category: "Equipamentos", skuCount: 48 },
    { id: "pl-ind-comp", businessUnitId: "bu-industrial", name: "Componentes Mecânicos", category: "Peças", skuCount: 126 },
    { id: "pl-srv-manut", businessUnitId: "bu-servicos", name: "Manutenção Industrial", category: "Serviços", skuCount: 22 },
    { id: "pl-srv-cons", businessUnitId: "bu-servicos", name: "Consultoria Técnica", category: "Serviços", skuCount: 15 },
    { id: "pl-exp-latam", businessUnitId: "bu-export", name: "América Latina", category: "Exportação", skuCount: 34 },
    { id: "pl-exp-europa", businessUnitId: "bu-export", name: "Europa", category: "Exportação", skuCount: 28 },
  ],
  cycles: [
    {
      id: "cycle-2026-05",
      name: "Ciclo IBP — Maio/2026",
      month: 5,
      year: 2026,
      status: "fechado",
      currentPhase: "fechado",
      progress: 100,
      startDate: monthStart(2026, 5),
      endDate: monthEnd(2026, 5),
      sponsorId: "p-leonardo",
      phases: cyclePhaseTemplate("p-marcos", 6),
    },
    {
      id: "cycle-2026-06",
      name: "Ciclo IBP — Junho/2026",
      month: 6,
      year: 2026,
      status: "fechado",
      currentPhase: "fechado",
      progress: 100,
      startDate: monthStart(2026, 6),
      endDate: monthEnd(2026, 6),
      sponsorId: "p-leonardo",
      phases: cyclePhaseTemplate("p-marcos", 6),
    },
    {
      id: "cycle-2026-07",
      name: "Ciclo IBP — Julho/2026",
      month: 7,
      year: 2026,
      status: "ativo",
      currentPhase: "revisao_financeira",
      progress: 67,
      startDate: monthStart(2026, 7),
      endDate: monthEnd(2026, 7),
      sponsorId: "p-leonardo",
      phases: cyclePhaseTemplate("p-marcos", 4),
    },
  ],
  demandForecasts: [
    { id: "df-1", cycleId: "cycle-2026-07", productLineId: "pl-ind-motores", businessUnitId: "bu-industrial", period: "2026-Q3", volumeUnits: 1250, revenueAmount: 8750000, confidence: 82, version: 3, ownerId: "p-natalia", updatedAt: daysAgo(3), notes: "Demanda elevada por contratos Petrobras" },
    { id: "df-2", cycleId: "cycle-2026-07", productLineId: "pl-ind-comp", businessUnitId: "bu-industrial", period: "2026-Q3", volumeUnits: 4200, revenueAmount: 3150000, confidence: 78, version: 2, ownerId: "p-natalia", updatedAt: daysAgo(4) },
    { id: "df-3", cycleId: "cycle-2026-07", productLineId: "pl-srv-manut", businessUnitId: "bu-servicos", period: "2026-Q3", volumeUnits: 890, revenueAmount: 4450000, confidence: 85, version: 2, ownerId: "p-felipe", updatedAt: daysAgo(2) },
    { id: "df-4", cycleId: "cycle-2026-07", productLineId: "pl-srv-cons", businessUnitId: "bu-servicos", period: "2026-Q3", volumeUnits: 320, revenueAmount: 1920000, confidence: 72, version: 1, ownerId: "p-camila", updatedAt: daysAgo(5) },
    { id: "df-5", cycleId: "cycle-2026-07", productLineId: "pl-exp-latam", businessUnitId: "bu-export", period: "2026-Q3", volumeUnits: 680, revenueAmount: 5440000, confidence: 68, version: 2, ownerId: "p-rafael", updatedAt: daysAgo(3), notes: "Incerteza cambial ARS" },
    { id: "df-6", cycleId: "cycle-2026-07", productLineId: "pl-exp-europa", businessUnitId: "bu-export", period: "2026-Q3", volumeUnits: 410, revenueAmount: 6150000, confidence: 80, version: 2, ownerId: "p-rafael", updatedAt: daysAgo(2) },
    { id: "df-7", cycleId: "cycle-2026-07", productLineId: "pl-ind-motores", businessUnitId: "bu-industrial", period: "2026-Q4", volumeUnits: 1180, revenueAmount: 8260000, confidence: 65, version: 1, ownerId: "p-natalia", updatedAt: daysAgo(6) },
    { id: "df-8", cycleId: "cycle-2026-07", productLineId: "pl-ind-comp", businessUnitId: "bu-industrial", period: "2026-Q4", volumeUnits: 3900, revenueAmount: 2925000, confidence: 70, version: 1, ownerId: "p-natalia", updatedAt: daysAgo(6) },
    { id: "df-9", cycleId: "cycle-2026-07", productLineId: "pl-srv-manut", businessUnitId: "bu-servicos", period: "2026-Q4", volumeUnits: 920, revenueAmount: 4600000, confidence: 75, version: 1, ownerId: "p-felipe", updatedAt: daysAgo(7) },
    { id: "df-10", cycleId: "cycle-2026-06", productLineId: "pl-ind-motores", businessUnitId: "bu-industrial", period: "2026-Q2", volumeUnits: 1100, revenueAmount: 7700000, confidence: 88, version: 4, ownerId: "p-natalia", updatedAt: daysAgo(35) },
    { id: "df-11", cycleId: "cycle-2026-06", productLineId: "pl-ind-comp", businessUnitId: "bu-industrial", period: "2026-Q2", volumeUnits: 4000, revenueAmount: 3000000, confidence: 86, version: 3, ownerId: "p-natalia", updatedAt: daysAgo(35) },
    { id: "df-12", cycleId: "cycle-2026-06", productLineId: "pl-srv-manut", businessUnitId: "bu-servicos", period: "2026-Q2", volumeUnits: 850, revenueAmount: 4250000, confidence: 90, version: 3, ownerId: "p-felipe", updatedAt: daysAgo(34) },
    { id: "df-13", cycleId: "cycle-2026-06", productLineId: "pl-exp-latam", businessUnitId: "bu-export", period: "2026-Q2", volumeUnits: 620, revenueAmount: 4960000, confidence: 75, version: 3, ownerId: "p-rafael", updatedAt: daysAgo(33) },
    { id: "df-14", cycleId: "cycle-2026-06", productLineId: "pl-exp-europa", businessUnitId: "bu-export", period: "2026-Q2", volumeUnits: 380, revenueAmount: 5700000, confidence: 82, version: 3, ownerId: "p-rafael", updatedAt: daysAgo(33) },
    { id: "df-15", cycleId: "cycle-2026-05", productLineId: "pl-ind-motores", businessUnitId: "bu-industrial", period: "2026-Q2", volumeUnits: 1050, revenueAmount: 7350000, confidence: 91, version: 5, ownerId: "p-natalia", updatedAt: daysAgo(65) },
    { id: "df-16", cycleId: "cycle-2026-05", productLineId: "pl-srv-cons", businessUnitId: "bu-servicos", period: "2026-Q2", volumeUnits: 290, revenueAmount: 1740000, confidence: 84, version: 4, ownerId: "p-camila", updatedAt: daysAgo(64) },
    { id: "df-17", cycleId: "cycle-2026-07", productLineId: "pl-srv-cons", businessUnitId: "bu-servicos", period: "2026-Q3", volumeUnits: 340, revenueAmount: 2040000, confidence: 74, version: 2, ownerId: "p-camila", updatedAt: daysAgo(4) },
    { id: "df-18", cycleId: "cycle-2026-07", productLineId: "pl-exp-latam", businessUnitId: "bu-export", period: "2026-Q4", volumeUnits: 720, revenueAmount: 5760000, confidence: 60, version: 1, ownerId: "p-rafael", updatedAt: daysAgo(8) },
  ],
  supplyPlans: [
    { id: "sp-1", cycleId: "cycle-2026-07", productLineId: "pl-ind-motores", businessUnitId: "bu-industrial", period: "2026-Q3", plannedVolume: 1180, capacityVolume: 1300, utilizationPercent: 91, inventoryTarget: 180, ownerId: "p-vicente", updatedAt: daysAgo(3), constraintNotes: "Linha 2 em manutenção preventiva" },
    { id: "sp-2", cycleId: "cycle-2026-07", productLineId: "pl-ind-comp", businessUnitId: "bu-industrial", period: "2026-Q3", plannedVolume: 4100, capacityVolume: 4500, utilizationPercent: 91, inventoryTarget: 520, ownerId: "p-vicente", updatedAt: daysAgo(3) },
    { id: "sp-3", cycleId: "cycle-2026-07", productLineId: "pl-srv-manut", businessUnitId: "bu-servicos", period: "2026-Q3", plannedVolume: 890, capacityVolume: 950, utilizationPercent: 94, inventoryTarget: 0, ownerId: "p-vicente", updatedAt: daysAgo(2) },
    { id: "sp-4", cycleId: "cycle-2026-07", productLineId: "pl-srv-cons", businessUnitId: "bu-servicos", period: "2026-Q3", plannedVolume: 300, capacityVolume: 400, utilizationPercent: 75, inventoryTarget: 0, ownerId: "p-vicente", updatedAt: daysAgo(4) },
    { id: "sp-5", cycleId: "cycle-2026-07", productLineId: "pl-exp-latam", businessUnitId: "bu-export", period: "2026-Q3", plannedVolume: 620, capacityVolume: 700, utilizationPercent: 89, inventoryTarget: 95, ownerId: "p-vicente", updatedAt: daysAgo(3) },
    { id: "sp-6", cycleId: "cycle-2026-07", productLineId: "pl-exp-europa", businessUnitId: "bu-export", period: "2026-Q3", plannedVolume: 410, capacityVolume: 450, utilizationPercent: 91, inventoryTarget: 60, ownerId: "p-vicente", updatedAt: daysAgo(2) },
    { id: "sp-7", cycleId: "cycle-2026-07", productLineId: "pl-ind-motores", businessUnitId: "bu-industrial", period: "2026-Q4", plannedVolume: 1100, capacityVolume: 1300, utilizationPercent: 85, inventoryTarget: 200, ownerId: "p-vicente", updatedAt: daysAgo(5) },
    { id: "sp-8", cycleId: "cycle-2026-07", productLineId: "pl-ind-comp", businessUnitId: "bu-industrial", period: "2026-Q4", plannedVolume: 3800, capacityVolume: 4500, utilizationPercent: 84, inventoryTarget: 480, ownerId: "p-vicente", updatedAt: daysAgo(5) },
    { id: "sp-9", cycleId: "cycle-2026-07", productLineId: "pl-srv-manut", businessUnitId: "bu-servicos", period: "2026-Q4", plannedVolume: 900, capacityVolume: 950, utilizationPercent: 95, inventoryTarget: 0, ownerId: "p-vicente", updatedAt: daysAgo(6) },
    { id: "sp-10", cycleId: "cycle-2026-06", productLineId: "pl-ind-motores", businessUnitId: "bu-industrial", period: "2026-Q2", plannedVolume: 1100, capacityVolume: 1300, utilizationPercent: 85, inventoryTarget: 160, ownerId: "p-vicente", updatedAt: daysAgo(35) },
    { id: "sp-11", cycleId: "cycle-2026-06", productLineId: "pl-ind-comp", businessUnitId: "bu-industrial", period: "2026-Q2", plannedVolume: 4000, capacityVolume: 4500, utilizationPercent: 89, inventoryTarget: 500, ownerId: "p-vicente", updatedAt: daysAgo(35) },
    { id: "sp-12", cycleId: "cycle-2026-06", productLineId: "pl-srv-manut", businessUnitId: "bu-servicos", period: "2026-Q2", plannedVolume: 850, capacityVolume: 950, utilizationPercent: 89, inventoryTarget: 0, ownerId: "p-vicente", updatedAt: daysAgo(34) },
    { id: "sp-13", cycleId: "cycle-2026-06", productLineId: "pl-exp-latam", businessUnitId: "bu-export", period: "2026-Q2", plannedVolume: 620, capacityVolume: 700, utilizationPercent: 89, inventoryTarget: 90, ownerId: "p-vicente", updatedAt: daysAgo(33) },
    { id: "sp-14", cycleId: "cycle-2026-06", productLineId: "pl-exp-europa", businessUnitId: "bu-export", period: "2026-Q2", plannedVolume: 380, capacityVolume: 450, utilizationPercent: 84, inventoryTarget: 55, ownerId: "p-vicente", updatedAt: daysAgo(33) },
    { id: "sp-15", cycleId: "cycle-2026-05", productLineId: "pl-ind-motores", businessUnitId: "bu-industrial", period: "2026-Q2", plannedVolume: 1050, capacityVolume: 1300, utilizationPercent: 81, inventoryTarget: 150, ownerId: "p-vicente", updatedAt: daysAgo(65) },
    { id: "sp-16", cycleId: "cycle-2026-05", productLineId: "pl-srv-cons", businessUnitId: "bu-servicos", period: "2026-Q2", plannedVolume: 290, capacityVolume: 400, utilizationPercent: 73, inventoryTarget: 0, ownerId: "p-vicente", updatedAt: daysAgo(64) },
    { id: "sp-17", cycleId: "cycle-2026-07", productLineId: "pl-srv-cons", businessUnitId: "bu-servicos", period: "2026-Q4", plannedVolume: 320, capacityVolume: 400, utilizationPercent: 80, inventoryTarget: 0, ownerId: "p-vicente", updatedAt: daysAgo(7) },
    { id: "sp-18", cycleId: "cycle-2026-07", productLineId: "pl-exp-latam", businessUnitId: "bu-export", period: "2026-Q4", plannedVolume: 650, capacityVolume: 700, utilizationPercent: 93, inventoryTarget: 100, ownerId: "p-vicente", updatedAt: daysAgo(8) },
  ],
  financialPlans: [
    { id: "fp-1", cycleId: "cycle-2026-07", businessUnitId: "bu-industrial", productLineId: "pl-ind-motores", period: "2026-Q3", revenue: 8750000, cogs: 5250000, grossMargin: 3500000, opex: 875000, ebitda: 2625000, ownerId: "p-marcos", updatedAt: daysAgo(2), currency: "BRL" },
    { id: "fp-2", cycleId: "cycle-2026-07", businessUnitId: "bu-industrial", productLineId: "pl-ind-comp", period: "2026-Q3", revenue: 3150000, cogs: 2205000, grossMargin: 945000, opex: 315000, ebitda: 630000, ownerId: "p-marcos", updatedAt: daysAgo(2), currency: "BRL" },
    { id: "fp-3", cycleId: "cycle-2026-07", businessUnitId: "bu-servicos", productLineId: "pl-srv-manut", period: "2026-Q3", revenue: 4450000, cogs: 2225000, grossMargin: 2225000, opex: 667500, ebitda: 1557500, ownerId: "p-marcos", updatedAt: daysAgo(2), currency: "BRL" },
    { id: "fp-4", cycleId: "cycle-2026-07", businessUnitId: "bu-servicos", productLineId: "pl-srv-cons", period: "2026-Q3", revenue: 1920000, cogs: 768000, grossMargin: 1152000, opex: 384000, ebitda: 768000, ownerId: "p-marcos", updatedAt: daysAgo(3), currency: "BRL" },
    { id: "fp-5", cycleId: "cycle-2026-07", businessUnitId: "bu-export", productLineId: "pl-exp-latam", period: "2026-Q3", revenue: 5440000, cogs: 3808000, grossMargin: 1632000, opex: 544000, ebitda: 1088000, ownerId: "p-marcos", updatedAt: daysAgo(2), currency: "BRL" },
    { id: "fp-6", cycleId: "cycle-2026-07", businessUnitId: "bu-export", productLineId: "pl-exp-europa", period: "2026-Q3", revenue: 6150000, cogs: 3690000, grossMargin: 2460000, opex: 615000, ebitda: 1845000, ownerId: "p-marcos", updatedAt: daysAgo(2), currency: "BRL" },
    { id: "fp-7", cycleId: "cycle-2026-07", businessUnitId: "bu-industrial", period: "2026-Q3", revenue: 11900000, cogs: 7455000, grossMargin: 4445000, opex: 1190000, ebitda: 3255000, ownerId: "p-marcos", updatedAt: daysAgo(1), currency: "BRL" },
    { id: "fp-8", cycleId: "cycle-2026-07", businessUnitId: "bu-servicos", period: "2026-Q3", revenue: 6370000, cogs: 2993000, grossMargin: 3377000, opex: 1051500, ebitda: 2325500, ownerId: "p-marcos", updatedAt: daysAgo(1), currency: "BRL" },
    { id: "fp-9", cycleId: "cycle-2026-07", businessUnitId: "bu-export", period: "2026-Q3", revenue: 11590000, cogs: 7498000, grossMargin: 4092000, opex: 1159000, ebitda: 2933000, ownerId: "p-marcos", updatedAt: daysAgo(1), currency: "BRL" },
    { id: "fp-10", cycleId: "cycle-2026-06", businessUnitId: "bu-industrial", period: "2026-Q2", revenue: 10700000, cogs: 6741000, grossMargin: 3959000, opex: 1070000, ebitda: 2889000, ownerId: "p-marcos", updatedAt: daysAgo(35), currency: "BRL" },
    { id: "fp-11", cycleId: "cycle-2026-06", businessUnitId: "bu-servicos", period: "2026-Q2", revenue: 5990000, cogs: 2815000, grossMargin: 3175000, opex: 988500, ebitda: 2186500, ownerId: "p-marcos", updatedAt: daysAgo(35), currency: "BRL" },
    { id: "fp-12", cycleId: "cycle-2026-06", businessUnitId: "bu-export", period: "2026-Q2", revenue: 10660000, cogs: 6929000, grossMargin: 3731000, opex: 1066000, ebitda: 2665000, ownerId: "p-marcos", updatedAt: daysAgo(35), currency: "BRL" },
    { id: "fp-13", cycleId: "cycle-2026-05", businessUnitId: "bu-industrial", period: "2026-Q2", revenue: 10350000, cogs: 6521000, grossMargin: 3829000, opex: 1035000, ebitda: 2794000, ownerId: "p-marcos", updatedAt: daysAgo(65), currency: "BRL" },
    { id: "fp-14", cycleId: "cycle-2026-05", businessUnitId: "bu-servicos", period: "2026-Q2", revenue: 5990000, cogs: 2815000, grossMargin: 3175000, opex: 988500, ebitda: 2186500, ownerId: "p-marcos", updatedAt: daysAgo(65), currency: "BRL" },
    { id: "fp-15", cycleId: "cycle-2026-07", businessUnitId: "bu-industrial", period: "2026-Q4", revenue: 11185000, cogs: 7036000, grossMargin: 4149000, opex: 1118500, ebitda: 3030500, ownerId: "p-marcos", updatedAt: daysAgo(4), currency: "BRL" },
    { id: "fp-16", cycleId: "cycle-2026-07", businessUnitId: "bu-servicos", period: "2026-Q4", revenue: 6640000, cogs: 3125000, grossMargin: 3515000, opex: 1095600, ebitda: 2419400, ownerId: "p-marcos", updatedAt: daysAgo(4), currency: "BRL" },
    { id: "fp-17", cycleId: "cycle-2026-07", businessUnitId: "bu-export", period: "2026-Q4", revenue: 11910000, cogs: 7732000, grossMargin: 4178000, opex: 1191000, ebitda: 2987000, ownerId: "p-marcos", updatedAt: daysAgo(4), currency: "BRL" },
    { id: "fp-18", cycleId: "cycle-2026-07", businessUnitId: "bu-export", productLineId: "pl-exp-latam", period: "2026-Q4", revenue: 5760000, cogs: 4032000, grossMargin: 1728000, opex: 576000, ebitda: 1152000, ownerId: "p-marcos", updatedAt: daysAgo(5), currency: "BRL" },
  ],
  gaps: [
    { id: "gap-1", cycleId: "cycle-2026-07", businessUnitId: "bu-industrial", productLineId: "pl-ind-motores", type: "demanda_supply", severity: "critico", status: "aberto", title: "Gap demanda × supply — Motores Q3", description: "Demanda 70 un acima da capacidade disponível na linha 2", demandValue: 1250, supplyValue: 1180, gapAmount: 490000, gapPercent: 5.6, ownerId: "p-vicente", dueDate: daysFromNow(5), createdAt: daysAgo(2) },
    { id: "gap-2", cycleId: "cycle-2026-07", businessUnitId: "bu-export", productLineId: "pl-exp-latam", type: "demanda_financeiro", severity: "critico", status: "em_analise", title: "Receita LATAM abaixo do forecast financeiro", description: "Hedge cambial insuficiente para cenário ARS", demandValue: 5440000, financialValue: 5100000, gapAmount: 340000, gapPercent: 6.3, ownerId: "p-marcos", dueDate: daysFromNow(3), createdAt: daysAgo(1) },
    { id: "gap-3", cycleId: "cycle-2026-07", businessUnitId: "bu-servicos", productLineId: "pl-srv-cons", type: "demanda_supply", severity: "alto", status: "aberto", title: "Consultoria — demanda acima do plano supply", description: "Pipeline comercial superou capacidade de consultores", demandValue: 320, supplyValue: 300, gapAmount: 120000, gapPercent: 6.3, ownerId: "p-camila", dueDate: daysFromNow(7), createdAt: daysAgo(3) },
    { id: "gap-4", cycleId: "cycle-2026-07", businessUnitId: "bu-industrial", productLineId: "pl-ind-comp", type: "supply_financeiro", severity: "medio", status: "em_analise", title: "COGS componentes acima do budget", description: "Inflação de matéria-prima impactou margem", supplyValue: 4100, financialValue: 3150000, gapAmount: 185000, gapPercent: 5.9, ownerId: "p-marcos", dueDate: daysFromNow(10), createdAt: daysAgo(4) },
    { id: "gap-5", cycleId: "cycle-2026-07", businessUnitId: "bu-servicos", productLineId: "pl-srv-manut", type: "capacidade", severity: "medio", status: "mitigado", title: "Utilização manutenção acima de 90%", description: "Contratação de 2 técnicos em andamento", gapAmount: 0, gapPercent: 4.2, ownerId: "p-vicente", dueDate: daysFromNow(14), createdAt: daysAgo(6) },
    { id: "gap-6", cycleId: "cycle-2026-07", businessUnitId: "bu-export", productLineId: "pl-exp-europa", type: "demanda_supply", severity: "baixo", status: "fechado", title: "Alinhamento Europa Q3", description: "Gap residual fechado após ajuste de estoque", demandValue: 410, supplyValue: 410, gapAmount: 0, gapPercent: 0, ownerId: "p-rafael", dueDate: daysAgo(2), createdAt: daysAgo(8) },
    { id: "gap-7", cycleId: "cycle-2026-07", businessUnitId: "bu-industrial", type: "demanda_financeiro", severity: "alto", status: "aberto", title: "EBITDA Industrial abaixo da meta", description: "Opex de manutenção não previsto no plano financeiro", financialValue: 3255000, gapAmount: 420000, gapPercent: 11.4, ownerId: "p-marcos", dueDate: daysFromNow(4), createdAt: daysAgo(1) },
    { id: "gap-8", cycleId: "cycle-2026-06", businessUnitId: "bu-export", productLineId: "pl-exp-latam", type: "demanda_supply", severity: "medio", status: "fechado", title: "Gap LATAM Jun/2026", description: "Resolvido com realocação de estoque", gapAmount: 210000, gapPercent: 4.2, ownerId: "p-rafael", dueDate: daysAgo(30), createdAt: daysAgo(38) },
  ],
  meetings: [
    { id: "mtg-1", cycleId: "cycle-2026-07", type: "pre_sop_demanda", title: "Pré-S&OP Demanda — Jul/2026", scheduledAt: `${daysAgo(18)}T14:00:00`, durationMinutes: 90, facilitatorId: "p-natalia", attendeeIds: ["p-natalia", "p-felipe", "p-camila", "p-rafael"], status: "concluida", agendaSummary: "Revisão forecast Q3/Q4 por linha de produto", decisionsCount: 2 },
    { id: "mtg-2", cycleId: "cycle-2026-07", type: "pre_sop_supply", title: "Pré-S&OP Supply — Jul/2026", scheduledAt: `${daysAgo(12)}T10:00:00`, durationMinutes: 120, facilitatorId: "p-vicente", attendeeIds: ["p-vicente", "p-marcos", "p-leonardo"], status: "concluida", agendaSummary: "Capacidade, restrições e plano de produção", decisionsCount: 1 },
    { id: "mtg-3", cycleId: "cycle-2026-07", type: "sop_integrado", title: "S&OP Integrado — Jul/2026", scheduledAt: `${daysAgo(6)}T09:00:00`, durationMinutes: 180, facilitatorId: "p-leonardo", attendeeIds: ["p-leonardo", "p-marcos", "p-natalia", "p-vicente", "p-camila", "p-rafael"], status: "concluida", agendaSummary: "Balanceamento demanda-supply e gaps prioritários", decisionsCount: 3 },
    { id: "mtg-4", cycleId: "cycle-2026-07", type: "revisao_financeira", title: "Revisão Financeira — Jul/2026", scheduledAt: `${daysFromNow(2)}T14:00:00`, durationMinutes: 120, facilitatorId: "p-marcos", attendeeIds: ["p-marcos", "p-natalia", "p-leonardo", "p-camila"], status: "agendada", agendaSummary: "P&L consolidado, gaps financeiros e cenários", decisionsCount: 0 },
    { id: "mtg-5", cycleId: "cycle-2026-07", type: "executive", title: "Comitê Executivo IBP — Jul/2026", scheduledAt: `${daysFromNow(8)}T09:00:00`, durationMinutes: 150, facilitatorId: "p-leonardo", attendeeIds: ["p-leonardo", "p-marcos", "p-camila", "p-rafael"], status: "agendada", agendaSummary: "Aprovação plano integrado e decisões estratégicas", decisionsCount: 0 },
  ],
  decisions: [
    { id: "dec-1", cycleId: "cycle-2026-07", meetingId: "mtg-1", title: "Aumentar forecast Motores Q3 em 5%", description: "Contrato Petrobras confirmado", businessUnitId: "bu-industrial", productLineId: "pl-ind-motores", impactAmount: 437500, status: "aprovada", ownerId: "p-natalia", decidedAt: daysAgo(18), dueDate: daysAgo(18) },
    { id: "dec-2", cycleId: "cycle-2026-07", meetingId: "mtg-1", title: "Manter forecast Serviços conservador", description: "Pipeline incerto para consultoria", businessUnitId: "bu-servicos", productLineId: "pl-srv-cons", impactAmount: 0, status: "aprovada", ownerId: "p-camila", decidedAt: daysAgo(18), dueDate: daysAgo(18) },
    { id: "dec-3", cycleId: "cycle-2026-07", meetingId: "mtg-2", title: "Manutenção preventiva linha 2 — Semana 28", description: "Reduz capacidade motores em 70 un/mês", businessUnitId: "bu-industrial", productLineId: "pl-ind-motores", impactAmount: -490000, status: "aprovada", ownerId: "p-vicente", decidedAt: daysAgo(12), dueDate: daysAgo(12) },
    { id: "dec-4", cycleId: "cycle-2026-07", meetingId: "mtg-3", title: "Priorizar LATAM sobre estoque Europa", description: "Realocar 40 un do estoque europeu", businessUnitId: "bu-export", productLineId: "pl-exp-latam", impactAmount: 320000, status: "pendente", ownerId: "p-rafael", dueDate: daysFromNow(5) },
    { id: "dec-5", cycleId: "cycle-2026-07", meetingId: "mtg-3", title: "Contratar 2 consultores sênior", description: "Fechar gap consultoria Q3", businessUnitId: "bu-servicos", productLineId: "pl-srv-cons", impactAmount: 240000, status: "pendente", ownerId: "p-camila", dueDate: daysFromNow(10) },
    { id: "dec-6", cycleId: "cycle-2026-07", meetingId: "mtg-3", title: "Hedge cambial adicional LATAM", description: "Cobertura 60% exposição ARS", businessUnitId: "bu-export", productLineId: "pl-exp-latam", impactAmount: 180000, status: "pendente", ownerId: "p-marcos", dueDate: daysFromNow(3), scenarioId: "scn-2" },
  ],
  scenarios: [
    { id: "scn-1", cycleId: "cycle-2026-07", name: "Base — Jul/2026", description: "Cenário base aprovado no S&OP integrado", status: "ativo", authorId: "p-natalia", businessUnitIds: ["bu-industrial", "bu-servicos", "bu-export"], revenueDelta: 0, marginDelta: 0, volumeDelta: 0, assumptions: ["Câmbio USD/BRL 5,10", "IPCA 4,2% anual", "Capacidade linha 2 normalizada em Ago"], createdAt: daysAgo(6), updatedAt: daysAgo(1) },
    { id: "scn-2", cycleId: "cycle-2026-07", name: "Stress LATAM", description: "Desvalorização ARS 15% e queda demanda 8%", status: "rascunho", authorId: "p-marcos", businessUnitIds: ["bu-export"], revenueDelta: -920000, marginDelta: -310000, volumeDelta: -54, assumptions: ["ARS -15% vs base", "Demanda LATAM -8%", "Hedge parcial 60%"], createdAt: daysAgo(3), updatedAt: daysAgo(1) },
    { id: "scn-3", cycleId: "cycle-2026-07", name: "Upside Industrial", description: "Contrato adicional Petrobras +200 un/trim", status: "rascunho", authorId: "p-vicente", businessUnitIds: ["bu-industrial"], revenueDelta: 1400000, marginDelta: 420000, volumeDelta: 200, assumptions: ["Contrato adicional Q4", "Overtime linha 1", "Matéria-prima garantida"], createdAt: daysAgo(2), updatedAt: daysAgo(0) },
  ],
  alignmentHistory: [
    { referenceDate: daysAgo(28), value: 71 },
    { referenceDate: daysAgo(21), value: 74 },
    { referenceDate: daysAgo(14), value: 76 },
    { referenceDate: daysAgo(7), value: 78 },
    { referenceDate: today.toISOString().slice(0, 10), value: 79 },
  ],
};
