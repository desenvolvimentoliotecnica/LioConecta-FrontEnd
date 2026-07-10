import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { installLegacyApiBridge } from "../api/legacyBridge";
import type { PageEntry } from "../types/pages";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(el);
  });
}

function runInlineScript(code: string) {
  const fn = new Function(code);
  fn();
}

function waitForProfileDom(): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    function check() {
      if (document.getElementById("profile-root")) {
        resolve();
        return;
      }
      if (performance.now() - started > 5000) {
        reject(new Error("profile-root not found"));
        return;
      }
      requestAnimationFrame(check);
    }
    requestAnimationFrame(check);
  });
}

async function bootProfilePage(): Promise<void> {
  installLegacyApiBridge();
  await loadScript("/assets/person-avatar.js");
  await loadScript("/assets/avatar-picker.js");
  await loadScript("/assets/pessoas-perfil.js");
  await waitForProfileDom();
  const initResult = window.ProfilePage?.init();
  if (initResult && typeof (initResult as Promise<void>).then === "function") {
    await initResult;
  }
}

function useProfilePageScript(page: PageEntry | undefined, contentKey: string) {
  useLayoutEffect(() => {
    if (!page?.profileAssets) return;

    let cancelled = false;

    void bootProfilePage().catch(() => {
      if (cancelled) return;
      const errorEl = document.getElementById("profile-error");
      const loadingEl = document.getElementById("profile-loading");
      const rootEl = document.getElementById("profile-root");
      if (loadingEl) loadingEl.hidden = true;
      if (errorEl) errorEl.hidden = false;
      if (rootEl) rootEl.hidden = true;
    });

    return () => {
      cancelled = true;
      if (window.ProfilePage && "bumpLoadGeneration" in window.ProfilePage) {
        (window.ProfilePage as { bumpLoadGeneration?: () => void }).bumpLoadGeneration?.();
      }
    };
  }, [page, contentKey]);
}

export function usePageScript(page: PageEntry | undefined, contentKey: string) {
  const ranRef = useRef<string | null>(null);

  useProfilePageScript(page, contentKey);

  useEffect(() => {
    if (!page) return;
    if (page.profileAssets) return;

    const key = `${page.id}:${contentKey}`;
    if (ranRef.current === key) return;

    let cancelled = false;

    async function boot() {
      installLegacyApiBridge();

      if (page!.organograma || page!.profileModal) {
        await loadScript("/assets/person-avatar.js");
        if (cancelled) return;
        await loadScript("/assets/org-profile-modal.js");
        if (cancelled) return;
      }

      if (page!.organograma) {
        await loadScript("https://cdn.balkan.app/orgchart-community.js");
        if (cancelled) return;
      }

      for (const ext of page!.externals) {
        const src = ext.startsWith("http") ? ext : `/${ext.replace(/^\//, "")}`;
        await loadScript(src);
        if (cancelled) return;
      }

      if (page!.hasScript) {
        try {
          const mod = await import(`../generated/pages/${page!.id}/script.js?raw`);
          if (cancelled) return;
          runInlineScript(mod.default);
        } catch {
          // no script file
        }
      }

      ranRef.current = key;
    }

    void boot();

    return () => {
      cancelled = true;
      if (ranRef.current === key) {
        ranRef.current = null;
      }
    };
  }, [page, contentKey]);
}

export function useQuickAccessScroll(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const track = containerRef.current?.querySelector("#quick-access-track");
    if (!track) return;

    const buttons = containerRef.current?.querySelectorAll("[data-quick-nav]");
    if (!buttons?.length) return;

    const handlers: Array<{ el: Element; fn: () => void }> = [];

    buttons.forEach((btn) => {
      const fn = () => {
        const dir = Number((btn as HTMLElement).dataset.quickNav || 0);
        track.scrollBy({ left: dir * 220, behavior: "smooth" });
      };
      btn.addEventListener("click", fn);
      handlers.push({ el: btn, fn });
    });

    return () => {
      handlers.forEach(({ el, fn }) => el.removeEventListener("click", fn));
    };
  }, [containerRef]);
}

export function useFeedHashScroll(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  hash: string,
) {
  useEffect(() => {
    if (!enabled) return;

    const scrollToHash = () => {
      const id = hash.replace(/^#/, "");
      if (!id) return;
      const root = containerRef.current;
      if (!root) return;
      const target = root.querySelector(`#${CSS.escape(id)}`);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const timer = window.setTimeout(scrollToHash, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [containerRef, enabled, hash]);
}

