(function () {
      const catLabels = {
        "cracha": "Crachá",
        "visitante": "Visitante",
        "terceiro": "Terceiro",
        "evento": "Evento"
};
      const catIcons = {
        "cracha": "fa-id-badge",
        "visitante": "fa-user-plus",
        "terceiro": "fa-hard-hat",
        "evento": "fa-calendar-days"
};
      const items = [
        {
                "title": "Solicitar crachá",
                "desc": "Segunda via, crachá provisório ou substituição por perda. Retirada em até 2 dias úteis.",
                "cat": "cracha",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Registrar visitante",
                "desc": "Pré-cadastro de visitantes com nome, documento, empresa, anfitrião e horário previsto.",
                "cat": "visitante",
                "provider": "Portaria",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Acesso de terceiros",
                "desc": "Prestadores de serviço e fornecedores com credenciamento e EPIs obrigatórios.",
                "cat": "terceiro",
                "provider": "Segurança",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Eventos e grupos",
                "desc": "Cadastro em lote para treinamentos, auditorias e visitas técnicas com lista de participantes.",
                "cat": "evento",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Política de visitantes",
                "desc": "Normas de conduta, áreas permitidas, acompanhamento obrigatório e registro de entrada/saída.",
                "cat": "visitante",
                "provider": "Compliance",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Crachá de estacionamento",
                "desc": "Tag de acesso ao estacionamento de visitantes. Vinculada ao cadastro do visitante.",
                "cat": "cracha",
                "provider": "Portaria",
                "status": "sob_analise",
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
                <i class="fa-solid ${catIcons[item.cat] || "fa-building"}"></i>
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
              <span><i class="fa-solid fa-building" aria-hidden="true"></i> ${item.provider}</span>
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

      const root = document.getElementById("fac-cracha-root");
      const countEl = document.getElementById("fac-cracha-count");
      const filters = document.getElementById("fac-cracha-filters");
      if (!root) return;
      root.innerHTML = items.map(renderItem).join("");

      function applyFilter(filter) {
        const query = (document.getElementById("fac-cracha-search")?.value || "").trim().toLowerCase();
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
          countEl.textContent = "Exibindo " + visible + " serviço" + (visible === 1 ? "" : "s");
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

      const searchInput = document.getElementById("fac-cracha-search");
      if (searchInput) {
        searchInput.addEventListener("input", function () {
          const active = filters ? filters.querySelector(".filter-chip.is-active") : null;
          applyFilter(active ? active.getAttribute("data-filter") || "all" : "all");
        });
      }
    })();

