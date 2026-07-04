(function () {
      const catLabels = {
        "rotina": "Rotina",
        "profunda": "Profunda",
        "emergencial": "Emergencial",
        "evento": "Evento"
};
      const catIcons = {
        "rotina": "fa-calendar-check",
        "profunda": "fa-spray-can-sparkles",
        "emergencial": "fa-bolt",
        "evento": "fa-champagne-glasses"
};
      const items = [
        {
                "title": "Limpeza de estações",
                "desc": "Higienização de mesa, cadeira, teclado e lixeira da sua estação de trabalho.",
                "cat": "rotina",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Limpeza profunda de sala",
                "desc": "Sanitização completa de salas de reunião após eventos ou uso intensivo.",
                "cat": "profunda",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Desinfecção de ambientes",
                "desc": "Protocolo ampliado para áreas comuns, copas e banheiros em períodos de maior circulação.",
                "cat": "profunda",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Atendimento emergencial",
                "desc": "Derramamentos, quebras de vidro, odores ou resíduos que exigem ação imediata.",
                "cat": "emergencial",
                "provider": "Plantão Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Apoio a eventos",
                "desc": "Montagem e limpeza pós-evento em auditório, refeitório ou áreas externas.",
                "cat": "evento",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Coleta de materiais",
                "desc": "Retirada de caixas, embalagens e itens descartáveis acumulados na área.",
                "cat": "rotina",
                "provider": "Facilities",
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

      const root = document.getElementById("fac-limpeza-root");
      const countEl = document.getElementById("fac-limpeza-count");
      const filters = document.getElementById("fac-limpeza-filters");
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
