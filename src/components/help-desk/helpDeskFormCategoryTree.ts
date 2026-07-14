import type { HelpDeskFormCategoryDto, HelpDeskFormSummaryDto } from "../../api/types";

export function getRootFormCategories(
  categories: HelpDeskFormCategoryDto[],
): HelpDeskFormCategoryDto[] {
  return categories
    .filter((item) => item.parentId == null || item.parentId === 0)
    .filter((item) => hasFormsInSubtree(categories, item.id))
    .sort((a, b) =>
      (a.completeName ?? a.name).localeCompare(b.completeName ?? b.name, "pt-BR"),
    );
}

export function getChildFormCategories(
  categories: HelpDeskFormCategoryDto[],
  parentId: number,
): HelpDeskFormCategoryDto[] {
  return categories
    .filter((item) => item.parentId === parentId)
    .filter((item) => hasFormsInSubtree(categories, item.id))
    .sort((a, b) =>
      (a.completeName ?? a.name).localeCompare(b.completeName ?? b.name, "pt-BR"),
    );
}

export function findFormCategoryById(
  categories: HelpDeskFormCategoryDto[],
  categoryId: number,
): HelpDeskFormCategoryDto | undefined {
  return categories.find((item) => item.id === categoryId);
}

export function buildFormCategoryPath(
  categories: HelpDeskFormCategoryDto[],
  categoryId: number,
): HelpDeskFormCategoryDto[] {
  const path: HelpDeskFormCategoryDto[] = [];
  let current = findFormCategoryById(categories, categoryId);

  while (current) {
    path.unshift(current);
    if (current.parentId == null || current.parentId === 0) {
      break;
    }
    current = findFormCategoryById(categories, current.parentId);
  }

  return path;
}

export function formatFormCategoryPath(
  categories: HelpDeskFormCategoryDto[],
  categoryId: number,
): string {
  const category = findFormCategoryById(categories, categoryId);
  if (!category) return "";
  if (category.completeName?.trim()) return category.completeName;
  return buildFormCategoryPath(categories, categoryId)
    .map((item) => item.name)
    .join(" > ");
}

export function hasChildFormCategories(
  categories: HelpDeskFormCategoryDto[],
  categoryId: number,
): boolean {
  return getChildFormCategories(categories, categoryId).length > 0;
}

export function hasFormsInSubtree(
  categories: HelpDeskFormCategoryDto[],
  categoryId: number,
): boolean {
  const self = findFormCategoryById(categories, categoryId);
  if ((self?.formCount ?? 0) > 0) return true;
  return categories
    .filter((item) => item.parentId === categoryId)
    .some((child) => hasFormsInSubtree(categories, child.id));
}

export function formsInCategory(
  forms: HelpDeskFormSummaryDto[],
  categoryId: number,
): HelpDeskFormSummaryDto[] {
  return forms
    .filter((item) => item.categoryId === categoryId)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}
