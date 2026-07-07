export type PulseStoryStatus = "backlog" | "todo" | "in_progress" | "done";

export type PulseSprintPhase = "planning" | "active" | "review" | "retro" | "closed";

export type PulseMood = 1 | 2 | 3 | 4 | 5;

export type PulseRetroCategory = "start" | "stop" | "continue" | "action";

export type PulseMeetingType = "daily" | "planning" | "review" | "retro" | "refinement";

export type PulseSeverity = "critico" | "alto" | "medio" | "baixo";

export type PulseImpedimentStatus = "aberto" | "em_andamento" | "resolvido";

export type PulsePersona = "manager" | "member" | "observer";

export type PulsePerson = {
  id: string;
  name: string;
  role: string;
  area: string;
};

export type PulseTeam = {
  id: string;
  name: string;
  description: string;
  managerId: string;
  memberIds: string[];
};

export type PulseSprint = {
  id: string;
  teamId: string;
  name: string;
  goal: string;
  phase: PulseSprintPhase;
  startDate: string;
  endDate: string;
  committedPoints: number;
  completedPoints: number;
  velocity: number;
};

export type PulseStory = {
  id: string;
  teamId: string;
  sprintId?: string;
  title: string;
  description: string;
  status: PulseStoryStatus;
  points: number;
  assigneeId?: string;
  priority: "alta" | "media" | "baixa";
  labels: string[];
  createdAt: string;
};

export type PulseDailyEntry = {
  id: string;
  sprintId: string;
  date: string;
  memberId: string;
  yesterday: string;
  today: string;
  blockers: string;
  mood: PulseMood;
};

export type PulseImpediment = {
  id: string;
  teamId: string;
  sprintId?: string;
  title: string;
  description: string;
  severity: PulseSeverity;
  status: PulseImpedimentStatus;
  ownerId: string;
  reportedById: string;
  reportedAt: string;
  resolvedAt?: string;
};

export type PulseMeeting = {
  id: string;
  teamId: string;
  sprintId?: string;
  type: PulseMeetingType;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  facilitatorId: string;
  attendeeIds: string[];
  notes?: string;
};

export type PulseAgendaItem = {
  id: string;
  meetingId: string;
  title: string;
  durationMinutes: number;
  ownerId: string;
  decision?: string;
  sequence: number;
};

export type PulseRetroNote = {
  id: string;
  sprintId: string;
  teamId: string;
  category: PulseRetroCategory;
  content: string;
  authorId: string;
  votes: number;
  createdAt: string;
};

export type PulseAction = {
  id: string;
  sprintId: string;
  teamId: string;
  title: string;
  assigneeId: string;
  dueDate: string;
  status: "pendente" | "em_andamento" | "concluida";
  retroNoteId?: string;
};

export type PulseBurndownPoint = {
  date: string;
  ideal: number;
  actual: number;
};

export type PulseAlert = {
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

export type PulseKpi = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  icon: string;
  mod: string;
  href?: string;
};

export type PulseFilters = {
  teamId?: string;
  sprintId?: string;
  status?: string;
  search?: string;
};

export type PulseDataset = {
  people: PulsePerson[];
  teams: PulseTeam[];
  sprints: PulseSprint[];
  stories: PulseStory[];
  dailyEntries: PulseDailyEntry[];
  impediments: PulseImpediment[];
  meetings: PulseMeeting[];
  agendaItems: PulseAgendaItem[];
  retroNotes: PulseRetroNote[];
  actions: PulseAction[];
  burndown: Record<string, PulseBurndownPoint[]>;
};

export type EnrichedStory = PulseStory & {
  assigneeName: string;
  teamName: string;
};

export type EnrichedDailyEntry = PulseDailyEntry & {
  memberName: string;
  moodLabel: string;
};

export type EnrichedImpediment = PulseImpediment & {
  ownerName: string;
  reporterName: string;
  teamName: string;
};

export type EnrichedMeeting = PulseMeeting & {
  facilitatorName: string;
  teamName: string;
  agenda: (PulseAgendaItem & { ownerName: string })[];
};

export type EnrichedRetroNote = PulseRetroNote & {
  authorName: string;
};

export type EnrichedAction = PulseAction & {
  assigneeName: string;
};

export type PulseSprintView = PulseSprint & {
  teamName: string;
  stories: EnrichedStory[];
  burndown: PulseBurndownPoint[];
  completionPercent: number;
};

export type PulseDashboardView = {
  kpis: PulseKpi[];
  alerts: PulseAlert[];
  activeSprints: PulseSprintView[];
  recentDailys: EnrichedDailyEntry[];
  openImpediments: EnrichedImpediment[];
  upcomingMeetings: EnrichedMeeting[];
  pendingActions: EnrichedAction[];
};

export type PulseBoardView = {
  columns: { id: PulseStoryStatus; label: string; stories: EnrichedStory[] }[];
};

export type PulsePersonaContext = {
  persona: PulsePersona;
  personId: string;
  visibleTeamIds: string[];
  label: string;
};
