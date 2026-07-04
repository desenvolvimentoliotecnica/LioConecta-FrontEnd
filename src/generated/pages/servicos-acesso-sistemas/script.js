(function () {
      const catLabels = {
        "erp": "ERP",
        "produtividade": "Produtividade",
        "rh": "RH",
        "seguranca": "Segurança"
};
      const catIcons = {
        "erp": "fa-industry",
        "produtividade": "fa-envelope",
        "rh": "fa-user-tie",
        "seguranca": "fa-shield-halved"
};
      const items = [
        {
                "title": "SAP / ERP",
                "desc": "Acesso ao módulo financeiro, compras, estoque e produção conforme perfil funcional.",
                "cat": "erp",
                "provider": "SAP S/4HANA",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Microsoft 365",
                "desc": "E-mail, Teams, SharePoint, OneDrive e pacote Office. Provisionado na admissão.",
                "cat": "produtividade",
                "provider": "Microsoft",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Active Directory",
                "desc": "Conta de rede, grupos de segurança e permissões em pastas compartilhadas.",
                "cat": "seguranca",
                "provider": "AD Liotécnica",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Power BI",
                "desc": "Dashboards e relatórios gerenciais. Requer curso de LGPD concluído.",
                "cat": "erp",
                "provider": "Microsoft",
                "status": "sob_analise",
                "featured": false
        },
        {
                "title": "Jira / Confluence",
                "desc": "Gestão de projetos e documentação técnica para squads de produto e TI.",
                "cat": "produtividade",
                "provider": "Atlassian",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Portal RH",
                "desc": "Folha, ponto, férias e benefícios. Integrado ao cadastro de colaboradores.",
                "cat": "rh",
                "provider": "RH Lio",
                "status": "disponivel",
                "featured": false
        }
];
      const statusLabels = {"disponivel": "Disponível", "sob_analise": "Sob análise", "indisponivel": "Indisponível"};

      function renderItem(item) {
        const featuredClass = item.featured ? " is-featured" : "";
        const statusClass = " benefit-card__status--" + item.status;
        const catBadgeClass = " benefit-card__cat--" + item.cat;
        return `
          <article class="benefit-card${featuredClass}" data-cat="${item.cat}">
            <div class="benefit-card__head">
              <div class="benefit-card__icon benefit-card__icon--${item.cat}" aria-hidden="true">
                <i class="fa-solid ${catIcons[item.cat] || "fa-headset"}"></i>
              </div>
              <div class="benefit-card__main">
                <h2 class="benefit-card__title">${item.title}</h2>
                <p class="benefit-card__desc">${item.desc}</p>
              </div>
            </div>
            <div class="benefit-card__tags">
              <span class="benefit-card__cat${catBadgeClass}">${catLabels[item.cat] || item.cat}</span>
              <span class="benefit-card__status${statusClass}">${statusLabels[item.status] || item.status}</span>
            </div>
            <div class="benefit-card__meta">
              <span><i class="fa-solid fa-server" aria-hidden="true"></i> ${item.provider}</span>
            </div>
            <div class="benefit-card__footer">
              <a class="benefit-card__open" href="#"><i class="fa-regular fa-eye" aria-hidden="true"></i> Acessar</a>
              <div class="benefit-card__actions">
                <a class="benefit-card__btn" href="#" aria-label="Abrir ${item.title}"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>
                <a class="benefit-card__btn" href="#" aria-label="Salvar ${item.title}"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></a>
              </div>
            </div>
          </article>`;
      }

      const root = document.getElementById("ti-sys-root");
      const countEl = document.getElementById("ti-sys-count");
      const filters = document.getElementById("ti-sys-filters");
      if (!root) return;
      root.innerHTML = items.map(renderItem).join("");

      function applyFilter(filter) {
        let visible = 0;
        root.querySelectorAll(".benefit-card").forEach(function (card) {
          const match = filter === "all" || card.getAttribute("data-cat") === filter;
          card.hidden = !match;
          if (match) visible += 1;
        });
        if (countEl) {
          countEl.textContent = "Exibindo " + visible + " sistema" + (visible === 1 ? "" : "s");
        }
      }

      applyFilter("all");
      if (filters) {
        filters.addEventListener("click", function (event) {
          const chip = event.target.closest(".filter-chip");
          if (!chip) return;
          filters.querySelectorAll(".filter-chip").forEach(function (btn) { btn.classList.remove("is-active"); });
          chip.classList.add("is-active");
          applyFilter(chip.getAttribute("data-filter") || "all");
        });
      }
    })();
