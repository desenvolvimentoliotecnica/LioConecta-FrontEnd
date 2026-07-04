(function () {
      const catLabels = {
        "pendente": "Pendente",
        "icp": "ICP-Brasil",
        "simples": "Simples",
        "lote": "Em lote"
};
      const catIcons = {
        "pendente": "fa-clock",
        "icp": "fa-certificate",
        "simples": "fa-pen-nib",
        "lote": "fa-layer-group"
};
      const items = [
        {
                "title": "Assinar documento pendente",
                "desc": "Lista de envelopes aguardando sua assinatura com prazo e prioridade.",
                "cat": "pendente",
                "provider": "DocuSign Lio",
                "status": "disponivel",
                "featured": true
        },
        {
                "title": "Enviar para assinatura",
                "desc": "Crie fluxo de coleta com ordem de signatários, anexos e lembretes.",
                "cat": "simples",
                "provider": "DocuSign Lio",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Certificado ICP-Brasil",
                "desc": "Orientações para instalação e renovação de certificado digital A1.",
                "cat": "icp",
                "provider": "Jurídico + TI",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Assinatura em lote",
                "desc": "Processamento de múltiplos contratos ou termos com template padronizado.",
                "cat": "lote",
                "provider": "Jurídico",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Validar documento assinado",
                "desc": "Verifique autenticidade e integridade de PDFs assinados digitalmente.",
                "cat": "icp",
                "provider": "Jurídico",
                "status": "disponivel",
                "featured": false
        },
        {
                "title": "Política de assinatura",
                "desc": "Regras sobre quem pode assinar, limites de alçada e documentos elegíveis.",
                "cat": "simples",
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

      const root = document.getElementById("jur-assinatura-root");
      const countEl = document.getElementById("jur-assinatura-count");
      const filters = document.getElementById("jur-assinatura-filters");
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
