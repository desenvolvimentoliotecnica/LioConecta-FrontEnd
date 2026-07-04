(function () {
      const catLabels = {
        "cobertura": "Cobertura",
        "beneficiario": "Beneficiário",
        "sinistro": "Sinistro",
        "complementar": "Complementar"
};
      const catIcons = {
        "cobertura": "fa-shield-heart",
        "beneficiario": "fa-user-group",
        "sinistro": "fa-file-medical",
        "complementar": "fa-plus-circle"
};
      const items = [
        {
                "title": "Consultar cobertura",
                "desc": "Capital segurado, coberturas incluídas, carências e exclusões do plano corporativo.",
                "cat": "cobertura",
                "provider": "Porto Seguro",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Atualizar beneficiários",
                "desc": "Cadastre ou altere beneficiários do seguro de vida com validação de percentuais.",
                "cat": "beneficiario",
                "provider": "RH + Jurídico",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Comunicar sinistro",
                "desc": "Abertura de processo de indenização com documentação exigida pela seguradora.",
                "cat": "sinistro",
                "provider": "Porto Seguro",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Seguro complementar",
                "desc": "Contratação opcional de coberturas adicionais para titular e dependentes.",
                "cat": "complementar",
                "provider": "Porto Seguro",
                "status": "sob_analise",
                "featured": false
        },
        {
                "title": "Carteirinha digital",
                "desc": "Acesso à apólice coletiva e contatos de assistência 24h.",
                "cat": "cobertura",
                "provider": "Porto Seguro",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "FAQ do seguro",
                "desc": "Dúvidas frequentes sobre elegibilidade, portabilidade e desligamento.",
                "cat": "cobertura",
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

      const root = document.getElementById("jur-seguro-root");
      const countEl = document.getElementById("jur-seguro-count");
      const filters = document.getElementById("jur-seguro-filters");
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
