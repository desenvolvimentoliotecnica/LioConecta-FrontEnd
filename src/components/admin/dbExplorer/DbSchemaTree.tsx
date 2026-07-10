import { useEffect, useState } from "react";
import { useDbSchemas, useDbTables } from "../../../api/hooks/useDbExplorer";

type Props = {
  connectionId: string;
  selectedSchema?: string;
  selectedTable?: string;
  onSelectTable: (schema: string, table: string) => void;
  onBrowseTable: (schema: string, table: string) => void;
};

function SchemaTables({
  connectionId,
  schema,
  selectedTable,
  onSelectTable,
  onBrowseTable,
}: {
  connectionId: string;
  schema: string;
  selectedTable?: string;
  onSelectTable: (schema: string, table: string) => void;
  onBrowseTable: (schema: string, table: string) => void;
}) {
  const tablesQuery = useDbTables(connectionId, schema);

  if (tablesQuery.isLoading) return <p className="db-explorer-muted db-explorer-tree__loading">…</p>;
  if (tablesQuery.isError) return <p className="db-explorer-error db-explorer-tree__loading">Erro</p>;

  return (
    <ul className="db-explorer-tree__tables">
      {tablesQuery.data?.map((table) => {
        const active = selectedTable === table.name;
        return (
          <li key={`${table.schema}.${table.name}`}>
            <button
              type="button"
              className={`db-explorer-tree__row db-explorer-tree__row--table${active ? " is-active" : ""}`}
              title={`${table.schema}.${table.name}`}
              onClick={() => onSelectTable(table.schema, table.name)}
              onDoubleClick={() => onBrowseTable(table.schema, table.name)}
            >
              <i
                className={`fa-solid ${table.type === "VIEW" ? "fa-eye" : "fa-table"}`}
                aria-hidden="true"
              />
              <span>{table.name}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function DbSchemaTree({
  connectionId,
  selectedSchema,
  selectedTable,
  onSelectTable,
  onBrowseTable,
}: Props) {
  const schemasQuery = useDbSchemas(connectionId);
  const [openSchema, setOpenSchema] = useState<string | null>(selectedSchema ?? null);

  useEffect(() => {
    if (selectedSchema) setOpenSchema(selectedSchema);
  }, [selectedSchema]);

  if (schemasQuery.isLoading) return <p className="db-explorer-muted">Carregando schemas…</p>;
  if (schemasQuery.isError) return <p className="db-explorer-error">Falha ao listar schemas.</p>;

  return (
    <ul className="db-explorer-tree">
      {schemasQuery.data?.map((schema) => {
        const isOpen = openSchema === schema.name;
        return (
          <li key={schema.name} className="db-explorer-tree__schema">
            <button
              type="button"
              className={`db-explorer-tree__row${isOpen ? " is-open" : ""}`}
              onClick={() => setOpenSchema(isOpen ? null : schema.name)}
              title={schema.name}
            >
              <i className={`fa-solid ${isOpen ? "fa-folder-open" : "fa-folder"}`} aria-hidden="true" />
              <span>{schema.name}</span>
            </button>
            {isOpen ? (
              <SchemaTables
                connectionId={connectionId}
                schema={schema.name}
                selectedTable={selectedSchema === schema.name ? selectedTable : undefined}
                onSelectTable={onSelectTable}
                onBrowseTable={onBrowseTable}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
