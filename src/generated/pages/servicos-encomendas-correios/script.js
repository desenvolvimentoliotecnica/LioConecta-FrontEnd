(function () {
      const catLabels = {
        "recebida": "Recebida",
        "enviada": "Enviada",
        "pendente": "Pendente",
        "retirada": "Retirada"
};
      const catIcons = {
        "recebida": "fa-inbox",
        "enviada": "fa-paper-plane",
        "pendente": "fa-clock",
        "retirada": "fa-hand-holding-box"
};
      const items = [
        {
                "title": "Minhas encomendas",
                "desc": "Lista de volumes recebidos em seu nome com data, remetente e status de retirada.",
                "cat": "recebida",
                "provider": "Portaria",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Rastrear envio",
                "desc": "Consulte status de correspondências e encomendas enviadas pela empresa com código de rastreio.",
                "cat": "enviada",
                "provider": "Correios/Motoboy",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Solicitar envio",
                "desc": "Pedido de coleta ou postagem corporativa com destinatário, peso e urgência.",
                "cat": "enviada",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Notificação de chegada",
                "desc": "Alertas automáticos por e-mail quando uma encomenda é registrada na portaria.",
                "cat": "recebida",
                "provider": "Sistema Lio",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Retirada pendente",
                "desc": "Volumes aguardando retirada há mais de 3 dias. Regularize para evitar devolução ao remetente.",
                "cat": "pendente",
                "provider": "Facilities",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Malotes internos",
                "desc": "Circulação de documentos e materiais entre unidades com registro de cadeia de custódia.",
                "cat": "enviada",
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

      const root = document.getElementById("fac-correios-root");
      const countEl = document.getElementById("fac-correios-count");
      const filters = document.getElementById("fac-correios-filters");
      if (!root) return;
      root.innerHTML = items.map(renderItem).join("");

      function applyFilter(filter) {
        const query = (document.getElementById("fac-correios-search")?.value || "").trim().toLowerCase();
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
          countEl.textContent = "Exibindo " + visible + " registro" + (visible === 1 ? "" : "s");
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

      const searchInput = document.getElementById("fac-correios-search");
      if (searchInput) {
        searchInput.addEventListener("input", function () {
          const active = filters ? filters.querySelector(".filter-chip.is-active") : null;
          applyFilter(active ? active.getAttribute("data-filter") || "all" : "all");
        });
      }
    })();

