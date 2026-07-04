(function () {
      const catLabels = {
        "etica": "Ética",
        "assédio": "Assédio",
        "fraude": "Fraude",
        "compliance": "Compliance"
};
      const catIcons = {
        "etica": "fa-scale-balanced",
        "assédio": "fa-hand",
        "fraude": "fa-mask",
        "compliance": "fa-clipboard-check"
};
      const items = [
        {
                "title": "Registrar denúncia",
                "desc": "Formulário seguro para relato de fatos com opção de anonimato total.",
                "cat": "etica",
                "provider": "Canal Externo",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Acompanhar protocolo",
                "desc": "Consulte status da sua denúncia identificada com número de protocolo.",
                "cat": "compliance",
                "provider": "Canal Externo",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Política antirretaliação",
                "desc": "Garantias de proteção a quem reporta de boa-fé irregularidades.",
                "cat": "compliance",
                "provider": "Compliance",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Assédio moral ou sexual",
                "desc": "Canal dedicado com equipe especializada e sigilo reforçado.",
                "cat": "assédio",
                "provider": "Canal Externo",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Fraude e corrupção",
                "desc": "Denúncias sobre desvios financeiros, suborno ou conflito de interesses.",
                "cat": "fraude",
                "provider": "Compliance",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Estatísticas anuais",
                "desc": "Relatório agregado de denúncias recebidas e medidas adotadas (sem identificação).",
                "cat": "compliance",
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

      const root = document.getElementById("jur-denuncia-root");
      const countEl = document.getElementById("jur-denuncia-count");
      const filters = document.getElementById("jur-denuncia-filters");
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
          countEl.textContent = "Exibindo " + visible + " recurso" + (visible === 1 ? "" : "s");
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
