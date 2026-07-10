(function () {
      const catLabels = {
        "fornecedor": "Fornecedor",
        "parceiro": "Parceiro",
        "midia": "Mídia",
        "certidao": "Certidão"
};
      const catIcons = {
        "fornecedor": "fa-industry",
        "parceiro": "fa-handshake",
        "midia": "fa-newspaper",
        "certidao": "fa-stamp"
};
      const items = [
        {
                "title": "Iniciar due diligence",
                "desc": "Abra processo de análise informando CNPJ, escopo e valor estimado do contrato.",
                "cat": "fornecedor",
                "provider": "Compliance",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Consultar status",
                "desc": "Acompanhe etapas: documentação, certidões, mídia negativa e parecer final.",
                "cat": "fornecedor",
                "provider": "Compliance",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Listas restritivas",
                "desc": "Verificação em CEIS, CNEP, listas internacionais e sanções.",
                "cat": "certidao",
                "provider": "Compliance",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Análise de mídia",
                "desc": "Pesquisa de notícias negativas e reputacionais sobre o terceiro.",
                "cat": "midia",
                "provider": "Compliance",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Due diligence simplificada",
                "desc": "Fluxo reduzido para contratos de baixo risco conforme matriz de risco.",
                "cat": "parceiro",
                "provider": "Compliance",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Matriz de risco",
                "desc": "Critérios para definir profundidade da análise por tipo de contratação.",
                "cat": "fornecedor",
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

      const root = document.getElementById("jur-dd-root");
      const countEl = document.getElementById("jur-dd-count");
      const filters = document.getElementById("jur-dd-filters");
      if (!root) return;
      root.innerHTML = items.map(renderItem).join("");

      function applyFilter(filter) {
        const query = (document.getElementById("jur-dd-search")?.value || "").trim().toLowerCase();
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
          countEl.textContent = "Exibindo " + visible + " processo" + (visible === 1 ? "" : "s");
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

      const searchInput = document.getElementById("jur-dd-search");
      if (searchInput) {
        searchInput.addEventListener("input", function () {
          const active = filters ? filters.querySelector(".filter-chip.is-active") : null;
          applyFilter(active ? active.getAttribute("data-filter") || "all" : "all");
        });
      }
    })();

