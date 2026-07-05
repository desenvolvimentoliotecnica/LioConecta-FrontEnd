import { useEffect, useRef, type RefObject } from "react";
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

export function usePageScript(page: PageEntry | undefined, contentKey: string) {
  const ranRef = useRef<string | null>(null);

  useEffect(() => {
    if (!page) return;
    const key = `${page.id}:${contentKey}`;
    if (ranRef.current === key) return;

    let cancelled = false;

    async function boot() {
      if (page!.profileAssets) {
        await loadScript("/assets/pessoas-perfil.js");
        if (cancelled) return;
        window.ProfilePage?.init();
        ranRef.current = key;
        return;
      }

      if (page!.organograma) {
        await loadScript("/assets/org-profile-modal.js");
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

export function useFeedComments(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const commentPool = [
      { author: "Julia Santos", avatar: "/avatar-julia-santos.png", time: "2h", text: "Excelente iniciativa! Já compartilhei com minha equipe." },
      { author: "Carlos Mendes", avatar: "/avatar-carlos-mendes.png", time: "3h", text: "Muito bom ver a empresa investindo em bem-estar." },
      { author: "Ana Costa", avatar: "/avatar-maria-silva.png", time: "4h", text: "Parabéns pelo comunicado claro e objetivo." },
      { author: "Pedro Lima", avatar: "/avatar-carlos-mendes.png", time: "5h", text: "Isso faz diferença no dia a dia. Obrigado!" },
      { author: "Fernanda Rocha", avatar: "/avatar-julia-santos.png", time: "6h", text: "Adorei a proposta. Quando começa?" },
    ];

    function shuffle<T>(arr: T[]): T[] {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    let pool = shuffle(commentPool);
    const cards = root.querySelectorAll(".feed-grid .card:not(.card--mood)");

    cards.forEach((card) => {
      if (card.querySelector(".comments")) return;
      const count = 1 + Math.floor(Math.random() * 3);
      const picked: typeof commentPool = [];
      for (let i = 0; i < count; i++) {
        if (!pool.length) pool = shuffle(commentPool);
        picked.push(pool.pop()!);
      }

      const wrap = document.createElement("div");
      wrap.className = "comments";
      wrap.innerHTML = `
        <div class="comments__title">Comentários (${picked.length})</div>
        ${picked
          .map(
            (c) => `
          <div class="comment">
            <img class="avatar avatar--xs" src="${c.avatar}" alt="" />
            <div class="comment__body">
              <div class="comment__meta"><strong>${c.author}</strong> · ${c.time}</div>
              <p>${c.text}</p>
            </div>
          </div>`
          )
          .join("")}
        <div class="comments__input" aria-hidden="true">
          <img class="avatar avatar--xs" src="/avatar-maria-silva.png" alt="" />
          <span>Escreva um comentário...</span>
        </div>`;
      card.appendChild(wrap);
    });
  }, [containerRef]);
}
