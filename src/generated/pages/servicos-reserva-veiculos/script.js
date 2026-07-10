(function () {
      const catLabels = {
        "carro": "Carro",
        "van": "Van",
        "utilitario": "Utilitário",
        "disponivel": "Disponível"
};
      const catIcons = {
        "carro": "fa-car-side",
        "van": "fa-shuttle-van",
        "utilitario": "fa-truck-pickup",
        "disponivel": "fa-circle-check"
};
      const items = [
        {
                "title": "Reservar veículo",
                "desc": "Fluxo completo de reserva com seleção de datas, destino, justificativa e aprovação do gestor.",
                "cat": "carro",
                "provider": "Portal Facilities",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Frota disponível",
                "desc": "Consulte veículos livres em tempo real: sedans, hatches e utilitários por unidade.",
                "cat": "disponivel",
                "provider": "Matriz SP",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Corolla — ABC1D23",
                "desc": "Sedan executivo para visitas externas. Ar-condicionado, GPS e seguro total.",
                "cat": "carro",
                "provider": "Matriz SP",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Spin — DEF4G56",
                "desc": "Van para 7 passageiros. Ideal para equipes em deslocamento intermunicipal.",
                "cat": "van",
                "provider": "Matriz SP",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Strada — GHI7J89",
                "desc": "Utilitário para transporte de materiais leves e amostras entre unidades.",
                "cat": "utilitario",
                "provider": "Filial Campinas",
                "status": "sob_analise",
                "featured": false
        },
        {
                "title": "Checklist de devolução",
                "desc": "Formulário de inspeção na devolução: combustível, limpeza, avarias e quilometragem.",
                "cat": "disponivel",
                "provider": "Portaria",
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

      const root = document.getElementById("fac-veiculos-root");
      const countEl = document.getElementById("fac-veiculos-count");
      const filters = document.getElementById("fac-veiculos-filters");
      if (!root) return;
      root.innerHTML = items.map(renderItem).join("");

      function applyFilter(filter) {
        const query = (document.getElementById("fac-veiculos-search")?.value || "").trim().toLowerCase();
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
          countEl.textContent = "Exibindo " + visible + " veículo" + (visible === 1 ? "" : "s");
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

      const searchInput = document.getElementById("fac-veiculos-search");
      if (searchInput) {
        searchInput.addEventListener("input", function () {
          const active = filters ? filters.querySelector(".filter-chip.is-active") : null;
          applyFilter(active ? active.getAttribute("data-filter") || "all" : "all");
        });
      }
    })();

