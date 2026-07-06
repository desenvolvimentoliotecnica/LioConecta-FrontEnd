import type { HelpDeskItilCategoryDto } from "../../api/types";

export function getRootCategories(categories: HelpDeskItilCategoryDto[]): HelpDeskItilCategoryDto[] {
  return categories
    .filter((item) => item.parentId == null || item.parentId === 0)
    .sort((a, b) => (a.fullName ?? a.name).localeCompare(b.fullName ?? b.name, "pt-BR"));
}

export function getChildCategories(
  categories: HelpDeskItilCategoryDto[],
  parentId: number,
): HelpDeskItilCategoryDto[] {
  return categories
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => (a.fullName ?? a.name).localeCompare(b.fullName ?? b.name, "pt-BR"));
}

export function findCategoryById(
  categories: HelpDeskItilCategoryDto[],
  categoryId: number,
): HelpDeskItilCategoryDto | undefined {
  return categories.find((item) => item.id === categoryId);
}

export function buildCategoryPath(
  categories: HelpDeskItilCategoryDto[],
  categoryId: number,
): HelpDeskItilCategoryDto[] {
  const path: HelpDeskItilCategoryDto[] = [];
  let current = findCategoryById(categories, categoryId);

  while (current) {
    path.unshift(current);
    if (current.parentId == null || current.parentId === 0) {
      break;
    }
    current = findCategoryById(categories, current.parentId);
  }

  return path;
}

export function formatCategoryPath(categories: HelpDeskItilCategoryDto[], categoryId: number): string {
  const category = findCategoryById(categories, categoryId);
  if (!category) return "";
  if (category.fullName?.trim()) return category.fullName;
  return buildCategoryPath(categories, categoryId)
    .map((item) => item.name)
    .join(" > ");
}
