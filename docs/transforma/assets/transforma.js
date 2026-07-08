(function () {
  "use strict";

  const DATA = window.TRANSFORMA_DATA;
  if (!DATA) return;

  const allPages = DATA.sections.flatMap((s) => s.pages);
  const pageById = Object.fromEntries(allPages.map((p) => [p.id, p]));
  const protoById = Object.fromEntries(DATA.prototypes.map((p) => [p.id, p]));

  let currentPageId = "hub";
  let lightboxSetup = false;

  function getPageIdFromHash() {
    const hash = window.location.hash.replace(/^#/, "");
    return hash && pageById[hash] ? hash : "hub";
  }

  function navigate(pageId) {
    if (!pageById[pageId]) pageId = "hub";
    currentPageId = pageId;
    window.location.hash = pageId === "hub" ? "" : pageId;
    renderSidebar();
    loadPage(pageId);
  }

  function renderSidebar() {
    const nav = document.getElementById("sidebar-nav");
    if (!nav) return;

    nav.innerHTML = DATA.sections
      .map(
        (section) => `
        <div class="sidebar__section">${section.label}</div>
        ${section.pages
          .map(
            (p) =>
              `<a href="#${p.id === "hub" ? "" : p.id}" data-page="${p.id}" class="${p.id === currentPageId ? "active" : ""}">${p.icon} ${p.label}</a>`
          )
          .join("")}`
      )
      .join("");

    nav.querySelectorAll("a[data-page]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        navigate(a.dataset.page);
      });
    });
  }

  function prototypesForPage(pageId) {
    return DATA.prototypes.filter((p) => p.pages.includes(pageId));
  }

  function renderProtoCard(proto, compact) {
    if (compact) {
      return `<a class="proto-thumb" href="#prototipos" data-page="prototipos" title="${proto.title}">
        <img src="${proto.image}" alt="${proto.title}" loading="lazy">
        <span>${proto.title}</span>
      </a>`;
    }
    return `<article class="proto-card" data-proto="${proto.id}">
      <img class="proto-card__img" src="${proto.image}" alt="${proto.title}" loading="lazy" data-caption="${proto.title} — ${proto.desc}">
      <div class="proto-card__body">
        <div class="proto-card__title">${proto.title}</div>
        <div class="proto-card__route">${proto.route}</div>
        <div class="proto-card__desc">${proto.desc}</div>
        <div class="proto-card__meta">
          <span class="proto-badge">${proto.release}</span>
        </div>
      </div>
    </article>`;
  }

  function renderProtoContext(pageId) {
    const protos = prototypesForPage(pageId);
    if (!protos.length) return "";

    return `<section class="proto-context no-print">
      <h3>🖼️ Protótipos de tela relacionados</h3>
      <div class="proto-context-grid">
        ${protos
          .map(
            (p) => `<figure class="proto-context-item">
              <img src="${p.image}" alt="${p.title}" loading="lazy" data-caption="${p.title}">
              <figcaption>${p.title} <span class="proto-badge">${p.release}</span></figcaption>
            </figure>`
          )
          .join("")}
      </div>
      <p style="font-size:.8rem;color:var(--muted);margin-top:.75rem">
        <a href="#prototipos">Ver todos os ${DATA.prototypes.length} protótipos →</a>
      </p>
    </section>`;
  }

  function renderProtoBanner() {
    const featured = DATA.prototypes.slice(0, 4);
    return `<div class="proto-banner no-print">
      <h3>🖼️ Protótipos de tela — <a href="#prototipos" style="color:var(--accent)">ver todos (${DATA.prototypes.length})</a></h3>
      <div class="proto-strip">
        ${featured.map((p) => renderProtoCard(p, true)).join("")}
      </div>
    </div>`;
  }

  function renderPrototypesGallery() {
    const main = document.getElementById("main-content");
    main.innerHTML = `
      <div class="breadcrumb no-print">
        <a href="#" data-page="hub">Hub</a> › Protótipos de tela
      </div>
      <header class="page-header">
        <h2>Protótipos de Tela</h2>
        <p>Visuais conceituais das principais telas do LioTransforma — clique na imagem para ampliar.</p>
      </header>
      <div class="note note--info">
        Protótipos gerados para apresentação à diretoria e alinhamento de UX. Não representam implementação final.
      </div>
      <div class="proto-gallery">
        ${DATA.prototypes.map((p) => renderProtoCard(p, false)).join("")}
      </div>
      <footer class="page-footer">LioTransforma · ${DATA.prototypes.length} protótipos · v${DATA.meta.version}</footer>
    `;

    main.querySelector("[data-page='hub']")?.addEventListener("click", (e) => {
      e.preventDefault();
      navigate("hub");
    });

    bindLightbox(main);
  }

  function openLightbox(src, caption) {
    let lb = document.getElementById("proto-lightbox");
    if (!lb) {
      lb = document.createElement("div");
      lb.id = "proto-lightbox";
      lb.className = "proto-lightbox";
      lb.innerHTML = `<span class="proto-lightbox__close" aria-label="Fechar">×</span><img alt=""><div class="proto-lightbox__caption"></div>`;
      document.body.appendChild(lb);
      lb.addEventListener("click", (e) => {
        if (e.target === lb || e.target.classList.contains("proto-lightbox__close")) {
          lb.classList.remove("open");
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") lb.classList.remove("open");
      });
    }
    lb.querySelector("img").src = src;
    lb.querySelector("img").alt = caption || "";
    lb.querySelector(".proto-lightbox__caption").textContent = caption || "";
    lb.classList.add("open");
  }

  function bindLightbox(container) {
    container.querySelectorAll(".proto-card__img, .proto-context-item img").forEach((img) => {
      img.addEventListener("click", () => {
        openLightbox(img.src, img.dataset.caption || img.alt);
      });
    });
  }

  function setupLightboxDelegation() {
    if (lightboxSetup) return;
    lightboxSetup = true;
    document.body.addEventListener("click", (e) => {
      const img = e.target.closest(".proto-card__img, .proto-context-item img");
      if (img) {
        e.preventDefault();
        openLightbox(img.src, img.dataset.caption || img.alt);
      }
    });
  }

  function renderHub() {
    const main = document.getElementById("main-content");
    const { stats, releases } = DATA;

    main.innerHTML = `
      <header class="page-header">
        <h2>LioTransforma</h2>
        <p>Ecossistema corporativo de aprendizado, capacidades e transformação — documentação ágil para desenvolvimento no LioConecta.</p>
      </header>

      <div class="stats">
        <div class="stat"><div class="stat__label">Épicos</div><div class="stat__value">${stats.epics}</div></div>
        <div class="stat"><div class="stat__label">User stories</div><div class="stat__value">${stats.stories}</div></div>
        <div class="stat"><div class="stat__label">Protótipos</div><div class="stat__value">${stats.prototypes}</div></div>
        <div class="stat"><div class="stat__label">Releases</div><div class="stat__value">${stats.releases}</div></div>
        <div class="stat"><div class="stat__label">Specs</div><div class="stat__value">${stats.specs}</div></div>
      </div>

      ${renderProtoBanner()}

      <div class="note note--info">
        <strong>Como usar:</strong> comece pela <a href="#visao">Visão Executiva</a> ou <a href="#prototipos">Protótipos</a> para apresentar à diretoria;
        use <em>Épicos</em> e <em>Histórias</em> com o time de produto.
        Ative <em>Modo reunião</em> na barra lateral para fonte maior.
      </div>

      <div class="card">
        <h3>Releases planejadas</h3>
        ${releases
          .map(
            (r) => `<div class="release-row">
              <span class="release-row__id">${r.id}</span>
              <span style="flex:1"><strong>${r.name}</strong> <span style="color:var(--muted)">· ${r.period}</span></span>
              <span class="tech-only" style="font-size:.78rem;color:var(--muted)">${r.epics}</span>
            </div>`
          )
          .join("")}
      </div>

      ${DATA.sections
        .map(
          (section) => `
        <h3 style="margin:1.25rem 0 .75rem;color:var(--accent-dark);font-size:1rem">${section.label}</h3>
        <div class="card-grid">
          ${section.pages
            .filter((p) => p.id !== "hub")
            .map(
              (p) => `<a class="card-link" data-page="${p.id}" href="#${p.id}">
                <div class="card-link__icon">${p.icon}</div>
                <div class="card-link__title">${p.label}</div>
                <div class="card-link__desc">${p.desc}</div>
              </a>`
            )
            .join("")}
        </div>`
        )
        .join("")}

      <footer class="page-footer">LioTransforma · LioConecta · Documentação v${DATA.meta.version} · ${DATA.meta.date}</footer>
    `;

    main.querySelectorAll("[data-page]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        navigate(el.dataset.page);
      });
    });
  }

  function parseFrontmatter(text) {
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) return { meta: null, body: text };

    const meta = {};
    match[1].split("\n").forEach((line) => {
      const idx = line.indexOf(":");
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        let val = line.slice(idx + 1).trim();
        if (val === "true") val = true;
        if (val === "false") val = false;
        meta[key] = val;
      }
    });
    return { meta, body: match[2] };
  }

  function renderFrontmatter(meta) {
    if (!meta) return "";
    const rows = Object.entries(meta)
      .map(([k, v]) => `<strong>${k}</strong>: ${v}`)
      .join(" · ");
    return `<div class="frontmatter tech-only">${rows}</div>`;
  }

  function fixInternalLinks(html) {
    const div = document.createElement("div");
    div.innerHTML = html;

    div.querySelectorAll("a").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;

      // ./01-visao-executiva.md or 01-visao-executiva.md
      const mdMatch = href.match(/(?:\.\/)?([^/]+\.md)$/);
      if (mdMatch) {
        const file = mdMatch[1];
        const id = DATA.fileToId[file] || DATA.fileToId[`specs/${file}`];
        if (id) {
          a.setAttribute("href", `#${id}`);
          a.addEventListener("click", (e) => {
            e.preventDefault();
            navigate(id);
          });
        }
        return;
      }

      // ./specs/foo.md or specs/foo.md
      const specMatch = href.match(/(?:\.\/)?specs\/(.+\.md)$/);
      if (specMatch) {
        const full = `specs/${specMatch[1]}`;
        const id = DATA.fileToId[full];
        if (id) {
          a.setAttribute("href", `#${id}`);
          a.addEventListener("click", (e) => {
            e.preventDefault();
            navigate(id);
          });
        }
        return;
      }

      // ../07-mapa-capacidades.md
      const parentMatch = href.match(/\.\.\/(.+\.md)$/);
      if (parentMatch) {
        const full = parentMatch[1];
        const id = DATA.fileToId[`../${full}`] || DATA.fileToId[full];
        if (id) {
          a.setAttribute("href", `#${id}`);
          a.addEventListener("click", (e) => {
            e.preventDefault();
            navigate(id);
          });
        }
      }
    });

    return div.innerHTML;
  }

  async function renderMermaid(container) {
    const blocks = container.querySelectorAll("pre code.language-mermaid, code.language-mermaid");
    for (const block of blocks) {
      const parent = block.closest("pre") || block;
      const src = block.textContent;
      const div = document.createElement("div");
      div.className = "mermaid";
      div.textContent = src;
      parent.replaceWith(div);
    }
    if (container.querySelector(".mermaid") && window.mermaid) {
      try {
        await mermaid.run({ nodes: container.querySelectorAll(".mermaid") });
      } catch (e) {
        console.warn("Mermaid render:", e);
      }
    }
  }

  async function loadPage(pageId) {
    const main = document.getElementById("main-content");
    const page = pageById[pageId];
    if (!page) return renderHub();

    if (pageId === "hub") return renderHub();
    if (pageId === "prototipos") return renderPrototypesGallery();

    main.innerHTML = `<div class="loading">Carregando ${page.label}…</div>`;

    try {
      const res = await fetch(page.file);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.text();
      const { meta, body } = parseFrontmatter(raw);

      const html = marked.parse(body, { gfm: true, breaks: false });
      const fixed = fixInternalLinks(html);

      main.innerHTML = `
        <div class="breadcrumb no-print">
          <a href="#" data-page="hub">Hub</a> › ${page.label}
        </div>
        <div class="toolbar no-print">
          <button type="button" id="btn-print">🖨️ Imprimir</button>
          <button type="button" id="btn-raw" data-file="${page.file}">📄 Abrir MD</button>
        </div>
        ${renderFrontmatter(meta)}
        ${renderProtoContext(pageId)}
        <article class="md-content">${fixed}</article>
        <footer class="page-footer">LioTransforma · ${page.file} · v${DATA.meta.version}</footer>
      `;

      main.querySelector("[data-page='hub']")?.addEventListener("click", (e) => {
        e.preventDefault();
        navigate("hub");
      });

      document.getElementById("btn-print")?.addEventListener("click", () => window.print());
      document.getElementById("btn-raw")?.addEventListener("click", (e) => {
        window.open(e.target.dataset.file, "_blank");
      });

      await renderMermaid(main);
    } catch (err) {
      main.innerHTML = `
        <div class="error-box">
          <strong>Erro ao carregar documento</strong><br>
          ${page.file}: ${err.message}<br><br>
          <small>Use um servidor local: <code>npm run docs:transforma</code></small>
        </div>
      `;
    }
  }

  function setupSearch() {
    const input = document.getElementById("global-search");
    const results = document.getElementById("search-results");
    if (!input || !results) return;

    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) {
        results.classList.remove("visible");
        results.innerHTML = "";
        return;
      }

      const matches = allPages.filter(
        (p) =>
          p.label.toLowerCase().includes(q) ||
          (p.desc && p.desc.toLowerCase().includes(q)) ||
          (p.file && p.file.toLowerCase().includes(q))
      );

      const protoMatches = DATA.prototypes.filter(
        (p) => p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
      );

      if (!matches.length && !protoMatches.length) {
        results.innerHTML = `<span style="padding:.5rem .75rem;display:block;opacity:.7;font-size:.78rem">Nenhum resultado</span>`;
      } else {
        results.innerHTML = [
          ...matches.map(
            (p) =>
              `<a href="#${p.id}" data-page="${p.id}">${p.icon} ${p.label}<br><small style="opacity:.7">${p.desc || ""}</small></a>`
          ),
          ...protoMatches.map(
            (p) =>
              `<a href="#prototipos" data-page="prototipos">🖼️ ${p.title}<br><small style="opacity:.7">Protótipo · ${p.desc}</small></a>`
          ),
        ].join("");
        results.querySelectorAll("[data-page]").forEach((a) => {
          a.addEventListener("click", (e) => {
            e.preventDefault();
            navigate(a.dataset.page);
            results.classList.remove("visible");
            input.value = "";
          });
        });
      }
      results.classList.add("visible");
    });

    document.addEventListener("click", (e) => {
      if (!input.contains(e.target) && !results.contains(e.target)) {
        results.classList.remove("visible");
      }
    });
  }

  function setupMeetingMode() {
    const btn = document.getElementById("meeting-mode-btn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      document.body.classList.toggle("meeting-mode");
      btn.textContent = document.body.classList.contains("meeting-mode")
        ? "Modo normal"
        : "Modo reunião";
    });
  }

  function init() {
    setupLightboxDelegation();
    renderSidebar();
    setupSearch();
    setupMeetingMode();

    currentPageId = getPageIdFromHash();
    renderSidebar();
    loadPage(currentPageId);

    window.addEventListener("hashchange", () => {
      currentPageId = getPageIdFromHash();
      renderSidebar();
      loadPage(currentPageId);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
