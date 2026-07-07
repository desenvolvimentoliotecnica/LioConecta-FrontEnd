(function () {
  "use strict";

  const DATA = window.ROADMAP_DATA;
  if (!DATA) return;

  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  function statusBadge(status) {
    const labels = {
      integrated: "Integrado",
      partial: "Parcial",
      prototype: "Protótipo",
      new: "Novo",
      blocked: "Bloqueado",
      soon: "Em breve",
    };
    return `<span class="badge badge--${status}">${labels[status] || status}</span>`;
  }

  function renderSidebar() {
    const el = document.getElementById("sidebar-nav");
    if (!el) return;
    el.innerHTML = DATA.pages
      .map(
        (p) =>
          `<a href="${p.href}" class="${p.href === currentPage ? "active" : ""}">${p.icon} ${p.label}</a>`
      )
      .join("");
  }

  function renderStats() {
    const stories = DATA.stories.length;
    const tasks = DATA.tasks.length;
    const blocked = DATA.gestorChecklist.filter((g) => g.status === "blocked").length;
    const integrated = DATA.gestorChecklist.filter((g) => g.status === "integrated").length;

    document.querySelectorAll("[data-stat=stories]").forEach((el) => (el.textContent = stories));
    document.querySelectorAll("[data-stat=tasks]").forEach((el) => (el.textContent = tasks));
    document.querySelectorAll("[data-stat=blocked]").forEach((el) => (el.textContent = blocked));
    document.querySelectorAll("[data-stat=integrated]").forEach((el) => (el.textContent = integrated));
    document.querySelectorAll("[data-stat=gestor-items]").forEach(
      (el) => (el.textContent = DATA.gestorChecklist.length)
    );
    document.querySelectorAll("[data-stat=epics]").forEach((el) => (el.textContent = DATA.epics.length));
    document.querySelectorAll("[data-stat=qa]").forEach((el) => (el.textContent = DATA.qaCases.length));
  }

  function phaseProgress(phaseId) {
    const items = DATA.gestorChecklist.filter((g) => {
      const story = DATA.stories.find((s) => g.backlog.includes(s.id));
      return story ? story.phase === phaseId : false;
    });
    if (!items.length) return 0;
    const done = items.filter((i) => i.status === "integrated").length;
    const partial = items.filter((i) => i.status === "partial").length;
    return Math.round(((done + partial * 0.5) / items.length) * 100);
  }

  function renderPhaseProgress() {
    const el = document.getElementById("phase-progress");
    if (!el) return;
    const colors = ["#2563eb", "#059669", "#d97706", "#7c3aed"];
    el.innerHTML = DATA.phases
      .map((p, i) => {
        const pct = phaseProgress(p.id);
        return `<div class="phase-row">
          <span class="phase-row__label">${p.id}</span>
          <span class="phase-row__name">${p.name} <span style="color:var(--muted);font-size:.78rem">(${p.sprints} sprints)</span></span>
          <span class="phase-row__pct">${pct}%</span>
          <div style="width:120px"><div class="progress-bar"><div class="progress-bar__fill" style="width:${pct}%;background:${colors[i]}"></div></div></div>
        </div>`;
      })
      .join("");
  }

  function renderChecklist() {
    const el = document.getElementById("gestor-checklist");
    if (!el) return;
    el.innerHTML = DATA.gestorChecklist
      .map(
        (g) => `<div class="checklist-item">
          ${statusBadge(g.status)}
          <span style="flex:1"><strong>${g.pillar}</strong> — ${g.item}</span>
          <a href="${g.spec}">Spec</a>
          <a href="${g.backlog}">Backlog</a>
        </div>`
      )
      .join("");
  }

  function renderHubCards() {
    const el = document.getElementById("hub-cards");
    if (!el) return;
    const counts = {
      "01-executivo.html": DATA.gestorChecklist.length,
      "02-backlog.html": DATA.stories.length,
      "03-specs-rm.html": DATA.gestorChecklist.filter((g) => g.pillar === "RM").length,
      "04-specs-intranet.html": DATA.gestorChecklist.filter((g) => g.pillar === "Intranet").length,
      "05-specs-auth-hub.html": DATA.gestorChecklist.filter((g) => g.pillar === "Auth").length,
      "06-qa.html": DATA.qaCases.length,
      "07-releases.html": DATA.releases.length,
      "08-matriz-maturidade.html": DATA.maturityMatrix.length,
    };
    el.innerHTML = DATA.pages
      .filter((p) => p.href !== "index.html")
      .map(
        (p) => `<a class="card-link" href="${p.href}">
          <div class="card-link__icon">${p.icon}</div>
          <div class="card-link__title">${p.label}</div>
          <div class="card-link__desc">${p.desc}</div>
          <div class="card-link__count">${counts[p.href] ?? "—"} itens</div>
        </a>`
      )
      .join("");
  }

  function specPageFor(specId) {
    if (!specId) return null;
    const rm = ["holerite", "ferias", "ponto", "banco", "promocao", "desligamento", "transferencia", "vaga"];
    const auth = ["hub-apps", "sso", "datasul", "tms", "mercanet"];
    if (rm.some((k) => specId.includes(k))) return "03-specs-rm.html";
    if (auth.some((k) => specId.includes(k))) return "05-specs-auth-hub.html";
    return "04-specs-intranet.html";
  }

  function typeBadge(type) {
    const cls = type.toLowerCase();
    return `<span class="badge badge--${cls}">${type}</span>`;
  }

  function renderSpecTasks() {
    document.querySelectorAll(".spec-block[id^='spec-']").forEach((article) => {
      const specId = article.id;
      const tasks = DATA.tasks.filter((t) => t.specId === specId);
      if (!tasks.length) return;

      const existing = article.querySelector(".spec-tasks-section");
      if (existing) existing.remove();

      const byType = { FE: 0, BE: 0, QA: 0, DOC: 0 };
      tasks.forEach((t) => {
        if (byType[t.type] !== undefined) byType[t.type]++;
      });

      const summary = [
        byType.FE && `${byType.FE} FE`,
        byType.BE && `${byType.BE} BE`,
        byType.QA && `${byType.QA} QA`,
        byType.DOC && `${byType.DOC} DOC`,
      ]
        .filter(Boolean)
        .join(" · ");

      const rows = tasks
        .map((t) => {
          const done = isTaskDone(t);
          return `<tr class="${done ? "task-done" : ""}">
            <td><code>${t.id}</code>${done ? " ✓" : ""}</td>
            <td>${typeBadge(t.type)}</td>
            <td><a href="02-backlog.html#${t.story}">${t.story}</a></td>
            <td>${t.title}</td>
            <td>${t.phase}</td>
          </tr>`;
        })
        .join("");

      article.insertAdjacentHTML(
        "beforeend",
        `<div class="spec-tasks-section">
          <h4>Tasks desta spec (${tasks.length})</h4>
          <p class="spec-tasks-summary">${summary}</p>
          <table>
            <thead><tr><th>ID</th><th>Tipo</th><th>História</th><th>Task</th><th>Fase</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="spec-actions no-print">
          <button type="button" class="btn-export btn-export--sm" data-export-spec="${specId}">⬇ Exportar MD desta spec</button>
        </div>`
      );
    });

    document.querySelectorAll("[data-export-spec]").forEach((btn) => {
      btn.addEventListener("click", () => exportSpecMarkdown(btn.dataset.exportSpec));
    });
  }

  function isStoryDone(story) {
    if (story.done === true) return true;
    if (story.done === false) return false;
    return story.status === "integrated";
  }

  function isTaskDone(task) {
    return task.done === true;
  }

  function taskCheckbox(task) {
    return isTaskDone(task) ? "[x]" : "[ ]";
  }

  function storyCheckbox(story) {
    if (isStoryDone(story)) return "[x]";
    return "[ ]";
  }

  function extractSpecBodyMarkdown(article) {
    const lines = [];
    Array.from(article.children).forEach((node) => {
      if (
        node.classList?.contains("spec-tasks-section") ||
        node.classList?.contains("spec-actions")
      ) {
        return;
      }
      const tag = node.tagName;
      if (tag === "H3") return;
      if (tag === "H4") {
        lines.push(`### ${node.textContent.trim()}\n`);
        return;
      }
      if (tag === "P") {
        lines.push(`${node.innerText.trim()}\n`);
        return;
      }
      if (tag === "UL" || tag === "OL") {
        node.querySelectorAll("li").forEach((li) => lines.push(`- ${li.innerText.trim()}`));
        lines.push("");
        return;
      }
      if (tag === "PRE") {
        lines.push("```");
        lines.push(node.textContent.trim());
        lines.push("```\n");
      }
    });
    return lines.join("\n").trim();
  }

  function getSpecTitle(article) {
    const h3 = article.querySelector("h3");
    if (!h3) return article.id;
    return h3.cloneNode(true).textContent.replace(/\s+/g, " ").trim();
  }

  function getGestorItem(specId) {
    return DATA.gestorChecklist.find((g) => g.spec.endsWith(`#${specId}`));
  }

  function getStoriesForSpec(specId) {
    const storyIds = [...new Set(DATA.tasks.filter((t) => t.specId === specId).map((t) => t.story))];
    return storyIds
      .map((id) => DATA.stories.find((s) => s.id === id))
      .filter(Boolean);
  }

  function buildSpecMarkdown(specId) {
    const article = document.getElementById(specId);
    if (!article) return "";

    const title = getSpecTitle(article);
    const gestor = getGestorItem(specId);
    const stories = getStoriesForSpec(specId);
    const tasks = DATA.tasks.filter((t) => t.specId === specId);
    const body = extractSpecBodyMarkdown(article);
    const exportedAt = new Date().toISOString();
    const pendingTasks = tasks.filter((t) => !isTaskDone(t)).length;
    const epic = stories[0] ? DATA.epics.find((e) => e.id === stories[0].epic) : null;

    let md = "";
    md += "---\n";
    md += `type: lioconecta-spec\n`;
    md += `specId: ${specId}\n`;
    md += `roadmapVersion: ${DATA.meta.version}\n`;
    md += `exportedAt: ${exportedAt}\n`;
    md += `source: docs/roadmap/assets/roadmap-data.js\n`;
    md += `pendingTasks: ${pendingTasks}\n`;
    md += `totalTasks: ${tasks.length}\n`;
    md += "---\n\n";

    md += `# ${title}\n\n`;
    md += `> Pacote para implementação · LioConecta Roadmap\n\n`;

    md += "## Como usar este arquivo\n\n";
    md += "1. Forneça este MD ao agente/dev para implementar tasks pendentes (`[ ]`).\n";
    md += "2. Após implementar, atualize `docs/roadmap/assets/roadmap-data.js`:\n";
    md += "   - `done: true` em cada task concluída\n";
    md += "   - `status: \"integrated\"` na story (se aplicável)\n";
    md += "3. Reexporte o MD para refletir o progresso.\n\n";

    md += "## Metadados\n\n";
    md += `| Campo | Valor |\n|-------|-------|\n`;
    md += `| specId | \`${specId}\` |\n`;
    if (gestor) {
      md += `| Item gestor | ${gestor.id} — ${gestor.item} |\n`;
      md += `| Status gestor | ${gestor.status} |\n`;
    }
    if (epic) md += `| Epic | ${epic.id} — ${epic.name} |\n`;
    md += `| Tasks pendentes | ${pendingTasks} / ${tasks.length} |\n`;
    md += `| Exportado em | ${new Date(exportedAt).toLocaleString("pt-BR")} |\n\n`;

    md += "## Especificação funcional\n\n";
    md += body + "\n\n";

    md += "## Histórias de usuário\n\n";
    if (!stories.length) {
      md += "_Nenhuma história vinculada._\n\n";
    } else {
      stories.forEach((story) => {
        const storyTasks = tasks.filter((t) => t.story === story.id);
        const doneCount = storyTasks.filter(isTaskDone).length;
        md += `### ${storyCheckbox(story)} ${story.id} — ${story.title}\n\n`;
        md += `- **Status:** ${story.status}\n`;
        md += `- **Fase:** ${story.phase}\n`;
        md += `- **Prioridade:** ${story.priority}\n`;
        md += `- **Feature:** ${story.feature}\n`;
        if (story.route && story.route !== "—") md += `- **Rota:** \`${story.route}\`\n`;
        if (story.file && story.file !== "—") md += `- **Arquivo:** \`${story.file}\`\n`;
        md += `- **Tasks:** ${doneCount}/${storyTasks.length} concluídas\n\n`;

        if (!storyTasks.length) {
          md += "_Sem tasks._\n\n";
          return;
        }

        md += "#### Tasks\n\n";
        ["FE", "BE", "QA", "DOC"].forEach((type) => {
          const typed = storyTasks.filter((t) => t.type === type);
          if (!typed.length) return;
          md += `**${type}**\n\n`;
          typed.forEach((t) => {
            md += `- ${taskCheckbox(t)} \`${t.id}\` (${t.phase}) — ${t.title}\n`;
          });
          md += "\n";
        });
      });
    }

    md += "## Resumo de tasks (todas)\n\n";
    md += "| Status | ID | Tipo | História | Task | Fase |\n";
    md += "|--------|-----|------|----------|------|------|\n";
    tasks.forEach((t) => {
      const st = isTaskDone(t) ? "✅" : "⬜";
      md += `| ${st} | \`${t.id}\` | ${t.type} | ${t.story} | ${t.title} | ${t.phase} |\n`;
    });
    md += "\n";

    md += "## Checklist pós-implementação\n\n";
    md += "- [ ] Código implementado e revisado\n";
    md += "- [ ] Tasks marcadas `done: true` em `roadmap-data.js`\n";
    md += "- [ ] Story/status atualizados no roadmap\n";
    md += "- [ ] `page-maturity.ts` / `sitemap.ts` revisados (se nova rota)\n";
    md += "- [ ] QA da spec executado\n";
    md += "- [ ] MD reexportado com progresso atualizado\n";

    return md;
  }

  function downloadMarkdown(filename, content) {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  function exportSpecMarkdown(specId) {
    const md = buildSpecMarkdown(specId);
    if (!md) return;
    downloadMarkdown(`lioconecta-${specId}.md`, md);
  }

  function exportAllSpecsOnPage() {
    const specs = Array.from(document.querySelectorAll(".spec-block[id^='spec-']")).map((el) => el.id);
    if (!specs.length) return;

    let md = `# LioConecta — Exportação de Specs\n\n`;
    md += `> Página: ${currentPage} · ${new Date().toLocaleString("pt-BR")} · ${specs.length} specs\n\n`;
    md += DATA.meta.exportHint + "\n\n";
    md += "---\n\n";

    specs.forEach((specId, i) => {
      md += buildSpecMarkdown(specId);
      if (i < specs.length - 1) md += "\n\n---\n\n";
    });

    const pageSlug = currentPage.replace(".html", "");
    downloadMarkdown(`lioconecta-${pageSlug}-todas-specs.md`, md);
  }

  function renderSpecPageToolbar() {
    const toolbar = document.getElementById("spec-page-toolbar");
    if (!toolbar) return;

    const count = document.querySelectorAll(".spec-block[id^='spec-']").length;
    toolbar.innerHTML = `
      <button type="button" class="btn-export" id="export-all-specs-btn">⬇ Exportar todas specs desta página (${count} MD)</button>
      <span style="font-size:.82rem;color:var(--muted);align-self:center">Ou exporte spec a spec no final de cada bloco</span>
    `;

    document.getElementById("export-all-specs-btn")?.addEventListener("click", exportAllSpecsOnPage);
  }

  function renderBacklogTable() {
    const tbody = document.getElementById("backlog-tbody");
    if (!tbody) return;

    tbody.innerHTML = DATA.stories
      .map((s) => {
        const epic = DATA.epics.find((e) => e.id === s.epic);
        const storyTasks = DATA.tasks.filter((t) => t.story === s.id);
        const fe = storyTasks.filter((t) => t.type === "FE").length;
        const be = storyTasks.filter((t) => t.type === "BE").length;
        const qa = storyTasks.filter((t) => t.type === "QA").length;
        const specMap = {
          "EPIC-RM": "03-specs-rm.html",
          "EPIC-INTRA": "04-specs-intranet.html",
          "EPIC-AUTH": "05-specs-auth-hub.html",
        };
        return `<tr id="${s.id}" data-epic="${s.epic}" data-phase="${s.phase}" data-status="${s.status}">
          <td><code>${s.id}</code></td>
          <td>${epic?.name ?? s.epic}</td>
          <td>${s.feature}</td>
          <td>${s.title}</td>
          <td>${s.phase}</td>
          <td>${statusBadge(s.status)}</td>
          <td class="tech-only">${fe} FE</td>
          <td class="tech-only">${be} BE</td>
          <td class="tech-only">${qa} QA</td>
          <td>${s.priority}</td>
          <td><a href="${specMap[s.epic] ?? "#"}">Spec</a></td>
        </tr>`;
      })
      .join("");

    setupBacklogFilters();
  }

  function setupBacklogFilters() {
    const tbody = document.getElementById("backlog-tbody");
    if (!tbody) return;

    const epicFilter = document.getElementById("filter-epic");
    const phaseFilter = document.getElementById("filter-phase");
    const statusFilter = document.getElementById("filter-status");
    const searchInput = document.getElementById("backlog-search");

    function applyFilters() {
      const epic = epicFilter?.value || "";
      const phase = phaseFilter?.value || "";
      const status = statusFilter?.value || "";
      const q = (searchInput?.value || "").toLowerCase();

      tbody.querySelectorAll("tr").forEach((row) => {
        const matchEpic = !epic || row.dataset.epic === epic;
        const matchPhase = !phase || row.dataset.phase === phase;
        const matchStatus = !status || row.dataset.status === status;
        const text = row.textContent.toLowerCase();
        const matchSearch = !q || text.includes(q);
        row.classList.toggle("hidden", !(matchEpic && matchPhase && matchStatus && matchSearch));
      });
    }

    [epicFilter, phaseFilter, statusFilter, searchInput].forEach((el) => {
      el?.addEventListener("change", applyFilters);
      el?.addEventListener("input", applyFilters);
    });
  }

  function renderTasksTable() {
    const tbody = document.getElementById("tasks-tbody");
    if (!tbody) return;

    tbody.innerHTML = DATA.tasks
      .map(
        (t) => `<tr data-type="${t.type}" data-phase="${t.phase}">
          <td><code>${t.id}</code></td>
          <td><a href="02-backlog.html#${t.story}">${t.story}</a></td>
          <td>${t.specId ? `<a href="${specPageFor(t.specId)}#${t.specId}">${t.specId.replace("spec-", "")}</a>` : "—"}</td>
          <td><span class="badge badge--${t.type.toLowerCase()}">${t.type}</span></td>
          <td>${t.title}</td>
          <td>${t.phase}</td>
        </tr>`
      )
      .join("");
  }

  function renderMaturityTable() {
    const tbody = document.getElementById("maturity-tbody");
    if (!tbody) return;

    tbody.innerHTML = DATA.maturityMatrix
      .map(
        (m) => `<tr>
          <td><code>${m.route}</code></td>
          <td>${m.label}</td>
          <td>${statusBadge(m.maturity)}</td>
          <td class="tech-only"><code>${m.file}</code></td>
          <td class="tech-only"><code>${m.api}</code></td>
          <td>${m.gestor}</td>
          <td>${m.gap}</td>
        </tr>`
      )
      .join("");

    renderHeatmap();
  }

  function renderHeatmap() {
    const el = document.getElementById("maturity-heatmap");
    if (!el) return;

    const pillars = [
      { name: "RM", keys: ["G-RM"] },
      { name: "Intranet", keys: ["G-IN"] },
      { name: "Auth/Hub", keys: ["G-AU"] },
    ];

    el.innerHTML = pillars
      .map((p) => {
        const items = DATA.gestorChecklist.filter((g) => p.keys.some((k) => g.id.startsWith(k)));
        const done = items.filter((i) => i.status === "integrated").length;
        const partial = items.filter((i) => i.status === "partial").length;
        const pct = Math.round(((done + partial * 0.5) / items.length) * 100);
        return `<div class="heatmap__cell">
          <div class="heatmap__pct" style="color:var(--fe)">${pct}%</div>
          <div class="heatmap__label">${p.name}<br>${done} integrado · ${partial} parcial · ${items.length - done - partial} pendente</div>
        </div>`;
      })
      .join("");
  }

  function renderQaMatrix() {
    const tbody = document.getElementById("qa-tbody");
    if (!tbody) return;

    tbody.innerHTML = DATA.qaCases
      .map(
        (q) => `<tr>
          <td><code>${q.id}</code></td>
          <td><a href="02-backlog.html#${q.story}">${q.story}</a></td>
          <td>${q.type}</td>
          <td>${q.title}</td>
          <td>${q.phase}</td>
        </tr>`
      )
      .join("");
  }

  function renderReleases() {
    const el = document.getElementById("releases-list");
    if (!el) return;

    el.innerHTML = DATA.releases
      .map(
        (r) => `<div class="card" id="${r.id}">
          <h3>${r.id} — ${r.name} <span class="badge badge--new">${r.phase}</span></h3>
          <h4>Script demo (reunião)</h4>
          <ol>${r.demo.map((d) => `<li>${d}</li>`).join("")}</ol>
        </div>`
      )
      .join("");
  }

  function setupGlobalSearch() {
    const input = document.getElementById("global-search");
    const results = document.getElementById("search-results");
    if (!input || !results) return;

    const index = [];
    DATA.stories.forEach((s) =>
      index.push({ label: `${s.id}: ${s.title}`, href: `02-backlog.html#${s.id}` })
    );
    DATA.gestorChecklist.forEach((g) =>
      index.push({ label: `[Gestor] ${g.item}`, href: g.backlog })
    );
    DATA.tasks.forEach((t) => {
      index.push({
        label: `${t.id}: ${t.title}`,
        href: t.specId ? `${specPageFor(t.specId)}#${t.specId}` : `02-backlog.html#${t.story}`,
      });
    });

    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) {
        results.classList.remove("visible");
        return;
      }
      const matches = index.filter((i) => i.label.toLowerCase().includes(q)).slice(0, 12);
      results.innerHTML = matches.map((m) => `<a href="${m.href}">${m.label}</a>`).join("");
      results.classList.toggle("visible", matches.length > 0);
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
        ? "Modo técnico"
        : "Modo reunião";
    });
  }

  function scrollToHash() {
    const hash = window.location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderSidebar();
    renderStats();
    renderPhaseProgress();
    renderChecklist();
    renderHubCards();
    renderBacklogTable();
    renderTasksTable();
    renderMaturityTable();
    renderQaMatrix();
    renderReleases();
    renderSpecTasks();
    renderSpecPageToolbar();
    setupGlobalSearch();
    setupMeetingMode();
    scrollToHash();
  });
})();
