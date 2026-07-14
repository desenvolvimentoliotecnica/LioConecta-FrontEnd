/** Maps GLPI / portal priority labels to chip CSS modifiers. */
export function helpDeskPriorityModifier(label: string): string {
  const normalized = label.trim().toLowerCase();
  if (normalized.includes("muito alta") || normalized.includes("crítica") || normalized.includes("critica")) {
    return "critical";
  }
  if (normalized.includes("alta") || normalized.includes("high") || normalized.includes("urgent")) {
    return "high";
  }
  if (normalized.includes("média") || normalized.includes("media") || normalized.includes("medium")) {
    return "medium";
  }
  if (normalized.includes("muito baixa")) return "lowest";
  if (normalized.includes("baixa") || normalized.includes("low")) return "low";
  return "unknown";
}
