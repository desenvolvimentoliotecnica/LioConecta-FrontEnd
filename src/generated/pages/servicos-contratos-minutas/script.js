(function () {
      const catLabels = {
        "prestacao": "Prestação",
        "fornecedor": "Fornecedor",
        "nda": "NDA",
        "parceria": "Parceria"
};
      const catIcons = {
        "prestacao": "fa-handshake",
        "fornecedor": "fa-truck-field",
        "nda": "fa-user-secret",
        "parceria": "fa-people-arrows"
};
      const items = [
        {
                "title": "Minutas padronizadas",
                "desc": "Biblioteca de contratos de prestação de serviços, locação e compra e venda.",
                "cat": "prestacao",
                "provider": "Jurídico",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Revisão de contrato",
                "desc": "Envie minuta de contraparte para análise de riscos e sugestões de cláusulas.",
                "cat": "fornecedor",
                "provider": "Jurídico",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "NDA / Confidencialidade",
                "desc": "Acordo de não divulgação para projetos, parceiros e prestadores.",
                "cat": "nda",
                "provider": "Jurídico",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Contrato de fornecedor",
                "desc": "Fluxo de homologação jurídica integrado ao cadastro de fornecedores.",
                "cat": "fornecedor",
                "provider": "Compras + Jurídico",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Termo de parceria",
                "desc": "Modelos para parcerias comerciais, acadêmicas e de co-desenvolvimento.",
                "cat": "parceria",
                "provider": "Jurídico",
                "status": "sob_analise",
                "featured": false
        },
        {
                "title": "Cláusulas essenciais",
                "desc": "Guia de cláusulas obrigatórias: LGPD, anticorrupção, propriedade intelectual.",
                "cat": "prestacao",
                "provider": "Compliance",
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
                <i class="fa-solid ${catIcons[item.cat] || "fa-scale-balanced"}"></i>
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
              <span><i class="fa-solid fa-scale-balanced" aria-hidden="true"></i> ${item.provider}</span>
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

      const root = document.getElementById("jur-contratos-root");
      const countEl = document.getElementById("jur-contratos-count");
      const filters = document.getElementById("jur-contratos-filters");
      if (!root) return;
      root.innerHTML = items.map(renderItem).join("");

      function applyFilter(filter) {
        const query = (document.getElementById("jur-contratos-search")?.value || "").trim().toLowerCase();
        let visible = 0;
        root.querySelectorAll(".benefit-card").forEach(function (card) {
          const catMatch = filter === "all" || card.getAttribute("data-cat") === filter;
          const title = (card.querySelector(".benefit-card__title")?.textContent || "").toLowerCase();
          const desc = (card.querySelector(".benefit-card__desc")?.textContent || "").toLowerCase();
          const textMatch = !query || title.includes(query) || desc.includes(query);
          const match = catMatch && textMatch;
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
          filters.querySelectorAll(".filter-chip").forEach(function (btn) { btn.classList.remove("is-active"); });
          chip.classList.add("is-active");
          applyFilter(chip.getAttribute("data-filter") || "all");
        });
      }

      const searchInput = document.getElementById("jur-contratos-search");
      if (searchInput) {
        searchInput.addEventListener("input", function () {
          const active = filters ? filters.querySelector(".filter-chip.is-active") : null;
          applyFilter(active ? active.getAttribute("data-filter") || "all" : "all");
        });
      }
    })();

