import { CYCLE_PHASE_LABELS, GAP_TYPE_LABELS, IB_MEETING_TYPE_LABELS, PHASE_CHECKLIST } from "./constants";
import { COMPASS_IBP_PHASES } from "./navigation";
import { COMPASS_MOCK_DATA } from "./mockData";
import type { CompassCycle, IbDecision, IbMeeting, IbScenario, ReconciliationGap } from "./types";

function personName(id: string): string {
  return COMPASS_MOCK_DATA.people.find((p) => p.id === id)?.name ?? "—";
}

function buName(id: string): string {
  return COMPASS_MOCK_DATA.businessUnits.find((b) => b.id === id)?.name ?? "—";
}

export function getActiveCycle(): CompassCycle {
  return COMPASS_MOCK_DATA.cycles.find((c) => c.status === "ativo") ?? COMPASS_MOCK_DATA.cycles[0];
}

export function buildGovernanceCycleView() {
  const cycle = getActiveCycle();
  const gaps = COMPASS_MOCK_DATA.gaps.filter((g) => g.cycleId === cycle.id);
  const decisions = COMPASS_MOCK_DATA.decisions.filter((d) => d.cycleId === cycle.id);
  const meetings = COMPASS_MOCK_DATA.meetings.filter((m) => m.cycleId === cycle.id);

  const phases = COMPASS_IBP_PHASES.map((phaseDef) => {
    const phaseProgress = cycle.phases.find((p) => p.phase === phaseDef.id);
    const checklistItems = PHASE_CHECKLIST[phaseDef.id] ?? [];
    const progress = phaseProgress?.progress ?? 0;
    const doneCount = Math.round((progress / 100) * checklistItems.length);

    return {
      id: phaseDef.id,
      label: phaseDef.label,
      icon: phaseDef.icon,
      startDate: phaseProgress?.startDate ?? cycle.startDate,
      endDate: phaseProgress?.endDate ?? cycle.endDate,
      status: phaseProgress?.status ?? "pendente",
      progress,
      checklist: checklistItems.map((label, index) => ({
        id: `${phaseDef.id}-${index}`,
        label,
        done: index < doneCount,
      })),
    };
  });

  return {
    cycleName: cycle.name,
    overallProgress: cycle.progress,
    currentPhase: cycle.currentPhase,
    currentPhaseLabel: CYCLE_PHASE_LABELS[cycle.currentPhase],
    sponsorName: personName(cycle.sponsorId),
    openGaps: gaps.filter((g) => g.status === "aberto" || g.status === "em_analise").length,
    pendingDecisions: decisions.filter((d) => d.status === "pendente").length,
    upcomingMeetings: meetings.filter((m) => m.status === "agendada").length,
    phases,
  };
}

export function buildGovernanceMeetingsView() {
  const cycle = getActiveCycle();
  const today = new Date().toISOString().slice(0, 10);
  const meetings = COMPASS_MOCK_DATA.meetings.filter((m) => m.cycleId === cycle.id);

  const enrich = (m: IbMeeting) => {
    const scheduled = new Date(m.scheduledAt);
    return {
      ...m,
      facilitatorName: personName(m.facilitatorId),
      typeLabel: IB_MEETING_TYPE_LABELS[m.type] ?? m.type,
      date: scheduled.toISOString().slice(0, 10),
      time: scheduled.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      phaseLabel: IB_MEETING_TYPE_LABELS[m.type] ?? m.type,
    };
  };

  const enriched = meetings.map(enrich);
  return {
    upcoming: enriched.filter((m) => m.status === "agendada" || m.scheduledAt.slice(0, 10) >= today),
    past: enriched.filter((m) => m.status === "concluida" || m.scheduledAt.slice(0, 10) < today),
  };
}

export function buildGovernanceDecisionsView() {
  const cycle = getActiveCycle();
  const decisions = COMPASS_MOCK_DATA.decisions.filter((d) => d.cycleId === cycle.id);

  const enrich = (d: IbDecision) => ({
    ...d,
    ownerName: personName(d.ownerId),
    meetingTitle: COMPASS_MOCK_DATA.meetings.find((m) => m.id === d.meetingId)?.title ?? "—",
    impact: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
      d.impactAmount,
    ),
  });

  const all = decisions.map(enrich);
  return {
    all,
    pending: all.filter((d) => d.status === "pendente"),
    approved: all.filter((d) => d.status === "aprovada"),
  };
}

export function buildGovernanceScenariosView() {
  const cycle = getActiveCycle();
  const scenarios = COMPASS_MOCK_DATA.scenarios.filter((s) => s.cycleId === cycle.id);

  const enrich = (s: IbScenario) => ({
    ...s,
    authorName: personName(s.authorId),
    businessUnitNames: s.businessUnitIds.map(buName),
  });

  const all = scenarios.map(enrich);
  return {
    scenarios: all,
    activeCount: all.filter((s) => s.status === "ativo" || s.status === "rascunho").length,
    totalRevenueImpact: all.reduce((sum, s) => sum + s.revenueDelta, 0),
  };
}

export function buildGovernanceGapsView() {
  const cycle = getActiveCycle();
  return COMPASS_MOCK_DATA.gaps
    .filter((g) => g.cycleId === cycle.id)
    .map((g: ReconciliationGap) => ({
      ...g,
      businessUnitName: buName(g.businessUnitId),
      ownerName: personName(g.ownerId),
      typeLabel: GAP_TYPE_LABELS[g.type],
      value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
        g.gapAmount,
      ),
    }));
}
