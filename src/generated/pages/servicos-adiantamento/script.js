(function () {
      const catLabels = {
        solicitacao: "Solicitação",
        viagem: "Viagem",
        prestacao: "Prestação",
        relatorio: "Relatório",
        consulta: "Consulta"
      };

      const catIcons = {
        solicitacao: "fa-file-circle-plus",
        viagem: "fa-route",
        prestacao: "fa-file-invoice",
        relatorio: "fa-chart-line",
        consulta: "fa-circle-question"
      };

      const catStyles = {
        solicitacao: "",
        viagem: "",
        prestacao: "",
        relatorio: "",
        consulta: ""
      };

      const items = [
        { id: "solicitar", title: "Solicitar Adiantamento", desc: "Peça crédito antecipado para viagem informando destino, período, centro de custo e valor estimado de despesas.", cat: "solicitacao", sla: "Até 3 dias úteis", online: true, featured: true, action: "Solicitar" },
        { id: "simular", title: "Simular Valor de Viagem", desc: "Estime adiantamento com base em diárias, passagens e despesas previstas conforme política por destino.", cat: "consulta", sla: "Imediato", online: true, featured: false, action: "Simular" },
        { id: "roteiro", title: "Cadastrar Roteiro", desc: "Informe cidades, datas, motivo da viagem e participantes para compor o pedido de adiantamento.", cat: "viagem", sla: "Imediato", online: true, featured: false, action: "Cadastrar" },
        { id: "despesas-prev", title: "Despesas Previstas", desc: "Detalhe passagens, hospedagem, alimentação, transporte local e demais custos estimados da viagem.", cat: "viagem", sla: "Imediato", online: true, featured: false, action: "Informar" },
        { id: "prestar-contas", title: "Prestar Contas", desc: "Após a viagem, informe valores utilizados, saldo remanescente e comprovantes para encerramento do adiantamento.", cat: "prestacao", sla: "Até 5 dias úteis", online: true, featured: false, action: "Enviar" },
        { id: "comprovantes", title: "Comprovantes de Viagem", desc: "Anexe notas fiscais, boarding passes, vouchers de hotel e recibos vinculados ao adiantamento.", cat: "prestacao", sla: "Até 5 dias úteis", online: true, featured: false, action: "Anexar" },
        { id: "acompanhar", title: "Acompanhar Adiantamento", desc: "Consulte status da solicitação, liberação de crédito, prazo de prestação de contas e pendências.", cat: "consulta", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "aprovar", title: "Aprovar Adiantamentos", desc: "Gestores e financeiro validam pedidos de viagem da equipe antes da liberação de recursos.", cat: "solicitacao", sla: "Até 2 dias úteis", online: true, featured: false, action: "Aprovar" },
        { id: "politica", title: "Política de Viagens", desc: "Regras de diárias, categorias de hospedagem, antecedência mínima e documentos exigidos para viagens.", cat: "consulta", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "extrato", title: "Extrato de Adiantamentos", desc: "Histórico de viagens, valores adiantados, prestados e saldos devolvidos nos últimos 24 meses.", cat: "relatorio", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "cancelar", title: "Cancelar Solicitação", desc: "Interrompa pedido de adiantamento ainda não liberado informando motivo do cancelamento.", cat: "solicitacao", sla: "Até 24 horas", online: true, featured: false, action: "Cancelar" },
        { id: "duvidas", title: "Dúvidas sobre Viagens", desc: "Orientações sobre prazos, limites por cargo, moeda estrangeira e prestação de contas em viagens internacionais.", cat: "consulta", sla: "Até 2 dias úteis", online: true, featured: false, action: "Consultar" }
      ];

      function renderItem(item) {
        const featuredClass = item.featured ? " is-featured" : "";
        const catBadgeClass = item.cat !== "solicitacao" ? " trip-card__cat--" + item.cat : "";
        const onlineBadge = item.online ? '<span class="trip-card__badge trip-card__badge--online">Online</span>' : "";
        const viewActions = ["Consultar", "Abrir", "Simular"];
        const actionIcon = viewActions.indexOf(item.action) !== -1 ? "fa-regular fa-eye" : "fa-solid fa-paper-plane";
        const style = catStyles[item.cat] || "";
        return `
          <article class="trip-card${featuredClass}" data-cat="${item.cat}">
            <div class="trip-card__head">
              <div class="trip-card__icon trip-card__icon--${item.cat}${style ? " " + style : ""}" aria-hidden="true">
                <i class="fa-solid ${catIcons[item.cat] || "fa-file"}"></i>
              </div>
              <div class="trip-card__main">
                <h2 class="trip-card__title">${item.title}</h2>
                <p class="trip-card__desc">${item.desc}</p>
              </div>
            </div>
            <div class="trip-card__tags">
              <span class="trip-card__cat${catBadgeClass}">${catLabels[item.cat] || item.cat}</span>
              ${onlineBadge}
            </div>
            <div class="trip-card__meta">
              <span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${item.sla}</span>
            </div>
            <div class="trip-card__footer">
              <a class="trip-card__open" href="#"><i class="${actionIcon}" aria-hidden="true"></i> ${item.action}</a>
              <div class="trip-card__actions">
                <a class="trip-card__btn" href="#" aria-label="Ajuda ${item.title}"><i class="fa-regular fa-circle-question" aria-hidden="true"></i></a>
                <a class="trip-card__btn" href="#" aria-label="Salvar ${item.title}"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></a>
              </div>
            </div>
          </article>`;
      }

      const root = document.getElementById("trip-root");
      const countEl = document.getElementById("trip-count");
      const filters = document.getElementById("trip-filters");
      if (!root) return;
      root.innerHTML = items.map(renderItem).join("");
      function applyFilter(filter) {
        let visible = 0;
        root.querySelectorAll(".trip-card").forEach(function (card) {
          const match = filter === "all" || card.getAttribute("data-cat") === filter;
          card.hidden = !match;
          if (match) visible += 1;
        });
        if (countEl) countEl.textContent = "Exibindo " + visible + " serviço" + (visible === 1 ? "" : "s");
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