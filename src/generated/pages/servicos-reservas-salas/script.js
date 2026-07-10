(function () {
      const catLabels = {
        "reuniao": "Reunião",
        "treinamento": "Treinamento",
        "auditorio": "Auditório",
        "hibrido": "Híbrido"
};
      const catIcons = {
        "reuniao": "fa-users",
        "treinamento": "fa-chalkboard-user",
        "auditorio": "fa-microphone",
        "hibrido": "fa-video"
};
      const items = [
        {
                "title": "Sala Alpha — 8 lugares",
                "desc": "Sala de reunião no 2º andar com TV 55\", videoconferência Teams e quadro branco.",
                "cat": "reuniao",
                "provider": "Matriz SP",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Sala Beta — 12 lugares",
                "desc": "Espaço amplo para workshops e reuniões de equipe com mesa em U e ar-condicionado.",
                "cat": "reuniao",
                "provider": "Matriz SP",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Auditório Principal — 80 lugares",
                "desc": "Auditório completo com palco, sistema de som, projetor e tradução simultânea.",
                "cat": "auditorio",
                "provider": "Matriz SP",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Sala Foco — 4 lugares",
                "desc": "Ambiente reservado para reuniões rápidas e calls individuais. Reserva mínima: 30 min.",
                "cat": "reuniao",
                "provider": "Matriz SP",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "War Room — 16 lugares",
                "desc": "Sala estratégica com múltiplas telas, lousa digital e conectividade dedicada.",
                "cat": "treinamento",
                "provider": "Matriz SP",
                "status": "sob_analise",
                "featured": false
        },
        {
                "title": "Sala Híbrida — 20 lugares",
                "desc": "Layout flexível com câmeras 360°, microfones de mesa e integração com Teams Rooms.",
                "cat": "hibrido",
                "provider": "Filial Campinas",
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

      const root = document.getElementById("fac-salas-root");
      const countEl = document.getElementById("fac-salas-count");
      const filters = document.getElementById("fac-salas-filters");
      if (!root) return;
      root.innerHTML = items.map(renderItem).join("");

      function applyFilter(filter) {
        const query = (document.getElementById("fac-salas-search")?.value || "").trim().toLowerCase();
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
          countEl.textContent = "Exibindo " + visible + " sala" + (visible === 1 ? "" : "s");
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

      const searchInput = document.getElementById("fac-salas-search");
      if (searchInput) {
        searchInput.addEventListener("input", function () {
          const active = filters ? filters.querySelector(".filter-chip.is-active") : null;
          applyFilter(active ? active.getAttribute("data-filter") || "all" : "all");
        });
      }
    })();

