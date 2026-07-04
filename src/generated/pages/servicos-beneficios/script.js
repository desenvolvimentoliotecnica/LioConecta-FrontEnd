(function () {
      const catLabels = {
        saude: "Saúde",
        alimentacao: "Alimentação",
        mobilidade: "Mobilidade",
        qualidade: "Qualidade de vida",
        familia: "Família"
      };

      const catIcons = {
        saude: "fa-heart-pulse",
        alimentacao: "fa-utensils",
        mobilidade: "fa-bus",
        qualidade: "fa-spa",
        familia: "fa-people-roof"
      };

      const benefits = [
        { id: "plano-saude", title: "Plano de Saúde", desc: "Cobertura médica e hospitalar com rede credenciada nacional, coparticipação e acomodação enfermaria ou apartamento conforme plano.", cat: "saude", provider: "Unimed", status: "obrigatorio", featured: true },
        { id: "plano-odonto", title: "Plano Odontológico", desc: "Consultas, limpeza, tratamentos e ortodontia com rede referenciada e cobertura para dependentes elegíveis.", cat: "saude", provider: "Odontoprev", status: "opcional", featured: false },
        { id: "vale-refeicao", title: "Vale-refeição", desc: "Crédito mensal em cartão bandeirado para refeições em restaurantes e estabelecimentos credenciados.", cat: "alimentacao", provider: "Alelo", status: "obrigatorio", featured: false },
        { id: "vale-alimentacao", title: "Vale-alimentação", desc: "Benefício complementar para compras em supermercados e mercearias, conforme política vigente.", cat: "alimentacao", provider: "Alelo", status: "obrigatorio", featured: false },
        { id: "vale-transporte", title: "Vale-transporte", desc: "Auxílio para deslocamento casa–trabalho via créditos em cartão ou reembolso conforme elegibilidade.", cat: "mobilidade", provider: "VT Corp", status: "obrigatorio", featured: false },
        { id: "seguro-vida", title: "Seguro de Vida", desc: "Proteção financeira para colaborador e dependentes, com capital segurado e assistência funeral.", cat: "familia", provider: "Porto Seguro", status: "obrigatorio", featured: false },
        { id: "wellhub", title: "Wellhub (Gympass)", desc: "Acesso a academias, estúdios e apps de bem-estar com planos flexíveis subsidiados parcialmente pela empresa.", cat: "qualidade", provider: "Wellhub", status: "flexivel", featured: false },
        { id: "home-office", title: "Auxílio Home Office", desc: "Reembolso mensal para internet e energia elétrica de colaboradores em regime remoto ou híbrido elegível.", cat: "qualidade", provider: "RH Lio", status: "flexivel", featured: false },
        { id: "previdencia", title: "Previdência Privada", desc: "Plano de previdência complementar com contratação opcional e matching parcial da contribuição pela empresa.", cat: "familia", provider: "Brasilprev", status: "opcional", featured: false },
        { id: "creche", title: "Auxílio Creche", desc: "Subsídio para filhos até 6 anos conforme comprovantes e limites definidos em política de benefícios.", cat: "familia", provider: "RH Lio", status: "opcional", featured: false },
        { id: "assistencia", title: "Programa de Assistência", desc: "Apoio psicológico, jurídico, financeiro e social 24h por telefone, app e sessões presenciais.", cat: "qualidade", provider: "Conexa Saúde", status: "obrigatorio", featured: false },
        { id: "licencas", title: "Licenças e Afastamentos", desc: "Orientações sobre licença maternidade, paternidade, gala, nojo e demais afastamentos legais previstos em CLT.", cat: "familia", provider: "RH Lio", status: "obrigatorio", featured: false }
      ];

      const statusLabels = { obrigatorio: "Obrigatório", opcional: "Opcional", flexivel: "Flexível" };

      function renderBenefit(item) {
        const featuredClass = item.featured ? " is-featured" : "";
        const statusClass = item.status === "obrigatorio" ? " benefit-card__status--obrigatorio" : item.status === "flexivel" ? " benefit-card__status--flexivel" : "";
        const catBadgeClass = item.cat !== "saude" ? " benefit-card__cat--" + item.cat : "";
        return `
          <article class="benefit-card${featuredClass}" data-cat="${item.cat}">
            <div class="benefit-card__head">
              <div class="benefit-card__icon benefit-card__icon--${item.cat}" aria-hidden="true">
                <i class="fa-solid ${catIcons[item.cat] || "fa-gift"}"></i>
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
              <a class="benefit-card__open" href="#"><i class="fa-regular fa-eye" aria-hidden="true"></i> Consultar</a>
              <div class="benefit-card__actions">
                <a class="benefit-card__btn" href="#" aria-label="Portal ${item.title}"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>
                <a class="benefit-card__btn" href="#" aria-label="Salvar ${item.title}"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></a>
              </div>
            </div>
          </article>`;
      }

      const root = document.getElementById("benefits-root");
      const countEl = document.getElementById("benefits-count");
      const filters = document.getElementById("benefits-filters");
      if (!root) return;
      root.innerHTML = benefits.map(renderBenefit).join("");
      function applyFilter(filter) {
        let visible = 0;
        root.querySelectorAll(".benefit-card").forEach(function (card) {
          const match = filter === "all" || card.getAttribute("data-cat") === filter;
          card.hidden = !match;
          if (match) visible += 1;
        });
        if (countEl) countEl.textContent = "Exibindo " + visible + " benefício" + (visible === 1 ? "" : "s");
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