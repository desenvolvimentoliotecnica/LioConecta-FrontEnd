import type { HelpDeskGlpiEntityDto } from "../../api/types";

export function getRootEntities(entities: HelpDeskGlpiEntityDto[]): HelpDeskGlpiEntityDto[] {
  return entities
    .filter((item) => item.parentId == null || item.parentId === 0)
    .sort((a, b) => (a.fullName ?? a.name).localeCompare(b.fullName ?? b.name, "pt-BR"));
}

export function getChildEntities(
  entities: HelpDeskGlpiEntityDto[],
  parentId: number,
): HelpDeskGlpiEntityDto[] {
  return entities
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => (a.fullName ?? a.name).localeCompare(b.fullName ?? b.name, "pt-BR"));
}

export function findEntityById(
  entities: HelpDeskGlpiEntityDto[],
  entityId: number,
): HelpDeskGlpiEntityDto | undefined {
  return entities.find((item) => item.id === entityId);
}

export function buildEntityPath(
  entities: HelpDeskGlpiEntityDto[],
  entityId: number,
): HelpDeskGlpiEntityDto[] {
  const path: HelpDeskGlpiEntityDto[] = [];
  let current = findEntityById(entities, entityId);

  while (current) {
    path.unshift(current);
    if (current.parentId == null || current.parentId === 0) {
      break;
    }
    current = findEntityById(entities, current.parentId);
  }

  return path;
}

export function formatEntityPath(entities: HelpDeskGlpiEntityDto[], entityId: number): string {
  const entity = findEntityById(entities, entityId);
  if (!entity) return "";
  if (entity.fullName?.trim()) return entity.fullName;
  return buildEntityPath(entities, entityId)
    .map((item) => item.name)
    .join(" > ");
}
