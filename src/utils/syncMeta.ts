export function formatSyncedAt(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `Atualizado em ${date.toLocaleString("pt-BR")}`;
}

export function formatDataSourceLabel(dataSource?: string | null): string | null {
  if (!dataSource) {
    return null;
  }

  switch (dataSource) {
    case "live":
      return "TOTVS RM";
    case "cache":
      return "cache local";
    case "rm_disabled":
      return "RM desabilitado";
    case "rm_unavailable":
      return "RM indisponível";
    default:
      return dataSource;
  }
}

export function buildSyncMetaLabel(
  syncedAt?: string | null,
  dataSource?: string | null,
): string | null {
  const syncedLabel = formatSyncedAt(syncedAt);
  const sourceLabel = formatDataSourceLabel(dataSource);

  if (!syncedLabel && !sourceLabel) {
    return null;
  }

  if (syncedLabel && sourceLabel) {
    return `${syncedLabel} · origem ${sourceLabel}`;
  }

  return syncedLabel ?? `Origem ${sourceLabel}`;
}
