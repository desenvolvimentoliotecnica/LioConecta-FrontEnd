import { useCallback, useState, type DragEvent } from "react";
import type { PulseStoryStatus } from "../../config/pulse/types";
import type { EnrichedStory, PulseBoardView } from "../../config/pulse/types";
import { PulseStatusBadge } from "./PulseShared";
import "../../styles/pulse-board.css";

type PulseBoardProps = {
  view: PulseBoardView;
};

export function PulseBoard({ view: initialView }: PulseBoardProps) {
  const [columns, setColumns] = useState(initialView.columns);

  const onDragStart = useCallback((e: DragEvent, storyId: string, fromCol: PulseStoryStatus) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ storyId, fromCol }));
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const onDrop = useCallback((e: DragEvent, toCol: PulseStoryStatus) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("text/plain");
    if (!raw) return;
    const { storyId, fromCol } = JSON.parse(raw) as { storyId: string; fromCol: PulseStoryStatus };
    if (fromCol === toCol) return;

    setColumns((prev) => {
      const next = prev.map((col) => ({ ...col, stories: [...col.stories] }));
      const from = next.find((c) => c.id === fromCol);
      const to = next.find((c) => c.id === toCol);
      if (!from || !to) return prev;

      const idx = from.stories.findIndex((s) => s.id === storyId);
      if (idx < 0) return prev;

      const [story] = from.stories.splice(idx, 1);
      to.stories.push({ ...story, status: toCol });
      return next;
    });
  }, []);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div className="pulse-board" role="region" aria-label="Quadro Kanban">
      {columns.map((col) => (
        <section
          key={col.id}
          className="pulse-board__column"
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, col.id)}
        >
          <header className="pulse-board__column-head">
            <h3>{col.label}</h3>
            <span className="pulse-board__count">{col.stories.length}</span>
          </header>
          <ul className="pulse-board__cards">
            {col.stories.map((story) => (
              <PulseStoryCard key={story.id} story={story} columnId={col.id} onDragStart={onDragStart} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function PulseStoryCard({
  story,
  columnId,
  onDragStart,
}: {
  story: EnrichedStory;
  columnId: PulseStoryStatus;
  onDragStart: (e: DragEvent, storyId: string, fromCol: PulseStoryStatus) => void;
}) {
  return (
    <li>
      <article
        className="pulse-board__card"
        draggable
        onDragStart={(e) => onDragStart(e, story.id, columnId)}
      >
        <h4 className="pulse-board__card-title">{story.title}</h4>
        <p className="pulse-board__card-desc">{story.description}</p>
        <footer className="pulse-board__card-foot">
          <span className="pulse-board__points">{story.points} pts</span>
          <span className="pulse-board__assignee">{story.assigneeName}</span>
          <PulseStatusBadge status={story.priority} />
        </footer>
        {story.labels.length > 0 ? (
          <div className="pulse-board__labels">
            {story.labels.map((l) => (
              <span key={l} className="pulse-board__label">
                {l}
              </span>
            ))}
          </div>
        ) : null}
      </article>
    </li>
  );
}
