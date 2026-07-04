(function () {
      const catLabels = {
        "almoco": "Almoço",
        "cafe": "Coffee break",
        "evento": "Evento",
        "copa": "Copa"
};
      const catIcons = {
        "almoco": "fa-bowl-food",
        "cafe": "fa-mug-hot",
        "evento": "fa-cookie-bite",
        "copa": "fa-kitchen-set"
};
      const items = [
        {
                "title": "Cardápio da semana",
                "desc": "Consulte opções de almoço, saladas, sobremesas e pratos especiais por dia.",
                "cat": "almoco",
                "provider": "Refeitório",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Reservar coffee break",
                "desc": "Solicite café, água e snacks para reuniões com até 48h de antecedência.",
                "cat": "cafe",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Alimentação para eventos",
                "desc": "Apoio de buffet ou coffee break ampliado para treinamentos e confraternizações.",
                "cat": "evento",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Reportar problema na copa",
                "desc": "Micro-ondas, geladeira, cafeteira ou falta de suprimentos — abra solicitação.",
                "cat": "copa",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Dieta restritiva",
                "desc": "Solicite opções vegetarianas, sem glúten ou sem lactose com antecedência.",
                "cat": "almoco",
                "provider": "Refeitório",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Horário estendido",
                "desc": "Refeitório em horário especial para plantões — consulte disponibilidade.",
                "cat": "almoco",
                "provider": "Facilities",
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

      const root = document.getElementById("fac-refeitorio-root");
      const countEl = document.getElementById("fac-refeitorio-count");
      const filters = document.getElementById("fac-refeitorio-filters");
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
    })();
