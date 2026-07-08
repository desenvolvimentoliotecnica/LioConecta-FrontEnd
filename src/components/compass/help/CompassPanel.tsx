import type { ReactNode } from "react";
import { CompassInfoButton } from "./CompassInfoButton";

type Props = {
  title: string;
  infoId?: string;
  desc?: string;
  children: ReactNode;
  className?: string;
};

export function CompassPanel({ title, infoId, desc, children, className }: Props) {
  return (
    <article className={`compass-panel${className ? ` ${className}` : ""}`}>
      <header className="compass-panel__header">
        <div>
          <h2 className="compass-panel__title">{title}</h2>
          {desc ? <p className="compass-panel__desc">{desc}</p> : null}
        </div>
        {infoId ? <CompassInfoButton infoId={infoId} /> : null}
      </header>
      {children}
    </article>
  );
}
