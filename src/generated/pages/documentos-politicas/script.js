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

      function renderPolicy(policy) {
        const featuredClass = policy.featured ? " is-featured" : "";
        const iconClass = policy.format === "doc" ? "doc" : "pdf";
        const iconFa = policy.format === "doc" ? "fa-file-word" : "fa-file-pdf";
        const updatedBadge = policy.updated ? '<span class="doc-card__updated">Atualizada</span>' : "";

        return `
          <article class="doc-card${featuredClass}" data-area="${policy.area}">
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
              <a class="doc-card__open" href="#"><i class="fa-regular fa-eye" aria-hidden="true"></i> Visualizar</a>
              <div class="doc-card__actions">
                <a class="doc-card__btn" href="#" aria-label="Baixar ${policy.title}"><i class="fa-solid fa-download" aria-hidden="true"></i></a>
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
    })();