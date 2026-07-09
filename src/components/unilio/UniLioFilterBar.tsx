import { useUniLioMeta } from "../../api/hooks/useUniLioMeta";
import { CONTENT_TYPE_LABELS, UNILIO_PERIODS } from "../../config/unilio/constants";
import type { UniLioContentType } from "../../config/unilio/types";
import { useUniLioFilters } from "./UniLioAccessGate";

function contentTypeLabel(type: string): string {
  return CONTENT_TYPE_LABELS[type as UniLioContentType] ?? type;
}

type Props = {
  className?: string;
};

export function UniLioFilterBar({ className }: Props) {
  const { filters, setArea, setDepartment, setContentType, setSearch, setPeriod, resetFilters } =
    useUniLioFilters();
  const { data: meta } = useUniLioMeta();

  return (
    <div className={["unilio-shell__toolbar", "unilio-filter-bar", className].filter(Boolean).join(" ")}>
      <div className="unilio-shell__search">
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
        <input
          type="search"
          placeholder="Buscar curso, trilha, competência…"
          value={filters.search ?? ""}
          onChange={(e) => setSearch(e.target.value || undefined)}
          aria-label="Busca no UniLio"
        />
      </div>

      <div className="unilio-shell__filters">
        <select
          className="unilio-shell__select"
          value={filters.area ?? ""}
          onChange={(e) => setArea(e.target.value || undefined)}
          aria-label="Filtrar por área"
        >
          <option value="">Todas as áreas</option>
          {meta.areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <select
          className="unilio-shell__select"
          value={filters.department ?? ""}
          onChange={(e) => setDepartment(e.target.value || undefined)}
          aria-label="Filtrar por departamento"
        >
          <option value="">Todos os departamentos</option>
          {meta.departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          className="unilio-shell__select"
          value={filters.contentType ?? ""}
          onChange={(e) => setContentType(e.target.value || undefined)}
          aria-label="Filtrar por tipo de conteúdo"
        >
          <option value="">Todos os tipos</option>
          {meta.contentTypes.map((t) => (
            <option key={t} value={t}>
              {contentTypeLabel(t)}
            </option>
          ))}
        </select>

        <select
          className="unilio-shell__select"
          value={filters.period ?? ""}
          onChange={(e) => setPeriod(e.target.value || undefined)}
          aria-label="Filtrar por período"
        >
          <option value="">Todo o período</option>
          {UNILIO_PERIODS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>

        <button type="button" className="unilio-shell__reset" onClick={resetFilters}>
          Limpar filtros
        </button>
      </div>
    </div>
  );
}
