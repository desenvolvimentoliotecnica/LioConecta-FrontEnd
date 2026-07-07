import { useMemo } from "react";
import type { RoadmapRow } from "../../utils/loopView";

function dateToMs(dateStr: string): number {
  return new Date(dateStr).getTime();
}

function daysBetween(a: string, b: string): number {
  return Math.max(1, Math.round((dateToMs(b) - dateToMs(a)) / 86400000));
}

export function LoopRoadmap({ rows }: { rows: RoadmapRow[] }) {
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (rows.length === 0) {
      const now = new Date().toISOString().slice(0, 10);
      return { minDate: now, maxDate: now, totalDays: 1 };
    }
    let min = dateToMs(rows[0].startDate);
    let max = dateToMs(rows[0].endDate);
    for (const row of rows) {
      min = Math.min(min, dateToMs(row.startDate));
      max = Math.max(max, dateToMs(row.endDate));
      for (const ph of row.phases) {
        min = Math.min(min, dateToMs(ph.startDate));
        max = Math.max(max, dateToMs(ph.endDate));
      }
    }
    const minStr = new Date(min).toISOString().slice(0, 10);
    const maxStr = new Date(max).toISOString().slice(0, 10);
    return { minDate: minStr, maxDate: maxStr, totalDays: daysBetween(minStr, maxStr) };
  }, [rows]);

  const todayOffset = useMemo(() => {
    const offset = daysBetween(minDate, new Date().toISOString().slice(0, 10));
    return Math.max(0, Math.min(100, (offset / totalDays) * 100));
  }, [minDate, totalDays]);

  function offsetLeft(start: string): number {
    return (daysBetween(minDate, start) / totalDays) * 100;
  }

  function widthPct(start: string, end: string): number {
    return (daysBetween(start, end) / totalDays) * 100;
  }

  return (
    <div className="loop-roadmap">
      <div className="loop-roadmap__header">
        <span>Projeto</span>
        <span>Cronograma</span>
      </div>

      <div className="loop-roadmap__timeline-wrap">
        <div className="loop-roadmap__today" style={{ left: `${todayOffset}%` }} aria-hidden="true" />
        {rows.map((row) => (
          <div key={row.projectId} className="loop-roadmap__row">
            <div className="loop-roadmap__project">
              <strong>{row.projectName}</strong>
              <span>{row.teamName}</span>
            </div>
            <div className="loop-roadmap__track">
              {row.phases.map((ph) => (
                <div
                  key={ph.id}
                  className="loop-roadmap__phase"
                  style={{
                    left: `${offsetLeft(ph.startDate)}%`,
                    width: `${widthPct(ph.startDate, ph.endDate)}%`,
                    background: ph.color,
                  }}
                  title={`${ph.name} (${ph.progress}%)`}
                >
                  <span className="loop-roadmap__phase-label">{ph.name}</span>
                </div>
              ))}
              {row.milestones.map((ms) => (
                <div
                  key={ms.id}
                  className={`loop-roadmap__milestone loop-roadmap__milestone--${ms.status}`}
                  style={{ left: `${offsetLeft(ms.date)}%` }}
                  title={ms.name}
                >
                  <i className="fa-solid fa-diamond" aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="loop-roadmap__dates">
        <span>{new Intl.DateTimeFormat("pt-BR").format(new Date(minDate))}</span>
        <span className="loop-roadmap__today-label">
          <i className="fa-solid fa-circle" aria-hidden="true" /> Hoje
        </span>
        <span>{new Intl.DateTimeFormat("pt-BR").format(new Date(maxDate))}</span>
      </div>
    </div>
  );
}
