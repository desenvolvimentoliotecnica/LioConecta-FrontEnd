(function () {
      const catLabels = {
        "eletrica": "Elétrica",
        "hidraulica": "Hidráulica",
        "civil": "Civil",
        "preventiva": "Preventiva"
};
      const catIcons = {
        "eletrica": "fa-bolt",
        "hidraulica": "fa-faucet-drip",
        "civil": "fa-hammer",
        "preventiva": "fa-clipboard-check"
};
      const items = [
        {
                "title": "Abrir chamado de manutenção",
                "desc": "Registre o problema com local, foto e descrição. Acompanhe status pelo portal.",
                "cat": "civil",
                "provider": "Portal Facilities",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Manutenção elétrica",
                "desc": "Tomadas, iluminação, disjuntores e quadros elétricos. Não manipule instalações por conta própria.",
                "cat": "eletrica",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Manutenção hidráulica",
                "desc": "Vazamentos, entupimentos, torneiras e vasos sanitários em áreas comuns ou estações.",
                "cat": "hidraulica",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Reparos civis",
                "desc": "Paredes, pintura, portas, fechaduras, divisórias e mobiliário fixo.",
                "cat": "civil",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Inspeção preventiva",
                "desc": "Agende vistorias periódicas de ar-condicionado, extintores e sinalização de emergência.",
                "cat": "preventiva",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Elevadores e acessos",
                "desc": "Reporte falhas em elevadores, rampas, corrimãos e portas automáticas.",
                "cat": "civil",
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

      const root = document.getElementById("fac-manutencao-root");
      const countEl = document.getElementById("fac-manutencao-count");
      const filters = document.getElementById("fac-manutencao-filters");
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
