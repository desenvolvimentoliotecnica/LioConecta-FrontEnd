import { describe, expect, it } from "vitest";
import type { HelpDeskItilCategoryDto } from "../../api/types";
import { resolveSystemsAccessItilCategories } from "./resolveSystemsAccessItil";

const CATEGORIES: HelpDeskItilCategoryDto[] = [
  {
    id: 9,
    name: "Identidade e Acessos",
    fullName: "Identidade e Acessos",
    parentId: null,
    hasChildren: true,
    entityId: 1,
  },
  {
    id: 509,
    name: "Acesso a sistemas",
    fullName: "Identidade e Acessos > Acesso a sistemas",
    parentId: 9,
    hasChildren: false,
    entityId: 1,
  },
  {
    id: 17,
    name: "Sistemas Corporativos",
    fullName: "Sistemas Corporativos",
    parentId: null,
    hasChildren: true,
    entityId: 1,
  },
  {
    id: 517,
    name: "Solicitação",
    fullName: "Sistemas Corporativos > Solicitação",
    parentId: 17,
    hasChildren: false,
    entityId: 1,
  },
];

describe("resolveSystemsAccessItilCategories", () => {
  it("prioriza categoryId configurado", () => {
    const result = resolveSystemsAccessItilCategories(CATEGORIES, 17);
    expect(result.preferredRoot?.id).toBe(17);
    expect(result.serviceOptions.map((item) => item.id)).toEqual([517]);
    expect(result.usedRootFallback).toBe(false);
  });

  it("usa Identidade e Acessos por nome quando não há config", () => {
    const result = resolveSystemsAccessItilCategories(CATEGORIES, null);
    expect(result.preferredRoot?.id).toBe(9);
    expect(result.serviceOptions.map((item) => item.id)).toEqual([509]);
    expect(result.usedRootFallback).toBe(false);
  });

  it("cai no fallback de raízes quando não encontra preferidos", () => {
    const other: HelpDeskItilCategoryDto[] = [
      {
        id: 1,
        name: "Incidentes",
        fullName: "Incidentes",
        parentId: null,
        hasChildren: false,
        entityId: 1,
      },
    ];
    const result = resolveSystemsAccessItilCategories(other, null);
    expect(result.usedRootFallback).toBe(true);
    expect(result.serviceOptions).toHaveLength(1);
  });
});
