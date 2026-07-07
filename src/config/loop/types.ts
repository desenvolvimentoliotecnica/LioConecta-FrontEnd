export type LoopPeriod = "7d" | "30d" | "90d" | "quarter";

export type ProjectStatus =
  | "planejamento"
  | "em_andamento"
  | "execucao"
  | "revisao"
  | "atencao"
  | "bloqueado"
  | "concluido"
  | "cancelado"
  | "arquivado";

export type HealthStatus = "no_prazo" | "atencao" | "critico";

export type ActivityStatus =
  | "planejada"
  | "pendente"
  | "em_andamento"
  | "bloqueada"
  | "em_revisao"
  | "concluida"
  | "cancelada";

export type RiskSeverity = "critico" | "alto" | "medio" | "baixo";

export type ApprovalStatus = "pendente" | "aprovado" | "rejeitado" | "devolvido" | "cancelado";

export type LoopPerson = {
  id: string;
  name: string;
  role: string;
  area: string;
};

export type LoopTeam = {
  id: string;
  name: string;
  description: string;
  managerId: string;
  capacityHours: number;
  availableHours: number;
  allocatedHours: number;
  memberCount: number;
  projectCount: number;
  openActivities: number;
};

export type LoopProject = {
  id: string;
  code: string;
  name: string;
  description: string;
  objective: string;
  status: ProjectStatus;
  health: HealthStatus;
  priority: "alta" | "media" | "baixa";
  criticality: "alta" | "media" | "baixa";
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  progress: number;
  ownerId: string;
  teamId: string;
  sponsorId: string;
  isActive: boolean;
};

export type LoopPhase = {
  id: string;
  projectId: string;
  name: string;
  type: "planejamento" | "execucao" | "revisao" | "entrega";
  startDate: string;
  endDate: string;
  progress: number;
  status: string;
  color: string;
  sequence: number;
};

export type LoopMilestone = {
  id: string;
  projectId: string;
  phaseId?: string;
  name: string;
  description: string;
  plannedDate: string;
  actualDate?: string;
  status: "pendente" | "concluido" | "atrasado";
  criticality: "alta" | "media" | "baixa";
};

export type LoopActivity = {
  id: string;
  projectId: string;
  phaseId?: string;
  title: string;
  description: string;
  assigneeId: string;
  teamId: string;
  status: ActivityStatus;
  priority: "alta" | "media" | "baixa";
  criticality: "alta" | "media" | "baixa";
  startDate: string;
  dueDate: string;
  completedAt?: string;
  progress: number;
  estimatedHours: number;
  actualHours: number;
  blocker?: string;
};

export type LoopRisk = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: string;
  probability: number;
  impact: number;
  severity: RiskSeverity;
  status: "aberto" | "mitigado" | "fechado";
  ownerId: string;
  mitigationPlan: string;
  dueDate: string;
};

export type LoopApproval = {
  id: string;
  projectId: string;
  type: string;
  title: string;
  description: string;
  requesterId: string;
  approverId: string;
  priority: "alta" | "media" | "baixa";
  status: ApprovalStatus;
  requestedAt: string;
  dueDate: string;
  decidedAt?: string;
  decisionReason?: string;
};

export type LoopDeliverable = {
  id: string;
  projectId: string;
  milestoneId?: string;
  name: string;
  description: string;
  plannedDate: string;
  actualDate?: string;
  status: "pendente" | "entregue" | "atrasado";
  responsibleId: string;
};

export type LoopLesson = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: string;
  impact: string;
  recommendation: string;
  createdBy: string;
  createdAt: string;
};

export type LoopAlert = {
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

export type LoopKpiHistory = {
  referenceDate: string;
  value: number;
};

export type LoopDataset = {
  people: LoopPerson[];
  teams: LoopTeam[];
  projects: LoopProject[];
  phases: LoopPhase[];
  milestones: LoopMilestone[];
  activities: LoopActivity[];
  risks: LoopRisk[];
  approvals: LoopApproval[];
  deliverables: LoopDeliverable[];
  lessons: LoopLesson[];
  performanceHistory: LoopKpiHistory[];
};

export type LoopFilters = {
  period: LoopPeriod;
  teamId?: string;
  projectId?: string;
  status?: string;
  priority?: string;
  search?: string;
};

export type LoopKpi = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  icon: string;
  mod: string;
  href?: string;
};
