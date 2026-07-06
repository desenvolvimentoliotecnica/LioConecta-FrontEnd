(function () {
      const areaLabels = {
        rh: "RH",
        compliance: "Compliance",
        ti: "TI",
        financeiro: "Financeiro",
        geral: "Geral"
      };

      const policies = [
        {
          id: "codigo-conduta",
          title: "Código de Conduta e Ética",
          desc: "Princípios éticos, condutas esperadas, conflitos de interesse e canal de denúncias. Documento obrigatório para todos os colaboradores.",
          area: "compliance",
          version: "v4.2",
          date: "Jan/2026",
          format: "pdf",
          pages: 28,
          featured: true,
          updated: true
        },
        {
          id: "privacidade-lgpd",
          title: "Política de Privacidade e LGPD",
          desc: "Tratamento de dados pessoais, direitos dos titulares, bases legais e responsabilidades no ciclo de vida da informação.",
          area: "compliance",
          version: "v3.1",
          date: "Nov/2025",
          format: "pdf",
          pages: 22,
          featured: false,
          updated: false
        },
        {
          id: "seguranca-informacao",
          title: "Política de Segurança da Informação",
          desc: "Classificação de dados, controles de acesso, senhas, dispositivos móveis e resposta a incidentes de segurança.",
          area: "ti",
          version: "v5.0",
          date: "Mar/2026",
          format: "pdf",
          pages: 34,
          featured: false,
          updated: true
        },
        {
          id: "uso-recursos-ti",
          title: "Política de Uso de Recursos de TI",
          desc: "Uso aceitável de e-mail, internet, software corporativo, equipamentos e redes da organização.",
          area: "ti",
          version: "v2.4",
          date: "Ago/2025",
          format: "pdf",
          pages: 16,
          featured: false,
          updated: false
        },
        {
          id: "viagens-corporativas",
          title: "Política de Viagens Corporativas",
          desc: "Reservas, classes de passagem, hospedagem, adiantamentos e prestação de contas em deslocamentos a trabalho.",
          area: "financeiro",
          version: "v3.0",
          date: "Fev/2026",
          format: "pdf",
          pages: 18,
          featured: false,
          updated: false
        },
        {
          id: "reembolso-despesas",
          title: "Política de Reembolso de Despesas",
          desc: "Tipos de despesas elegíveis, limites, comprovantes exigidos e prazos para solicitação de reembolso.",
          area: "financeiro",
          version: "v2.8",
          date: "Out/2025",
          format: "pdf",
          pages: 12,
          featured: false,
          updated: false
        },
        {
          id: "jornada-ponto",
          title: "Política de Jornada e Registro de Ponto",
          desc: "Horários, banco de horas, horas extras, registro eletrônico e procedimentos para ajustes de marcação.",
          area: "rh",
          version: "v4.0",
          date: "Jan/2026",
          format: "pdf",
          pages: 20,
          featured: false,
          updated: true
        },
        {
          id: "beneficios",
          title: "Política de Benefícios",
          desc: "Plano de saúde, vale-refeição, auxílio home office, licenças e demais benefícios oferecidos aos colaboradores.",
          area: "rh",
          version: "v6.1",
          date: "Dez/2025",
          format: "pdf",
          pages: 24,
          featured: false,
          updated: false
        },
        {
          id: "anticorrupcao",
          title: "Política Anticorrupção",
          desc: "Práticas proibidas, brindes e hospitalidade, due diligence de terceiros e conformidade com a Lei 12.846/2013.",
          area: "compliance",
          version: "v2.2",
          date: "Jun/2025",
          format: "pdf",
          pages: 14,
          featured: false,
          updated: false
        },
        {
          id: "sst",
          title: "Política de Saúde e Segurança no Trabalho",
          desc: "Normas de SST, EPIs, ergonomia, reporte de riscos e responsabilidades em ambientes presenciais e híbridos.",
          area: "geral",
          version: "v3.3",
          date: "Set/2025",
          format: "pdf",
          pages: 19,
          featured: false,
          updated: false
        },
        {
          id: "home-office",
          title: "Política de Home Office",
          desc: "Elegibilidade, requisitos de infraestrutura, acordo individual, reembolsos e regras para trabalho remoto.",
          area: "geral",
          version: "v2.0",
          date: "Mar/2026",
          format: "pdf",
          pages: 15,
          featured: false,
          updated: true
        }
      ];

      function pdfUrl(id) {
        return "/documents/politicas-internas/" + id + ".pdf";
      }

      function renderPolicy(policy) {
        const featuredClass = policy.featured ? " is-featured" : "";
        const iconClass = policy.format === "doc" ? "doc" : "pdf";
        const iconFa = policy.format === "doc" ? "fa-file-word" : "fa-file-pdf";
        const updatedBadge = policy.updated ? '<span class="doc-card__updated">Atualizada</span>' : "";
        const url = pdfUrl(policy.id);

        return `
          <article class="doc-card${featuredClass}" data-area="${policy.area}" data-id="${policy.id}">
            <div class="doc-card__head">
              <div class="doc-card__icon doc-card__icon--${iconClass}" aria-hidden="true">
                <i class="fa-solid ${iconFa}"></i>
              </div>
              <div class="doc-card__main">
                <h2 class="doc-card__title">${policy.title}</h2>
                <p class="doc-card__desc">${policy.desc}</p>
              </div>
            </div>
            <div class="doc-card__tags">
              <span class="doc-card__area doc-card__area--${policy.area}">${areaLabels[policy.area] || policy.area}</span>
              <span class="doc-card__version">${policy.version}</span>
              ${updatedBadge}
            </div>
            <div class="doc-card__meta">
              <span><i class="fa-regular fa-calendar" aria-hidden="true"></i> Revisão ${policy.date}</span>
              <span><i class="fa-regular fa-file-lines" aria-hidden="true"></i> ${policy.pages} páginas</span>
            </div>
            <div class="doc-card__footer">
              <button type="button" class="doc-card__open" data-action="view"><i class="fa-regular fa-eye" aria-hidden="true"></i> Visualizar</button>
              <div class="doc-card__actions">
                <a class="doc-card__btn" href="${url}" download aria-label="Baixar ${policy.title}"><i class="fa-solid fa-download" aria-hidden="true"></i></a>
                <a class="doc-card__btn" href="#" aria-label="Salvar ${policy.title}"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></a>
              </div>
            </div>
          </article>
        `;
      }

      const root = document.getElementById("policies-root");
      const countEl = document.getElementById("policies-count");
      const filters = document.getElementById("policies-filters");

      if (!root) return;

      root.innerHTML = policies.map(renderPolicy).join("");

      function applyFilter(filter) {
        let visible = 0;

        root.querySelectorAll(".doc-card").forEach(function (card) {
          const area = card.getAttribute("data-area");
          const match = filter === "all" || area === filter;

          card.hidden = !match;
          if (match) visible += 1;
        });

        if (countEl) {
          countEl.textContent = "Exibindo " + visible + " política" + (visible === 1 ? "" : "s");
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

      var modal = document.getElementById("policy-pdf-modal");
      var modalTitle = document.getElementById("policy-pdf-title");
      var modalMeta = document.getElementById("policy-pdf-meta");
      var modalFrame = document.getElementById("policy-pdf-frame");
      var modalDownload = document.getElementById("policy-pdf-download");
      var modalCloseBtn = document.getElementById("policy-pdf-close");

      function ensureModal() {
        if (modal) return;

        var wrapper = document.createElement("div");
        wrapper.id = "policy-pdf-modal";
        wrapper.className = "policy-pdf-modal";
        wrapper.hidden = true;
        wrapper.innerHTML =
          '<div class="policy-pdf-modal__backdrop" data-close aria-hidden="true"></div>' +
          '<div class="policy-pdf-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="policy-pdf-title">' +
            '<header class="policy-pdf-modal__header">' +
              '<div class="policy-pdf-modal__header-text">' +
                '<h2 class="policy-pdf-modal__title" id="policy-pdf-title"></h2>' +
                '<p class="policy-pdf-modal__meta" id="policy-pdf-meta"></p>' +
              '</div>' +
              '<button type="button" class="policy-pdf-modal__close" id="policy-pdf-close" aria-label="Fechar visualizador">' +
                '<i class="fa-solid fa-xmark" aria-hidden="true"></i>' +
              '</button>' +
            '</header>' +
            '<iframe class="policy-pdf-modal__frame" id="policy-pdf-frame" title=""></iframe>' +
            '<footer class="policy-pdf-modal__footer">' +
              '<a class="policy-pdf-modal__download" id="policy-pdf-download" href="#" download>' +
                '<i class="fa-solid fa-download" aria-hidden="true"></i> Baixar PDF' +
              '</a>' +
              '<button type="button" class="policy-pdf-modal__btn-close" data-close>Fechar</button>' +
            '</footer>' +
          '</div>';

        document.body.appendChild(wrapper);
        modal = wrapper;
        modalTitle = document.getElementById("policy-pdf-title");
        modalMeta = document.getElementById("policy-pdf-meta");
        modalFrame = document.getElementById("policy-pdf-frame");
        modalDownload = document.getElementById("policy-pdf-download");
        modalCloseBtn = document.getElementById("policy-pdf-close");

        modal.addEventListener("click", function (event) {
          if (event.target.closest("[data-close]")) {
            closePolicyModal();
          }
        });

        document.addEventListener("keydown", function (event) {
          if (event.key === "Escape" && modal && !modal.hidden) {
            closePolicyModal();
          }
        });
      }

      function findPolicy(id) {
        for (var i = 0; i < policies.length; i += 1) {
          if (policies[i].id === id) return policies[i];
        }
        return null;
      }

      function openPolicyModal(id) {
        var policy = findPolicy(id);
        if (!policy) return;

        ensureModal();

        var url = pdfUrl(id);
        modalTitle.textContent = policy.title;
        modalMeta.textContent = (areaLabels[policy.area] || policy.area) + " · " + policy.version + " · Revisão " + policy.date;
        modalFrame.title = policy.title;
        modalFrame.src = url;
        modalDownload.href = url;
        modalDownload.setAttribute("download", policy.id + ".pdf");

        modal.hidden = false;
        document.body.style.overflow = "hidden";
        modalCloseBtn.focus();
      }

      function closePolicyModal() {
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
        openPolicyModal(id);
      });
    })();