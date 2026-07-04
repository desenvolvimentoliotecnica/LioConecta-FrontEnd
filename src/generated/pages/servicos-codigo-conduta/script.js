(function () {
      const catLabels = {
        "etica": "Ética",
        "anticorrupcao": "Anticorrupção",
        "conflito": "Conflito",
        "treinamento": "Treinamento"
};
      const catIcons = {
        "etica": "fa-scale-balanced",
        "anticorrupcao": "fa-ban",
        "conflito": "fa-arrows-split-up-and-left",
        "treinamento": "fa-graduation-cap"
};
      const items = [
        {
                "title": "Código de conduta vigente",
                "desc": "Princípios éticos, comportamento esperado e consequências de violações.",
                "cat": "etica",
                "provider": "Compliance",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Política anticorrupção",
                "desc": "Regras sobre brindes, hospitalidade, due diligence e relação com agentes públicos.",
                "cat": "anticorrupcao",
                "provider": "Compliance",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Declaração de conflito",
                "desc": "Formulário anual de conflitos de interesse e relacionamentos relevantes.",
                "cat": "conflito",
                "provider": "Compliance",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Presentes e hospitalidade",
                "desc": "Limites e aprovações para recebimento ou oferta de brindes e eventos.",
                "cat": "anticorrupcao",
                "provider": "Compliance",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Treinamento de integridade",
                "desc": "Curso EAD sobre ética, anticorrupção e canal de denúncias.",
                "cat": "treinamento",
                "provider": "Compliance",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Certificado de leitura",
                "desc": "Comprovante de aceite do código de conduta e políticas associadas.",
                "cat": "etica",
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

      const root = document.getElementById("jur-conduta-root");
      const countEl = document.getElementById("jur-conduta-count");
      const filters = document.getElementById("jur-conduta-filters");
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
    })();
