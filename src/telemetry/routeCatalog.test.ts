import { describe, expect, it } from "vitest";
import { resolveRouteMeta } from "./routeCatalog";

describe("routeCatalog observability", () => {
  it("maps observability hub route", () => {
    const meta = resolveRouteMeta("/admin/observabilidade");

    expect(meta.pageName).toBe("ObservabilityHub");
    expect(meta.routeTemplate).toBe("/admin/observabilidade");
    expect(meta.module).toBe("admin");
  });
});
