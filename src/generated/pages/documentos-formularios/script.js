(function () {
      const areaLabels = {
        rh: "RH",
        financeiro: "Financeiro",
        ti: "TI",
        comercial: "Comercial",
        administrativo: "Administrativo"
      };

      const formatLabels = {
        pdf: "PDF",
        doc: "Word",
        xlsx: "Excel",
        online: "Online"
      };

      const formatIcons = {
        pdf: "fa-file-pdf",
        doc: "fa-file-word",
        xlsx: "fa-file-excel",
        online: "fa-globe"
      };

      const forms = [
        {
          id: "req-ferias",
          title: "Requisição de Férias",
          desc: "Formulário oficial para solicitar férias, informar período desejado e encaminhar aprovação ao gestor e RH.",
          area: "rh",
          format: "pdf",
          version: "v3.1",
          date: "Mar/2026",
          featured: true,
          popular: true
        },
        {
          id: "solic-reembolso",
          title: "Solicitação de Reembolso",
          desc: "Planilha para lançamento de despesas corporativas, comprovantes e centro de custo para análise financeira.",
          area: "financeiro",
          format: "xlsx",
          version: "v2.6",
          date: "Jan/2026",
          featured: false,
          popular: true
        },
        {
          id: "termo-equipamento",
          title: "Termo de Responsabilidade de Equipamento",
          desc: "Registro de entrega de notebook, celular ou periféricos corporativos com responsabilidade do colaborador.",
          area: "ti",
          format: "pdf",
          version: "v1.9",
          date: "Nov/2025",
          featured: false,
          popular: false
        },
        {
          id: "conflito-interesse",
          title: "Declaração de Conflito de Interesse",
          desc: "Formulário anual de transparência sobre vínculos, participações e situações que possam gerar conflito.",
          area: "rh",
          format: "pdf",
          version: "v2.0",
          date: "Dez/2025",
          featured: false,
          popular: false
        },
        {
          id: "pedido-compra",
          title: "Pedido de Compra",
          desc: "Modelo para requisição de materiais e serviços com descrição, quantidade, fornecedor e alçada de aprovação.",
          area: "financeiro",
          format: "xlsx",
          version: "v4.2",
          date: "Fev/2026",
          featured: false,
          popular: false
        },
        {
          id: "autorizacao-viagem",
          title: "Autorização de Viagem",
          desc: "Documento para solicitar viagens a trabalho: destino, datas, motivo, estimativa de custos e aprovadores.",
          area: "financeiro",
          format: "doc",
          version: "v3.0",
          date: "Out/2025",
          featured: false,
          popular: false
        },
        {
          id: "cadastro-fornecedor",
          title: "Cadastro de Fornecedor",
          desc: "Ficha completa para inclusão de novos fornecedores no ERP com dados fiscais, bancários e contatos.",
          area: "financeiro",
          format: "pdf",
          version: "v2.3",
          date: "Ago/2025",
          featured: false,
          popular: false
        },
        {
          id: "relatorio-horas",
          title: "Relatório de Horas — Projeto",
          desc: "Planilha de apontamento de horas por cliente, projeto e atividade para times comerciais e de delivery.",
          area: "comercial",
          format: "xlsx",
          version: "v1.7",
          date: "Mar/2026",
          featured: false,
          popular: true
        },
        {
          id: "acesso-sistema",
          title: "Solicitação de Acesso a Sistema",
          desc: "Formulário para criar, alterar ou revogar permissões em sistemas corporativos e perfis de acesso.",
          area: "ti",
          format: "pdf",
          version: "v5.1",
          date: "Jan/2026",
          featured: false,
          popular: false
        },
        {
          id: "termo-epi",
          title: "Termo de Entrega de EPI",
          desc: "Registro de entrega e recebimento de equipamentos de proteção individual conforme normas de SST.",
          area: "administrativo",
          format: "pdf",
          version: "v1.4",
          date: "Set/2025",
          featured: false,
          popular: false
        },
        {
          id: "checklist-integracao",
          title: "Check-list de Integração",
          desc: "Lista de verificação para onboarding: documentos, treinamentos, acessos e entregas do primeiro dia.",
          area: "rh",
          format: "pdf",
          version: "v2.2",
          date: "Fev/2026",
          featured: false,
          popular: false
        },
        {
          id: "avaliacao-desempenho",
          title: "Avaliação de Desempenho",
          desc: "Formulário online do ciclo semestral de avaliação com metas, competências e feedback estruturado.",
          area: "rh",
          format: "online",
          version: "2026.1",
          date: "Mar/2026",
          featured: false,
          popular: true
        },
        {
          id: "reserva-sala",
          title: "Reserva de Sala de Reunião",
          desc: "Formulário online para agendar salas, informar participantes e solicitar recursos audiovisuais.",
          area: "administrativo",
          format: "online",
          version: "v1.0",
          date: "Mar/2026",
          featured: false,
          popular: false
        },
        {
          id: "solic-geral",
          title: "Solicitação Geral ao RH",
          desc: "Canal unificado para dúvidas, declarações, alterações cadastrais e demais demandas ao time de RH.",
          area: "rh",
          format: "online",
          version: "v2.0",
          date: "Jan/2026",
          featured: false,
          popular: false
        }
      ];

      function pdfUrl(id) {
        return "/documents/formularios/" + id + ".pdf";
      }

      function renderForm(item) {
        const featuredClass = item.featured ? " is-featured" : "";
        const formatClass = item.format;
        const formatBadgeClass = item.format === "doc" ? " doc-card__format--doc" : item.format === "xlsx" ? " doc-card__format--xlsx" : item.format === "online" ? " doc-card__format--online" : "";
        const popularBadge = item.popular ? '<span class="doc-card__updated">Mais usado</span>' : "";
        const isOnline = item.format === "online";
        const primaryLabel = isOnline ? "Preencher" : "Baixar";
        const primaryIcon = isOnline ? "fa-arrow-up-right-from-square" : "fa-download";
        const url = pdfUrl(item.id);
        const primaryAction = isOnline
          ? `<button type="button" class="doc-card__open" data-action="view"><i class="fa-solid ${primaryIcon}" aria-hidden="true"></i> ${primaryLabel}</button>`
          : `<a class="doc-card__open" href="${url}" download><i class="fa-solid ${primaryIcon}" aria-hidden="true"></i> ${primaryLabel}</a>`;

        return `
          <article class="doc-card${featuredClass}" data-area="${item.area}" data-id="${item.id}">
            <div class="doc-card__head">
              <div class="doc-card__icon doc-card__icon--${formatClass}" aria-hidden="true">
                <i class="fa-solid ${formatIcons[item.format] || "fa-file"}"></i>
              </div>
              <div class="doc-card__main">
                <h2 class="doc-card__title">${item.title}</h2>
                <p class="doc-card__desc">${item.desc}</p>
              </div>
            </div>
            <div class="doc-card__tags">
              <span class="doc-card__format${formatBadgeClass}">${formatLabels[item.format] || item.format}</span>
              <span class="doc-card__area doc-card__area--${item.area}">${areaLabels[item.area] || item.area}</span>
              <span class="doc-card__version">${item.version}</span>
              ${popularBadge}
            </div>
            <div class="doc-card__meta">
              <span><i class="fa-regular fa-calendar" aria-hidden="true"></i> Atualizado ${item.date}</span>
            </div>
            <div class="doc-card__footer">
              ${primaryAction}
              <div class="doc-card__actions">
                <button type="button" class="doc-card__btn" data-action="view" aria-label="Visualizar ${item.title}"><i class="fa-regular fa-eye" aria-hidden="true"></i></button>
                <a class="doc-card__btn" href="#" aria-label="Salvar ${item.title}"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></a>
              </div>
            </div>
          </article>
        `;
      }

      const root = document.getElementById("forms-root");
      const countEl = document.getElementById("forms-count");
      const filters = document.getElementById("forms-filters");

      if (!root) return;

      root.innerHTML = forms.map(renderForm).join("");

      function applyFilter(filter) {
        let visible = 0;

        root.querySelectorAll(".doc-card").forEach(function (card) {
          const area = card.getAttribute("data-area");
          const match = filter === "all" || area === filter;

          card.hidden = !match;
          if (match) visible += 1;
        });

        if (countEl) {
          countEl.textContent = "Exibindo " + visible + " formulário" + (visible === 1 ? "" : "s");
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

      var modal = document.getElementById("form-pdf-modal");
      var modalTitle = document.getElementById("form-pdf-title");
      var modalMeta = document.getElementById("form-pdf-meta");
      var modalFrame = document.getElementById("form-pdf-frame");
      var modalDownload = document.getElementById("form-pdf-download");
      var modalCloseBtn = document.getElementById("form-pdf-close");

      function ensureModal() {
        if (modal) return;

        var wrapper = document.createElement("div");
        wrapper.id = "form-pdf-modal";
        wrapper.className = "form-pdf-modal";
        wrapper.hidden = true;
        wrapper.innerHTML =
          '<div class="form-pdf-modal__backdrop" data-close aria-hidden="true"></div>' +
          '<div class="form-pdf-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="form-pdf-title">' +
            '<header class="form-pdf-modal__header">' +
              '<div class="form-pdf-modal__header-text">' +
                '<h2 class="form-pdf-modal__title" id="form-pdf-title"></h2>' +
                '<p class="form-pdf-modal__meta" id="form-pdf-meta"></p>' +
              '</div>' +
              '<button type="button" class="form-pdf-modal__close" id="form-pdf-close" aria-label="Fechar visualizador">' +
                '<i class="fa-solid fa-xmark" aria-hidden="true"></i>' +
              '</button>' +
            '</header>' +
            '<iframe class="form-pdf-modal__frame" id="form-pdf-frame" title=""></iframe>' +
            '<footer class="form-pdf-modal__footer">' +
              '<a class="form-pdf-modal__download" id="form-pdf-download" href="#" download>' +
                '<i class="fa-solid fa-download" aria-hidden="true"></i> Baixar PDF' +
              '</a>' +
              '<button type="button" class="form-pdf-modal__btn-close" data-close>Fechar</button>' +
            '</footer>' +
          '</div>';

        document.body.appendChild(wrapper);
        modal = wrapper;
        modalTitle = document.getElementById("form-pdf-title");
        modalMeta = document.getElementById("form-pdf-meta");
        modalFrame = document.getElementById("form-pdf-frame");
        modalDownload = document.getElementById("form-pdf-download");
        modalCloseBtn = document.getElementById("form-pdf-close");

        modal.addEventListener("click", function (event) {
          if (event.target.closest("[data-close]")) {
            closeFormModal();
          }
        });

        document.addEventListener("keydown", function (event) {
          if (event.key === "Escape" && modal && !modal.hidden) {
            closeFormModal();
          }
        });
      }

      function findForm(id) {
        for (var i = 0; i < forms.length; i += 1) {
          if (forms[i].id === id) return forms[i];
        }
        return null;
      }

      function openFormModal(id) {
        var item = findForm(id);
        if (!item) return;

        ensureModal();

        var url = pdfUrl(id);
        modalTitle.textContent = item.title;
        modalMeta.textContent =
          (formatLabels[item.format] || item.format) + " · " +
          (areaLabels[item.area] || item.area) + " · " +
          item.version + " · Atualizado " + item.date;
        modalFrame.title = item.title;
        modalFrame.src = url;
        modalDownload.href = url;
        modalDownload.setAttribute("download", item.id + ".pdf");

        modal.hidden = false;
        document.body.style.overflow = "hidden";
        modalCloseBtn.focus();
      }

      function closeFormModal() {
        if (!modal || modal.hidden) return;
        modal.hidden = true;
        modalFrame.removeAttribute("src");
        modalFrame.src = "about:blank";
        document.body.style.overflow = "";
      }

      root.addEventListener("click", function (event) {
        var viewBtn = event.target.closest("[data-action='view']");
        if (!viewBtn) return;

        var card = viewBtn.closest(".doc-card");
        if (!card) return;

        var id = card.getAttribute("data-id");
        if (!id) return;

        event.preventDefault();
        openFormModal(id);
      });
    })();