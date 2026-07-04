(function () {
      const catLabels = {
        "reciclavel": "Reciclável",
        "organico": "Orgânico",
        "perigoso": "Perigoso",
        "coleta": "Coleta"
};
      const catIcons = {
        "reciclavel": "fa-recycle",
        "organico": "fa-leaf",
        "perigoso": "fa-biohazard",
        "coleta": "fa-truck"
};
      const items = [
        {
                "title": "Coleta seletiva",
                "desc": "Pontos de descarte por andar: papel, plástico, metal, vidro e rejeito.",
                "cat": "reciclavel",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Resíduos orgânicos",
                "desc": "Composteira e lixeiras marrons para restos de alimentos no refeitório e copas.",
                "cat": "organico",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Descarte de eletrônicos",
                "desc": "Coleta de cabos, toners vazios, equipamentos obsoletos e pilhas.",
                "cat": "perigoso",
                "provider": "TI + Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Resíduos químicos",
                "desc": "Descarte de solventes, reagentes e materiais de laboratório conforme FISPQ.",
                "cat": "perigoso",
                "provider": "Segurança",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Agendar coleta especial",
                "desc": "Grandes volumes ou móveis descartados — solicite coleta com data marcada.",
                "cat": "coleta",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Campanhas de sustentabilidade",
                "desc": "Participe de mutirões de limpeza, troca de copos descartáveis e economia de energia.",
                "cat": "reciclavel",
                "provider": "ESG Lio",
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

      const root = document.getElementById("fac-residuos-root");
      const countEl = document.getElementById("fac-residuos-count");
      const filters = document.getElementById("fac-residuos-filters");
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
