(function () {
      const catLabels = {
        "declaracao": "Declaração",
        "certidao": "Certidão",
        "carta": "Carta",
        "urgente": "Urgente"
};
      const catIcons = {
        "declaracao": "fa-file-lines",
        "certidao": "fa-stamp",
        "carta": "fa-envelope-open-text",
        "urgente": "fa-bolt"
};
      const items = [
        {
                "title": "Declaração de vínculo",
                "desc": "Comprovação de emprego com cargo, salário e tempo de casa para bancos e cartórios.",
                "cat": "declaracao",
                "provider": "Jurídico",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Certidão negativa trabalhista",
                "desc": "Consulta e emissão de CNDT para licitações, contratos e cadastros.",
                "cat": "certidao",
                "provider": "Jurídico",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Carta de referência",
                "desc": "Documento assinado pela empresa atestando funções e desempenho do colaborador.",
                "cat": "carta",
                "provider": "Jurídico",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Certidão simplificada da Junta",
                "desc": "Extração de dados cadastrais da empresa para processos administrativos.",
                "cat": "certidao",
                "provider": "Jurídico",
                "status": "sob_analise",
                "featured": false
        },
        {
                "title": "Declaração de renda",
                "desc": "Modelo corporativo para comprovação de rendimentos em processos internos.",
                "cat": "declaracao",
                "provider": "Jurídico",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Emissão urgente",
                "desc": "Solicitação expressa com justificativa para prazos inferiores a 48 horas.",
                "cat": "urgente",
                "provider": "Jurídico",
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

      const root = document.getElementById("jur-doc-root");
      const countEl = document.getElementById("jur-doc-count");
      const filters = document.getElementById("jur-doc-filters");
      if (!root) return;
      root.innerHTML = items.map(renderItem).join("");

      function applyFilter(filter) {
        const query = (document.getElementById("jur-doc-search")?.value || "").trim().toLowerCase();
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
          countEl.textContent = "Exibindo " + visible + " documento" + (visible === 1 ? "" : "s");
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

      const searchInput = document.getElementById("jur-doc-search");
      if (searchInput) {
        searchInput.addEventListener("input", function () {
          const active = filters ? filters.querySelector(".filter-chip.is-active") : null;
          applyFilter(active ? active.getAttribute("data-filter") || "all" : "all");
        });
      }
    })();

