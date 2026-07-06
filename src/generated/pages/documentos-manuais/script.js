(function () {
      const areaLabels = {
        operacional: "Operacional",
        ti: "TI",
        rh: "RH",
        qualidade: "Qualidade",
        comercial: "Comercial",
        financeiro: "Financeiro"
      };

      const typeLabels = {
        manual: "Manual",
        procedimento: "Procedimento",
        guia: "Guia rápido"
      };

      const typeIcons = {
        manual: "fa-book",
        procedimento: "fa-list-check",
        guia: "fa-bolt"
      };

      const manuals = [
        {
          id: "manual-colaborador",
          title: "Manual do Colaborador",
          desc: "Guia completo de integração: cultura, estrutura organizacional, benefícios, rotinas internas e canais oficiais de comunicação.",
          area: "rh",
          type: "manual",
          version: "v7.0",
          date: "Mar/2026",
          pages: 42,
          featured: true,
          updated: true
        },
        {
          id: "proc-admissao",
          title: "Procedimento de Admissão",
          desc: "Fluxo de contratação: documentação, exames, assinaturas, provisionamento de acessos e checklist de integração do novo colaborador.",
          area: "rh",
          type: "procedimento",
          version: "v3.2",
          date: "Jan/2026",
          pages: 18,
          featured: false,
          updated: false
        },
        {
          id: "guia-ponto",
          title: "Guia Rápido: Registro de Ponto",
          desc: "Como registrar entrada, saída, intervalos e solicitar ajustes no sistema de ponto eletrônico.",
          area: "rh",
          type: "guia",
          version: "v1.5",
          date: "Fev/2026",
          pages: 4,
          featured: false,
          updated: true
        },
        {
          id: "proc-chamados-ti",
          title: "Procedimento de Abertura de Chamados TI",
          desc: "Classificação de incidentes, prioridades, SLA por categoria e encaminhamento no help desk corporativo.",
          area: "ti",
          type: "procedimento",
          version: "v4.1",
          date: "Dez/2025",
          pages: 14,
          featured: false,
          updated: false
        },
        {
          id: "guia-vpn",
          title: "Guia Rápido: VPN e Acesso Remoto",
          desc: "Instalação do cliente VPN, autenticação multifator e resolução dos erros mais comuns de conexão remota.",
          area: "ti",
          type: "guia",
          version: "v2.0",
          date: "Mar/2026",
          pages: 6,
          featured: false,
          updated: true
        },
        {
          id: "proc-backup",
          title: "Procedimento de Backup e Restore",
          desc: "Rotinas de backup, retenção, testes de restauração e responsabilidades em caso de perda de dados.",
          area: "ti",
          type: "procedimento",
          version: "v3.4",
          date: "Out/2025",
          pages: 22,
          featured: false,
          updated: false
        },
        {
          id: "manual-iso9001",
          title: "Manual de Qualidade ISO 9001",
          desc: "Sistema de gestão da qualidade, escopo, mapa de processos e referências normativas aplicáveis à organização.",
          area: "qualidade",
          type: "manual",
          version: "v6.3",
          date: "Nov/2025",
          pages: 56,
          featured: false,
          updated: false
        },
        {
          id: "proc-nc-capa",
          title: "Procedimento de NC e CAPA",
          desc: "Registro de não conformidades, análise de causa raiz, plano de ação corretiva e verificação de eficácia.",
          area: "qualidade",
          type: "procedimento",
          version: "v2.9",
          date: "Jan/2026",
          pages: 16,
          featured: false,
          updated: true
        },
        {
          id: "manual-atendimento",
          title: "Manual de Boas Práticas de Atendimento",
          desc: "Padrões de comunicação, SLA comercial, scripts de abordagem e tratamento de objeções no relacionamento com clientes.",
          area: "comercial",
          type: "manual",
          version: "v3.0",
          date: "Fev/2026",
          pages: 28,
          featured: false,
          updated: false
        },
        {
          id: "proc-onboarding-comercial",
          title: "Procedimento de Onboarding Comercial",
          desc: "Handoff de leads, cadastro no CRM, definição de carteira e acompanhamento dos primeiros 90 dias de novos vendedores.",
          area: "comercial",
          type: "procedimento",
          version: "v1.8",
          date: "Ago/2025",
          pages: 12,
          featured: false,
          updated: false
        },
        {
          id: "proc-compras",
          title: "Procedimento de Compras e Cotações",
          desc: "Solicitação de compras, alçadas de aprovação, cotação com fornecedores e registro no ERP financeiro.",
          area: "financeiro",
          type: "procedimento",
          version: "v4.5",
          date: "Set/2025",
          pages: 20,
          featured: false,
          updated: false
        },
        {
          id: "manual-seguranca-operacional",
          title: "Manual de Segurança Operacional",
          desc: "Instruções de EPI, sinalização, permissão de trabalho e resposta a emergências em áreas operacionais e planta.",
          area: "operacional",
          type: "manual",
          version: "v5.1",
          date: "Mar/2026",
          pages: 32,
          featured: false,
          updated: true
        }
      ];

      function pdfUrl(id) {
        return "/documents/manuais-procedimentos/" + id + ".pdf";
      }

      function renderManual(item) {
        const featuredClass = item.featured ? " is-featured" : "";
        const typeClass = item.type === "procedimento" ? "procedimento" : item.type === "guia" ? "guia" : "manual";
        const typeBadgeClass = item.type === "procedimento" ? " doc-card__type--procedimento" : item.type === "guia" ? " doc-card__type--guia" : "";
        const updatedBadge = item.updated ? '<span class="doc-card__updated">Atualizado</span>' : "";
        const url = pdfUrl(item.id);

        return `
          <article class="doc-card${featuredClass}" data-area="${item.area}" data-id="${item.id}">
            <div class="doc-card__head">
              <div class="doc-card__icon doc-card__icon--${typeClass}" aria-hidden="true">
                <i class="fa-solid ${typeIcons[item.type] || "fa-book"}"></i>
              </div>
              <div class="doc-card__main">
                <h2 class="doc-card__title">${item.title}</h2>
                <p class="doc-card__desc">${item.desc}</p>
              </div>
            </div>
            <div class="doc-card__tags">
              <span class="doc-card__type${typeBadgeClass}">${typeLabels[item.type] || item.type}</span>
              <span class="doc-card__area doc-card__area--${item.area}">${areaLabels[item.area] || item.area}</span>
              <span class="doc-card__version">${item.version}</span>
              ${updatedBadge}
            </div>
            <div class="doc-card__meta">
              <span><i class="fa-regular fa-calendar" aria-hidden="true"></i> Revisão ${item.date}</span>
              <span><i class="fa-regular fa-file-lines" aria-hidden="true"></i> ${item.pages} páginas</span>
            </div>
            <div class="doc-card__footer">
              <button type="button" class="doc-card__open" data-action="view"><i class="fa-regular fa-eye" aria-hidden="true"></i> Visualizar</button>
              <div class="doc-card__actions">
                <a class="doc-card__btn" href="${url}" download aria-label="Baixar ${item.title}"><i class="fa-solid fa-download" aria-hidden="true"></i></a>
                <a class="doc-card__btn" href="#" aria-label="Salvar ${item.title}"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></a>
              </div>
            </div>
          </article>
        `;
      }

      const root = document.getElementById("manuals-root");
      const countEl = document.getElementById("manuals-count");
      const filters = document.getElementById("manuals-filters");

      if (!root) return;

      root.innerHTML = manuals.map(renderManual).join("");

      function applyFilter(filter) {
        let visible = 0;

        root.querySelectorAll(".doc-card").forEach(function (card) {
          const area = card.getAttribute("data-area");
          const match = filter === "all" || area === filter;

          card.hidden = !match;
          if (match) visible += 1;
        });

        if (countEl) {
          countEl.textContent = "Exibindo " + visible + " documento" + (visible === 1 ? "" : "s");
        }
      }

      applyFilter("all");

      if (filters) {
        filters.addEventListener("click", function (event) {
          const chip = event.target.closest(".filter-chip");
          if (!chip) return;

          filters.querySelectorAll(".filter-chip").forEach(function (btn) {
            btn.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          applyFilter(chip.getAttribute("data-filter") || "all");
        });
      }

      var modal = document.getElementById("manual-pdf-modal");
      var modalTitle = document.getElementById("manual-pdf-title");
      var modalMeta = document.getElementById("manual-pdf-meta");
      var modalFrame = document.getElementById("manual-pdf-frame");
      var modalDownload = document.getElementById("manual-pdf-download");
      var modalCloseBtn = document.getElementById("manual-pdf-close");

      function ensureModal() {
        if (modal) return;

        var wrapper = document.createElement("div");
        wrapper.id = "manual-pdf-modal";
        wrapper.className = "manual-pdf-modal";
        wrapper.hidden = true;
        wrapper.innerHTML =
          '<div class="manual-pdf-modal__backdrop" data-close aria-hidden="true"></div>' +
          '<div class="manual-pdf-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="manual-pdf-title">' +
            '<header class="manual-pdf-modal__header">' +
              '<div class="manual-pdf-modal__header-text">' +
                '<h2 class="manual-pdf-modal__title" id="manual-pdf-title"></h2>' +
                '<p class="manual-pdf-modal__meta" id="manual-pdf-meta"></p>' +
              '</div>' +
              '<button type="button" class="manual-pdf-modal__close" id="manual-pdf-close" aria-label="Fechar visualizador">' +
                '<i class="fa-solid fa-xmark" aria-hidden="true"></i>' +
              '</button>' +
            '</header>' +
            '<iframe class="manual-pdf-modal__frame" id="manual-pdf-frame" title=""></iframe>' +
            '<footer class="manual-pdf-modal__footer">' +
              '<a class="manual-pdf-modal__download" id="manual-pdf-download" href="#" download>' +
                '<i class="fa-solid fa-download" aria-hidden="true"></i> Baixar PDF' +
              '</a>' +
              '<button type="button" class="manual-pdf-modal__btn-close" data-close>Fechar</button>' +
            '</footer>' +
          '</div>';

        document.body.appendChild(wrapper);
        modal = wrapper;
        modalTitle = document.getElementById("manual-pdf-title");
        modalMeta = document.getElementById("manual-pdf-meta");
        modalFrame = document.getElementById("manual-pdf-frame");
        modalDownload = document.getElementById("manual-pdf-download");
        modalCloseBtn = document.getElementById("manual-pdf-close");

        modal.addEventListener("click", function (event) {
          if (event.target.closest("[data-close]")) {
            closeManualModal();
          }
        });

        document.addEventListener("keydown", function (event) {
          if (event.key === "Escape" && modal && !modal.hidden) {
            closeManualModal();
          }
        });
      }

      function findManual(id) {
        for (var i = 0; i < manuals.length; i += 1) {
          if (manuals[i].id === id) return manuals[i];
        }
        return null;
      }

      function openManualModal(id) {
        var item = findManual(id);
        if (!item) return;

        ensureModal();

        var url = pdfUrl(id);
        modalTitle.textContent = item.title;
        modalMeta.textContent =
          (typeLabels[item.type] || item.type) + " · " +
          (areaLabels[item.area] || item.area) + " · " +
          item.version + " · Revisão " + item.date;
        modalFrame.title = item.title;
        modalFrame.src = url;
        modalDownload.href = url;
        modalDownload.setAttribute("download", item.id + ".pdf");

        modal.hidden = false;
        document.body.style.overflow = "hidden";
        modalCloseBtn.focus();
      }

      function closeManualModal() {
        if (!modal || modal.hidden) return;
        modal.hidden = true;
        modalFrame.removeAttribute("src");
        modalFrame.src = "about:blank";
        document.body.style.overflow = "";
      }

      root.addEventListener("click", function (event) {
        var viewBtn = event.target.closest(".doc-card__open[data-action='view']");
        if (!viewBtn) return;

        var card = viewBtn.closest(".doc-card");
        if (!card) return;

        var id = card.getAttribute("data-id");
        if (!id) return;

        event.preventDefault();
        openManualModal(id);
      });
    })();