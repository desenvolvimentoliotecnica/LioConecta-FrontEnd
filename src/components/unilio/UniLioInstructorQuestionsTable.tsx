import { useMemo, useState } from "react";
import { formatUniLioDateTime } from "../../utils/unilioView";
import { UniLioQuestionStatusChip, UniLioQuestionVisibilityChip } from "./UniLioQuestionMetaChips";
import type { UniLioQuestionSummary } from "../../config/unilio/types";
import "../../styles/unilio-instrutor-page.css";

type SortKey = "createdAt" | "authorName" | "body" | "visibility" | "status";
type SortMode = SortKey | "priority";

type Sort = {
  key: SortMode;
  direction: "asc" | "desc";
};

type Props = {
  items: UniLioQuestionSummary[];
  selectedId: string | null;
  openCount: number;
  onSelect: (id: string) => void;
};

const COLUMNS: Array<{ key: SortKey; label: string; colClass: string; align: "left" | "center" }> = [
  { key: "createdAt", label: "Data/Hora", colClass: "col-q-date", align: "center" },
  { key: "authorName", label: "Aluno", colClass: "col-q-student", align: "center" },
  { key: "body", label: "Dúvida", colClass: "col-q-body", align: "left" },
  { key: "visibility", label: "Vis.", colClass: "col-q-visibility", align: "center" },
  { key: "status", label: "Status", colClass: "col-q-status", align: "center" },
];

function SortButton({
  label,
  active,
  direction,
  centered,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  centered: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`unilio-instrutor-table__sort${active ? " is-active" : ""}${centered ? " is-center" : ""}`}
      onClick={onClick}
    >
      <span>{label}</span>
      <i
        className={`fa-solid ${active ? (direction === "asc" ? "fa-arrow-up" : "fa-arrow-down") : "fa-sort"}`}
        aria-hidden="true"
      />
    </button>
  );
}

function compareByPriority(a: UniLioQuestionSummary, b: UniLioQuestionSummary): number {
  const aOpen = a.status === "open" ? 0 : 1;
  const bOpen = b.status === "open" ? 0 : 1;
  if (aOpen !== bOpen) return aOpen - bOpen;
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

function sortValue(item: UniLioQuestionSummary, key: SortKey): string | number {
  switch (key) {
    case "createdAt":
      return new Date(item.createdAt).getTime();
    case "authorName":
      return item.authorName.toLocaleLowerCase("pt-BR");
    case "body":
      return item.body.toLocaleLowerCase("pt-BR");
    case "visibility":
      return item.visibility;
    case "status":
      return item.status;
    default:
      return 0;
  }
}

export function UniLioInstructorQuestionsTable({
  items,
  selectedId,
  openCount,
  onSelect,
}: Props) {
  const [sort, setSort] = useState<Sort>({ key: "priority", direction: "asc" });

  const sortedItems = useMemo(() => {
    if (sort.key === "priority") {
      return [...items].sort(compareByPriority);
    }

    const sortKey = sort.key;
    const sorted = [...items].sort((a, b) => {
      const left = sortValue(a, sortKey);
      const right = sortValue(b, sortKey);
      if (typeof left === "string" && typeof right === "string") {
        return left.localeCompare(right, "pt-BR");
      }
      return Number(left) - Number(right);
    });
    return sort.direction === "asc" ? sorted : sorted.reverse();
  }, [items, sort]);

  function toggleSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: key === "createdAt" ? "desc" : "asc" },
    );
  }

  return (
    <section className="unilio-instrutor-courses unilio-inbox-table">
      <div className="unilio-instrutor-table-wrap unilio-instrutor-table-wrap--questions">
        <table className="unilio-instrutor-table unilio-instrutor-table--questions">
          <colgroup>
            {COLUMNS.map((column) => (
              <col key={column.key} className={column.colClass} />
            ))}
            <col className="col-q-actions" />
          </colgroup>
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={column.align === "left" ? "is-course" : "is-center"}
                  scope="col"
                >
                  <SortButton
                    label={column.label}
                    active={sort.key === column.key}
                    direction={sort.direction}
                    centered={column.align === "center"}
                    onClick={() => toggleSort(column.key)}
                  />
                </th>
              ))}
              <th scope="col" className="col-actions is-center">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="unilio-instrutor-table__empty">
                  Nenhuma dúvida encontrada com os filtros atuais.
                </td>
              </tr>
            ) : (
              sortedItems.map((item) => (
                <tr
                  key={item.id}
                  className={`unilio-instrutor-table__row-clickable${item.id === selectedId ? " is-selected" : ""}`}
                  onClick={() => onSelect(item.id)}
                >
                  <td className="is-center is-date" title={formatUniLioDateTime(item.createdAt)}>
                    {formatUniLioDateTime(item.createdAt)}
                  </td>
                  <td className="is-center unilio-instrutor-table__cell-student" title={item.authorName}>
                    {item.authorName}
                  </td>
                  <td className="unilio-instrutor-table__cell-course">
                    <span className="unilio-instrutor-table__course-title" title={item.body}>
                      {item.body}
                    </span>
                  </td>
                  <td className="is-center">
                    <UniLioQuestionVisibilityChip visibility={item.visibility} />
                  </td>
                  <td className="is-center">
                    <UniLioQuestionStatusChip status={item.status} unread={item.unread} />
                  </td>
                  <td className="unilio-instrutor-table__cell-actions is-center">
                    <button
                      type="button"
                      className="unilio-instrutor-table__icon-btn"
                      title="Abrir dúvida"
                      aria-label="Abrir dúvida"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(item.id);
                      }}
                    >
                      <i className="fa-solid fa-comment-dots" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="unilio-instrutor-courses__footer">
        Exibindo {sortedItems.length} de {items.length} dúvida{items.length === 1 ? "" : "s"}
        {openCount > 0 ? ` · ${openCount} aguardando resposta` : ""}
      </p>
    </section>
  );
}
