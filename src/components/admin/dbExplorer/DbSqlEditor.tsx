import { lazy, useCallback, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
};

export function DbSqlEditor({ value, onChange, onRun }: Props) {
  const extensions = useMemo(() => [sql()], []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && onRun) {
        event.preventDefault();
        onRun();
      }
    },
    [onRun],
  );

  return (
    <div className="db-explorer-editor" onKeyDown={handleKeyDown}>
      <CodeMirror
        value={value}
        height="140px"
        extensions={extensions}
        onChange={onChange}
        basicSetup={{ lineNumbers: true, foldGutter: false }}
      />
    </div>
  );
}

export const LazyDbSqlEditor = lazy(async () => ({ default: DbSqlEditor }));

export function DbSqlEditorFallback() {
  return <div className="db-explorer-editor db-explorer-editor--loading">Carregando editor…</div>;
}
