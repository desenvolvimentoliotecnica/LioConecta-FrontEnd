(function () {
      const areaLabels = {
        comunicacao: "Comunicação",
        comercial: "Comercial",
        juridico: "Jurídico",
        rh: "RH",
        marketing: "Marketing",
        ti: "TI"
      };

      const categoryLabels = {
        apresentacao: "Apresentação",
        proposta: "Proposta",
        carta: "Carta",
        memorando: "Memorando",
        relatorio: "Relatório",
        contrato: "Contrato",
        comunicado: "Comunicado",
        ata: "Ata"
      };

      const formatLabels = {
        pptx: "PowerPoint",
        doc: "Word",
        xlsx: "Excel",
        pdf: "PDF"
      };

      const formatIcons = {
        pptx: "fa-file-powerpoint",
        doc: "fa-file-word",
        xlsx: "fa-file-excel",
        pdf: "fa-file-pdf"
      };

      const templates = [
        {
          id: "apresentacao-institucional",
          title: "Apresentação Institucional Lio",
          desc: "Template padrão de slides com capa, agenda, blocos de conteúdo, gráficos e encerramento com identidade visual da marca.",
          area: "marketing",
          category: "apresentacao",
          format: "pptx",
          version: "v5.0",
          date: "Mar/2026",
          featured: true,
          official: true
        },
        {
          id: "proposta-comercial",
          title: "Modelo de Proposta Comercial",
          desc: "Documento editável com sumário executivo, escopo, investimento, cronograma e condições comerciais padronizadas.",
          area: "comercial",
          category: "proposta",
          format: "doc",
          version: "v3.4",
          date: "Fev/2026",
          featured: false,
          official: true
        },
        {
          id: "carta-oficial",
          title: "Carta Oficial em Papel Timbrado",
          desc: "Modelo de carta corporativa com cabeçalho, destinatário, corpo, fecho e assinatura no layout institucional.",
          area: "comunicacao",
          category: "carta",
          format: "doc",
          version: "v2.1",
          date: "Jan/2026",
          featured: false,
          official: true
        },
        {
          id: "memorando-interno",
          title: "Memorando Interno",
          desc: "Formato padrão para comunicações internas entre áreas, com campos de assunto, destinatários e referência.",
          area: "comunicacao",
          category: "memorando",
          format: "doc",
          version: "v1.8",
          date: "Nov/2025",
          featured: false,
          official: false
        },
        {
          id: "relatorio-mensal",
          title: "Relatório Mensal de Indicadores",
          desc: "Planilha com abas de KPIs, metas, realizado, variação e gráficos automáticos para reporte gerencial.",
          area: "comercial",
          category: "relatorio",
          format: "xlsx",
          version: "v2.5",
          date: "Mar/2026",
          featured: false,
          official: false
        },
        {
          id: "contrato-prestacao",
          title: "Contrato de Prestação de Serviços",
          desc: "Minuta padrão com cláusulas de escopo, prazo, remuneração, confidencialidade e foro, sujeita a revisão jurídica.",
          area: "juridico",
          category: "contrato",
          format: "doc",
          version: "v4.0",
          date: "Dez/2025",
          featured: false,
          official: true
        },
        {
          id: "termo-aditivo",
          title: "Termo Aditivo Contratual",
          desc: "Modelo para alterações de escopo, prazo ou valores em contratos vigentes, com referência ao instrumento original.",
          area: "juridico",
          category: "contrato",
          format: "doc",
          version: "v2.2",
          date: "Ago/2025",
          featured: false,
          official: false
        },
        {
          id: "cv-lio",
          title: "Curriculum Vitae — Padrão Lio",
          desc: "Template de CV interno para movimentações, promoções e banco de talentos, com seções de experiência e competências.",
          area: "rh",
          category: "relatorio",
          format: "doc",
          version: "v1.6",
          date: "Fev/2026",
          featured: false,
          official: false
        },
        {
          id: "one-pager-comercial",
          title: "One Pager Comercial",
          desc: "Apresentação resumida de produto ou solução em uma página, ideal para prospecção e follow-up com clientes.",
          area: "comercial",
          category: "apresentacao",
          format: "pptx",
          version: "v2.0",
          date: "Mar/2026",
          featured: false,
          official: true
        },
        {
          id: "comunicado-interno",
          title: "Comunicado Interno",
          desc: "Layout para avisos oficiais à companhia com título, corpo, responsável pela publicação e data de vigência.",
          area: "comunicacao",
          category: "comunicado",
          format: "doc",
          version: "v3.1",
          date: "Jan/2026",
          featured: false,
          official: true
        },
        {
          id: "ata-reuniao",
          title: "Ata de Reunião",
          desc: "Modelo estruturado com participantes, pauta, deliberações, ações e responsáveis para registro de reuniões.",
          area: "comunicacao",
          category: "ata",
          format: "doc",
          version: "v1.4",
          date: "Out/2025",
          featured: false,
          official: false
        },
        {
          id: "relatorio-tecnico-ti",
          title: "Relatório Técnico de Projeto TI",
          desc: "Documento para entrega de projetos de tecnologia com escopo, arquitetura, riscos, cronograma e anexos técnicos.",
          area: "ti",
          category: "relatorio",
          format: "doc",
          version: "v2.3",
          date: "Set/2025",
          featured: false,
          official: false
        },
        {
          id: "briefing-marketing",
          title: "Briefing de Campanha de Marketing",
          desc: "Template para briefing criativo com objetivos, público-alvo, mensagens-chave, canais e cronograma de produção.",
          area: "marketing",
          category: "proposta",
          format: "doc",
          version: "v1.9",
          date: "Mar/2026",
          featured: false,
          official: false
        }
      ];

      function pdfUrl(id) {
        return "/documents/modelos/" + id + ".pdf";
      }

      function renderTemplate(item) {
        const featuredClass = item.featured ? " is-featured" : "";
        const formatClass = item.format;
        const formatBadgeClass = item.format === "doc" ? " doc-card__format--doc" : item.format === "xlsx" ? " doc-card__format--xlsx" : item.format === "pptx" ? " doc-card__format--pptx" : "";
        const categoryClass = item.category === "apresentacao" ? " doc-card__category--apresentacao" : item.category === "contrato" ? " doc-card__category--contrato" : item.category === "comunicado" || item.category === "carta" || item.category === "memorando" || item.category === "ata" ? " doc-card__category--comunicacao" : "";
        const officialBadge = item.official ? '<span class="doc-card__updated">Oficial</span>' : "";
        const url = pdfUrl(item.id);

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
              <span class="doc-card__category${categoryClass}">${categoryLabels[item.category] || item.category}</span>
              <span class="doc-card__format${formatBadgeClass}">${formatLabels[item.format] || item.format}</span>
              <span class="doc-card__area doc-card__area--${item.area}">${areaLabels[item.area] || item.area}</span>
              <span class="doc-card__version">${item.version}</span>
              ${officialBadge}
            </div>
            <div class="doc-card__meta">
              <span><i class="fa-regular fa-calendar" aria-hidden="true"></i> Atualizado ${item.date}</span>
            </div>
            <div class="doc-card__footer">
              <a class="doc-card__open" href="${url}" download><i class="fa-solid fa-download" aria-hidden="true"></i> Baixar modelo</a>
              <div class="doc-card__actions">
                <button type="button" class="doc-card__btn" data-action="view" aria-label="Visualizar ${item.title}"><i class="fa-regular fa-eye" aria-hidden="true"></i></button>
                <a class="doc-card__btn" href="#" aria-label="Salvar ${item.title}"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></a>
              </div>
            </div>
          </article>
        `;
      }

      const root = document.getElementById("templates-root");
      const countEl = document.getElementById("templates-count");
      const filters = document.getElementById("templates-filters");

      if (!root) return;

      root.innerHTML = templates.map(renderTemplate).join("");

      function applyFilter(filter) {
        let visible = 0;

        root.querySelectorAll(".doc-card").forEach(function (card) {
          const area = card.getAttribute("data-area");
          const match = filter === "all" || area === filter;

          card.hidden = !match;
          if (match) visible += 1;
        });

        if (countEl) {
          countEl.textContent = "Exibindo " + visible + " modelo" + (visible === 1 ? "" : "s");
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

      var modal = document.getElementById("template-pdf-modal");
      var modalTitle = document.getElementById("template-pdf-title");
      var modalMeta = document.getElementById("template-pdf-meta");
      var modalFrame = document.getElementById("template-pdf-frame");
      var modalDownload = document.getElementById("template-pdf-download");
      var modalCloseBtn = document.getElementById("template-pdf-close");

      function ensureModal() {
        if (modal) return;

        var wrapper = document.createElement("div");
        wrapper.id = "template-pdf-modal";
        wrapper.className = "template-pdf-modal";
        wrapper.hidden = true;
        wrapper.innerHTML =
          '<div class="template-pdf-modal__backdrop" data-close aria-hidden="true"></div>' +
          '<div class="template-pdf-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="template-pdf-title">' +
            '<header class="template-pdf-modal__header">' +
              '<div class="template-pdf-modal__header-text">' +
                '<h2 class="template-pdf-modal__title" id="template-pdf-title"></h2>' +
                '<p class="template-pdf-modal__meta" id="template-pdf-meta"></p>' +
              '</div>' +
              '<button type="button" class="template-pdf-modal__close" id="template-pdf-close" aria-label="Fechar visualizador">' +
                '<i class="fa-solid fa-xmark" aria-hidden="true"></i>' +
              '</button>' +
            '</header>' +
            '<iframe class="template-pdf-modal__frame" id="template-pdf-frame" title=""></iframe>' +
            '<footer class="template-pdf-modal__footer">' +
              '<a class="template-pdf-modal__download" id="template-pdf-download" href="#" download>' +
                '<i class="fa-solid fa-download" aria-hidden="true"></i> Baixar PDF' +
              '</a>' +
              '<button type="button" class="template-pdf-modal__btn-close" data-close>Fechar</button>' +
            '</footer>' +
          '</div>';

        document.body.appendChild(wrapper);
        modal = wrapper;
        modalTitle = document.getElementById("template-pdf-title");
        modalMeta = document.getElementById("template-pdf-meta");
        modalFrame = document.getElementById("template-pdf-frame");
        modalDownload = document.getElementById("template-pdf-download");
        modalCloseBtn = document.getElementById("template-pdf-close");

        modal.addEventListener("click", function (event) {
          if (event.target.closest("[data-close]")) {
            closeTemplateModal();
          }
        });

        document.addEventListener("keydown", function (event) {
          if (event.key === "Escape" && modal && !modal.hidden) {
            closeTemplateModal();
          }
        });
      }

      function findTemplate(id) {
        for (var i = 0; i < templates.length; i += 1) {
          if (templates[i].id === id) return templates[i];
        }
        return null;
      }

      function openTemplateModal(id) {
        var item = findTemplate(id);
        if (!item) return;

        ensureModal();

        var url = pdfUrl(id);
        modalTitle.textContent = item.title;
        modalMeta.textContent =
          (categoryLabels[item.category] || item.category) + " · " +
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

      function closeTemplateModal() {
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
        openTemplateModal(id);
      });
    })();