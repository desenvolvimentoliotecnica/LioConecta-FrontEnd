import type { PageEntry } from "../types/pages";
import pages from "../generated/pages.json";

export const pageRegistry = pages as PageEntry[];

export function getPageByRoute(pathname: string): PageEntry | undefined {
  if (pathname === "/pessoas/perfil" || pathname.startsWith("/pessoas/perfil")) {
    return pageRegistry.find((p) => p.id === "pessoas-perfil");
  }
  return pageRegistry.find((p) => p.route === pathname);
}

export function getPageById(id: string): PageEntry | undefined {
  return pageRegistry.find((p) => p.id === id);
}
