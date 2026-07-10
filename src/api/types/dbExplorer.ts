export type DbConnectionDto = {
  id: string;
  label: string;
  engine: string;
  available: boolean;
  statusMessage?: string | null;
};

export type DbSchemaDto = { name: string };

export type DbTableDto = { schema: string; name: string; type: string };

export type DbColumnDto = {
  name: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  foreignKeyTable?: string | null;
  foreignKeyColumn?: string | null;
};

export type DbRowsPageDto = {
  columns: string[];
  rows: unknown[][];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type ExecuteQueryRequest = { sql: string; page?: number; pageSize?: number };

export type ExecuteQueryResponse = {
  columns: string[];
  rows: unknown[][];
  totalCount: number;
  page: number;
  pageSize: number;
  durationMs: number;
};

export type DbQueryHistoryEntryDto = {
  id: string;
  connectionId: string;
  sqlText: string;
  rowCount: number;
  durationMs: number;
  success: boolean;
  errorMessage?: string | null;
  executedAt: string;
};

export type PagedDbQueryHistoryDto = {
  items: DbQueryHistoryEntryDto[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type DbSavedQueryDto = {
  id: string;
  name: string;
  connectionId: string;
  sqlText: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpsertSavedQueryRequest = {
  name: string;
  connectionId: string;
  sql: string;
  description?: string | null;
};

export type DbSchemaGraphColumnDto = {
  name: string;
  dataType: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNullable: boolean;
};

export type DbSchemaGraphNodeDto = {
  id: string;
  schema: string;
  name: string;
  type: string;
  columns: DbSchemaGraphColumnDto[];
};

export type DbSchemaGraphEdgeDto = {
  id: string;
  sourceNodeId: string;
  sourceColumn: string;
  targetNodeId: string;
  targetColumn: string;
};

export type DbSchemaGraphDto = {
  nodes: DbSchemaGraphNodeDto[];
  edges: DbSchemaGraphEdgeDto[];
};

export type DbDerLayoutDto = {
  id?: string | null;
  connectionId: string;
  layoutJson: string;
  updatedAt?: string | null;
};

export type DerLayoutState = {
  viewport: { x: number; y: number; zoom: number };
  nodes: Record<string, { x: number; y: number; collapsed?: boolean }>;
  hiddenSchemas?: string[];
  selectedSchemas?: string[];
};
