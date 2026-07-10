(function () {
      const catLabels = {
        "impressao": "Impressão",
        "digitalizacao": "Digitalização",
        "plotagem": "Plotagem",
        "suprimento": "Suprimento"
};
      const catIcons = {
        "impressao": "fa-print",
        "digitalizacao": "fa-file-pdf",
        "plotagem": "fa-ruler-combined",
        "suprimento": "fa-box-open"
};
      const items = [
        {
                "title": "Impressão em grande volume",
                "desc": "Jobs acima de 500 páginas ou materiais para eventos. Envie arquivo e especificações.",
                "cat": "impressao",
                "provider": "Gráfica Interna",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Digitalização de documentos",
                "desc": "Conversão de papéis para PDF pesquisável. Entrega via SharePoint ou e-mail seguro.",
                "cat": "digitalizacao",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Plotagem técnica",
                "desc": "Plantas, projetos e banners em formato A0/A1. Prazo mínimo: 1 dia útil.",
                "cat": "plotagem",
                "provider": "Gráfica Interna",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Reposição de toner e papel",
                "desc": "Solicite recarga de insumos para impressoras do seu andar ou departamento.",
                "cat": "suprimento",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Impressão confidencial",
                "desc": "Liberação de documentos sensíveis com autenticação por crachá ou PIN na impressora.",
                "cat": "impressao",
                "provider": "TI + Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Encadernação e acabamento",
                "desc": "Espiral, grampeação, capa dura e plastificação para materiais de treinamento.",
                "cat": "impressao",
                "provider": "Gráfica Interna",
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

      const root = document.getElementById("fac-copiadora-root");
      const countEl = document.getElementById("fac-copiadora-count");
      const filters = document.getElementById("fac-copiadora-filters");
      if (!root) return;
      root.innerHTML = items.map(renderItem).join("");

      function applyFilter(filter) {
        const query = (document.getElementById("fac-copiadora-search")?.value || "").trim().toLowerCase();
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

      const searchInput = document.getElementById("fac-copiadora-search");
      if (searchInput) {
        searchInput.addEventListener("input", function () {
          const active = filters ? filters.querySelector(".filter-chip.is-active") : null;
          applyFilter(active ? active.getAttribute("data-filter") || "all" : "all");
        });
      }
    })();

