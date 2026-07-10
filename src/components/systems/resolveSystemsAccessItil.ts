import type { HelpDeskItilCategoryDto } from "../../api/types";
import { SYSTEMS_ACCESS_PREFERRED_ROOT_NAMES } from "../../config/systems/accessRequest";
import {
  findCategoryById,
  getChildCategories,
  getRootCategories,
} from "../help-desk/helpDeskCategoryTree";

export type SystemsAccessItilResolution = {
  /** Opções exibidas no select de tipo de serviço */
  serviceOptions: HelpDeskItilCategoryDto[];
  /** true quando caiu no fallback de todas as raízes TI */
  usedRootFallback: boolean;
  /** Categoria preferida resolvida (config ou nome), se houver */
  preferredRoot: HelpDeskItilCategoryDto | null;
};

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function collectLeaves(
  categories: HelpDeskItilCategoryDto[],
  rootId: number,
): HelpDeskItilCategoryDto[] {
  const children = getChildCategories(categories, rootId);
  if (children.length === 0) {
    const self = findCategoryById(categories, rootId);
    return self ? [self] : [];
  }

  const leaves: HelpDeskItilCategoryDto[] = [];
  for (const child of children) {
    if (child.hasChildren || getChildCategories(categories, child.id).length > 0) {
      leaves.push(...collectLeaves(categories, child.id));
    } else {
      leaves.push(child);
    }
  }
  return leaves;
}

function findRootByPreferredNames(
  categories: HelpDeskItilCategoryDto[],
): HelpDeskItilCategoryDto | null {
  const roots = getRootCategories(categories);
  for (const preferred of SYSTEMS_ACCESS_PREFERRED_ROOT_NAMES) {
    const needle = normalizeName(preferred);
    const match = roots.find((item) => normalizeName(item.name) === needle);
    if (match) return match;
  }
  return null;
}

/**
 * Resolve opções de serviço ITIL para solicitação de acesso.
 * Ordem: categoryId configurado → nome preferido → todas as raízes TI.
 */
export function resolveSystemsAccessItilCategories(
  categories: HelpDeskItilCategoryDto[],
  preferredCategoryId: number | null = null,
): SystemsAccessItilResolution {
  if (categories.length === 0) {
    return { serviceOptions: [], usedRootFallback: false, preferredRoot: null };
  }

  if (preferredCategoryId != null) {
    const configured = findCategoryById(categories, preferredCategoryId);
    if (configured) {
      const leaves = collectLeaves(categories, configured.id);
      return {
        serviceOptions: leaves.length > 0 ? leaves : [configured],
        usedRootFallback: false,
        preferredRoot: configured,
      };
    }
  }

  const byName = findRootByPreferredNames(categories);
  if (byName) {
    const leaves = collectLeaves(categories, byName.id);
    return {
      serviceOptions: leaves.length > 0 ? leaves : [byName],
      usedRootFallback: false,
      preferredRoot: byName,
    };
  }

  return {
    serviceOptions: getRootCategories(categories),
    usedRootFallback: true,
    preferredRoot: null,
  };
}
