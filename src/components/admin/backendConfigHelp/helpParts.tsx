import type { ReactNode } from "react";

export type BackendConfigHelpContext = {
  portalOrigin: string;
  devOrigin: string;
};

export function HelpLead({ children }: { children: ReactNode }) {
  return <p className="backend-config-page__help-lead">{children}</p>;
}

export function HelpHeading({ children }: { children: ReactNode }) {
  return <h3 className="backend-config-page__help-heading">{children}</h3>;
}

export function HelpList({
  ordered,
  children,
}: {
  ordered?: boolean;
  children: ReactNode;
}) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      className={`backend-config-page__help-list${ordered ? " backend-config-page__help-list--ordered" : ""}`}
    >
      {children}
    </Tag>
  );
}

export function HelpNote({ warn, children }: { warn?: boolean; children: ReactNode }) {
  return (
    <p
      className={`backend-config-page__help-note${warn ? " backend-config-page__help-note--warn" : ""}`}
    >
      {children}
    </p>
  );
}

export function HelpTable({
  headers,
  rows,
}: {
  headers: [string, string];
  rows: Array<[ReactNode, ReactNode]>;
}) {
  return (
    <div className="backend-config-page__help-table-wrap">
      <table className="backend-config-page__help-table">
        <thead>
          <tr>
            <th>{headers[0]}</th>
            <th>{headers[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([left, right], index) => (
            <tr key={index}>
              <td>{left}</td>
              <td>{right}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
