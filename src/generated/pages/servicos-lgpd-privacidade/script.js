(function () {
      const catLabels = {
        "titular": "Titular",
        "politica": "Política",
        "impacto": "Impacto",
        "incidente": "Incidente"
};
      const catIcons = {
        "titular": "fa-user-lock",
        "politica": "fa-book",
        "impacto": "fa-chart-line",
        "incidente": "fa-triangle-exclamation"
};
      const items = [
        {
                "title": "Direitos do titular",
                "desc": "Solicite acesso, correção, exclusão ou portabilidade dos seus dados pessoais.",
                "cat": "titular",
                "provider": "DPO Lio",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Política de privacidade",
                "desc": "Documento vigente sobre coleta, uso, compartilhamento e retenção de dados.",
                "cat": "politica",
                "provider": "Compliance",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "RIPD / DPIA",
                "desc": "Avaliação de impacto para novos projetos que tratam dados sensíveis ou em larga escala.",
                "cat": "impacto",
                "provider": "DPO Lio",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Comunicar incidente",
                "desc": "Notifique vazamento ou acesso indevido a dados pessoais imediatamente.",
                "cat": "incidente",
                "provider": "DPO Lio",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Treinamento LGPD",
                "desc": "Curso anual obrigatório e materiais de conscientização em privacidade.",
                "cat": "politica",
                "provider": "Compliance",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Mapeamento de dados",
                "desc": "Inventário de sistemas e bases que tratam dados pessoais por área.",
                "cat": "impacto",
                "provider": "DPO Lio",
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

      const root = document.getElementById("jur-lgpd-root");
      const countEl = document.getElementById("jur-lgpd-count");
      const filters = document.getElementById("jur-lgpd-filters");
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
