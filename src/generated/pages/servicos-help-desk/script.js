(function () {
      const catLabels = {
        "incidente": "Incidente",
        "solicitacao": "Solicitação",
        "duvida": "Dúvida",
        "urgente": "Urgente"
};
      const catIcons = {
        "incidente": "fa-triangle-exclamation",
        "solicitacao": "fa-file-circle-plus",
        "duvida": "fa-circle-question",
        "urgente": "fa-bolt"
};
      const items = [
        {
                "title": "Abrir chamado",
                "desc": "Registre um novo incidente ou solicitação com prioridade, categoria e descrição detalhada.",
                "cat": "incidente",
                "provider": "Portal GLPI",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Acompanhar ticket",
                "desc": "Consulte status, histórico e mensagens dos seus chamados abertos nos últimos 90 dias.",
                "cat": "solicitacao",
                "provider": "Service Desk",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Base de conhecimento",
                "desc": "Artigos, tutoriais e soluções para problemas frequentes de hardware, software e acesso.",
                "cat": "duvida",
                "provider": "Wiki TI",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Chat ao vivo",
                "desc": "Atendimento síncrono com analista de plantão em horário comercial estendido (7h–22h).",
                "cat": "urgente",
                "provider": "Teams TI",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "E-mail suporte",
                "desc": "Canal assíncrono para demandas não urgentes. Resposta em até 1 dia útil.",
                "cat": "solicitacao",
                "provider": "ti.suporte@liotecnica.com.br",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Telefone plantão",
                "desc": "Linha exclusiva para incidentes críticos que impactam produção ou segurança.",
                "cat": "urgente",
                "provider": "Ramal 5500",
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
                <i class="fa-solid ${catIcons[item.cat] || "fa-headset"}"></i>
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
              <span><i class="fa-solid fa-server" aria-hidden="true"></i> ${item.provider}</span>
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

      const root = document.getElementById("ti-help-root");
      const countEl = document.getElementById("ti-help-count");
      const filters = document.getElementById("ti-help-filters");
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
