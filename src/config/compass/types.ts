export type CompassPeriod = "month" | "quarter" | "year";

export type CompassPersona = "executive" | "planner" | "contributor";

export type CompassCyclePhase =
  | "coleta"
  | "pre_sop_demanda"
  | "pre_sop_supply"
  | "sop_integrado"
  | "revisao_financeira"
  | "executive"
  | "fechado";

export type CompassCycleStatus = "ativo" | "fechado" | "planejado";

export type GapSeverity = "critico" | "alto" | "medio" | "baixo";

export type CompassSeverity = GapSeverity;

export type GapType = "demanda_supply" | "supply_financeiro" | "demanda_financeiro" | "capacidade";

export type GapStatus = "aberto" | "em_analise" | "mitigado" | "fechado";

export type GapArea = "demand" | "supply" | "finance";

export type IbMeetingType =
  | "pre_sop_demanda"
  | "pre_sop_supply"
  | "sop_integrado"
  | "revisao_financeira"
  | "executive"
  | "follow_up";

export type IbMeetingStatus = "agendada" | "em_andamento" | "concluida" | "cancelada";

export type IbDecisionStatus = "pendente" | "aprovada" | "rejeitada" | "adiada";

export type IbScenarioStatus = "rascunho" | "ativo" | "aprovado" | "arquivado";

export type CompassKpiMod = "blue" | "green" | "amber" | "red" | "purple";

export type CompassPerson = {
  id: string;
  name: string;
  role: string;
  area: string;
  businessUnitId?: string;
};

export type BusinessUnit = {
  id: string;
  name: string;
  description: string;
  managerId: string;
  region: string;
};

export type ProductLine = {
  id: string;
  businessUnitId: string;
  name: string;
  category: string;
  skuCount: number;
};

export type CompassCyclePhaseProgress = {
  phase: CompassCyclePhase;
  progress: number;
  status: "pendente" | "em_andamento" | "concluido";
  startDate?: string;
  endDate?: string;
  ownerId: string;
};

export type CompassCycle = {
  id: string;
  name: string;
  month: number;
  year: number;
  status: CompassCycleStatus;
  currentPhase: CompassCyclePhase;
  progress: number;
  startDate: string;
  endDate: string;
  phases: CompassCyclePhaseProgress[];
  sponsorId: string;
};

export type DemandForecast = {
  id: string;
  cycleId: string;
  productLineId: string;
  businessUnitId: string;
  period: string;
  volumeUnits: number;
  revenueAmount: number;
  confidence: number;
  version: number;
  ownerId: string;
  updatedAt: string;
  notes?: string;
};

export type SupplyPlan = {
  id: string;
  cycleId: string;
  productLineId: string;
  businessUnitId: string;
  period: string;
  plannedVolume: number;
  capacityVolume: number;
  utilizationPercent: number;
  inventoryTarget: number;
  ownerId: string;
  updatedAt: string;
  constraintNotes?: string;
};

export type FinancialPlan = {
  id: string;
  cycleId: string;
  businessUnitId: string;
  productLineId?: string;
  period: string;
  revenue: number;
  cogs: number;
  grossMargin: number;
  opex: number;
  ebitda: number;
  ownerId: string;
  updatedAt: string;
  currency: "BRL";
};

export type ReconciliationGap = {
  id: string;
  cycleId: string;
  businessUnitId: string;
  productLineId?: string;
  type: GapType;
  severity: GapSeverity;
  status: GapStatus;
  title: string;
  description: string;
  demandValue?: number;
  supplyValue?: number;
  financialValue?: number;
  gapAmount: number;
  gapPercent: number;
  ownerId: string;
  dueDate: string;
  createdAt: string;
};

export type IbMeeting = {
  id: string;
  cycleId: string;
  type: IbMeetingType;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  facilitatorId: string;
  attendeeIds: string[];
  status: IbMeetingStatus;
  agendaSummary: string;
  decisionsCount: number;
};

export type IbDecision = {
  id: string;
  cycleId: string;
  meetingId: string;
  title: string;
  description: string;
  businessUnitId: string;
  productLineId?: string;
  impactAmount: number;
  status: IbDecisionStatus;
  ownerId: string;
  decidedAt?: string;
  dueDate: string;
  scenarioId?: string;
};

export type IbScenario = {
  id: string;
  cycleId: string;
  name: string;
  description: string;
  status: IbScenarioStatus;
  authorId: string;
  businessUnitIds: string[];
  revenueDelta: number;
  marginDelta: number;
  volumeDelta: number;
  assumptions: string[];
  createdAt: string;
  updatedAt: string;
};

export type CompassAlert = {
  id: string;
  type: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  quantity: number;
  date: string;
  origin: string;
  link: string;
};

export type CompassKpi = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  icon: string;
  mod: CompassKpiMod;
  href?: string;
};

export type CompassKpiHistory = {
  referenceDate: string;
  value: number;
};

export type CompassDataset = {
  people: CompassPerson[];
  businessUnits: BusinessUnit[];
  productLines: ProductLine[];
  cycles: CompassCycle[];
  demandForecasts: DemandForecast[];
  supplyPlans: SupplyPlan[];
  financialPlans: FinancialPlan[];
  gaps: ReconciliationGap[];
  meetings: IbMeeting[];
  decisions: IbDecision[];
  scenarios: IbScenario[];
  alignmentHistory: CompassKpiHistory[];
};

export type CompassFilters = {
  diretoria?: string;
  unidade?: string;
  familia?: string;
  tipo?: string;
  search?: string;
};

export type CompassPersonaContext = {
  persona: CompassPersona;
  personId: string;
  diretoria?: string;
  visibleDiretorias: string[];
  readOnly: boolean;
  label: string;
};

export type EnrichedDemandForecast = DemandForecast & {
  productLineName: string;
  businessUnitName: string;
  ownerName: string;
  product: string;
  volume: number;
  revenue: string;
  trend: "up" | "down" | "neutral";
};

export type EnrichedSupplyPlan = SupplyPlan & {
  productLineName: string;
  businessUnitName: string;
  ownerName: string;
  capacityGap: number;
  product: string;
  capacity: number;
  utilization: number;
  gap: number;
  status: "ok" | "atencao" | "critico";
};

export type EnrichedFinancialPlan = FinancialPlan & {
  businessUnitName: string;
  productLineName: string;
  ownerName: string;
  marginPercent: number;
};

export type EnrichedGap = ReconciliationGap & {
  businessUnitName: string;
  productLineName: string;
  ownerName: string;
  typeLabel: string;
  severityLabel: string;
  from: GapArea;
  to: GapArea;
  value: string;
};

export type EnrichedMeeting = IbMeeting & {
  facilitatorName: string;
  attendeeNames: string[];
  typeLabel: string;
  date: string;
  time: string;
  phaseLabel: string;
  agenda: string;
  attendeeCount: number;
};

export type EnrichedDecision = IbDecision & {
  businessUnitName: string;
  productLineName: string;
  ownerName: string;
  meetingTitle: string;
  impact: string;
  priority: "alta" | "media" | "baixa";
};

export type EnrichedScenario = IbScenario & {
  authorName: string;
  businessUnitNames: string[];
  selected: boolean;
  demandDelta: string;
  supplyDelta: string;
  margin: string;
};

export type CompassCyclePhaseView = {
  id: string;
  label: string;
  icon: string;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
  checklist: { id: string; label: string; done: boolean }[];
};

export type CompassCycleView = {
  cycleName: string;
  overallProgress: number;
  currentPhase: CompassCyclePhase;
  sponsorName: string;
  openGaps: number;
  pendingDecisions: number;
  upcomingMeetings: number;
  phases: CompassCyclePhaseView[];
};

export type CompassDemandView = {
  forecasts: EnrichedDemandForecast[];
  totalRevenue: number;
  totalVolume: number;
  avgConfidence: number;
  byBusinessUnit: { label: string; revenue: number; volume: number }[];
};

export type CompassSupplyView = {
  plans: EnrichedSupplyPlan[];
  rows: EnrichedSupplyPlan[];
  totalPlanned: number;
  totalCapacity: number;
  avgUtilization: number;
  constrainedLines: EnrichedSupplyPlan[];
};

export type CompassFinancialPlRow = {
  id: string;
  line: string;
  plan: string;
  forecast: string;
  actual: string;
  variance: string;
  variancePct: number;
};

export type CompassFinancialView = {
  plans: EnrichedFinancialPlan[];
  totalRevenue: number;
  totalEbitda: number;
  avgMargin: number;
  byBusinessUnit: { label: string; revenue: number; ebitda: number; margin: number }[];
  varianceBridge: { label: string; value: number; color: string }[];
  plRows: CompassFinancialPlRow[];
};

export type CompassReconciliationView = {
  gaps: EnrichedGap[];
  matrix: Record<string, number>;
  criticalCount: number;
  openCount: number;
  totalGapAmount: number;
  byType: { label: string; value: number; color: string }[];
  bySeverity: { label: string; value: number; color: string }[];
};

export type CompassMeetingsView = {
  upcoming: EnrichedMeeting[];
  past: EnrichedMeeting[];
  byType: { label: string; count: number }[];
};

export type CompassDecisionsView = {
  pending: EnrichedDecision[];
  approved: EnrichedDecision[];
  all: EnrichedDecision[];
};

export type CompassScenariosView = {
  scenarios: EnrichedScenario[];
  activeCount: number;
  totalRevenueImpact: number;
};

export type CompassDashboardGapSummary = {
  id: string;
  title: string;
  severity: GapSeverity;
  businessUnitName: string;
  value: string;
  ownerName: string;
};

export type CompassDashboardMeetingSummary = {
  id: string;
  date: string;
  time: string;
  title: string;
  phaseLabel: string;
};

export type CompassDashboardDecisionSummary = {
  id: string;
  title: string;
  meetingTitle: string;
  ownerName: string;
  dueDate: string;
  impact: string;
  status: IbDecisionStatus;
};

export type CompassDashboardView = {
  kpis: CompassKpi[];
  alerts: CompassAlert[];
  activeCycle: CompassCycleView;
  recentGaps: EnrichedGap[];
  upcomingMeetings: CompassDashboardMeetingSummary[];
  pendingDecisions: EnrichedDecision[];
  alignmentIndex: number;
  alignmentDelta: number;
  alignmentHistory: { label: string; value: number }[];
  demandSummary: { revenue: number; volume: number };
  supplySummary: { utilization: number; constrained: number };
  financialSummary: { revenue: number; ebitda: number; margin: number };
  currentPhaseLabel: string;
  cycleProgress: number;
  demandSupplyChart: { label: string; demand: number; supply: number }[];
  varianceBridge: { label: string; value: number; color: string }[];
  topGaps: CompassDashboardGapSummary[];
  recentDecisions: CompassDashboardDecisionSummary[];
};
