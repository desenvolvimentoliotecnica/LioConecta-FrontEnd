export function readApiNumber(record: Record<string, unknown>, key: string): number {
  const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
  const value = record[key] ?? record[pascalKey];
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function readApiOptionalString(record: Record<string, unknown>, key: string): string | undefined {
  const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
  const value = record[key] ?? record[pascalKey];
  return value ? String(value) : undefined;
}
