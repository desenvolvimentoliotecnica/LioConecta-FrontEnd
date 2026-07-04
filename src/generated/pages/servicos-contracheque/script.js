(function () {
      const catLabels = {
        holerite: "Holerite",
        historico: "Histórico",
        documento: "Documento",
        informe: "Informe",
        consulta: "Consulta"
      };

      const catIcons = {
        holerite: "fa-file-invoice-dollar",
        historico: "fa-clock-rotate-left",
        documento: "fa-file-lines",
        informe: "fa-receipt",
        consulta: "fa-circle-question"
      };

      const items = [
        { id: "visualizar", title: "Visualizar Contracheque", desc: "Acesse o holerite de Jun/2026 com proventos, descontos e valor líquido. Disponível após fechamento da folha de pagamento.", cat: "holerite", sla: "Imediato", online: true, featured: true, action: "Visualizar" },
        { id: "download-pdf", title: "Download em PDF", desc: "Baixe o contracheque do mês selecionado em PDF para arquivamento pessoal ou comprovação.", cat: "holerite", sla: "Imediato", online: true, featured: false, action: "Baixar" },
        { id: "historico", title: "Histórico de Holerites", desc: "Consulte contracheques dos últimos 24 meses com busca por competência e tipo de pagamento.", cat: "historico", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "comparativo", title: "Comparativo Salarial", desc: "Compare proventos, descontos e líquido entre dois meses para entender variações na remuneração.", cat: "consulta", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "demonstrativo", title: "Demonstrativo Detalhado", desc: "Visualize rubricas, bases de cálculo, horas extras, adicionais e descontos linha a linha.", cat: "holerite", sla: "Imediato", online: true, featured: false, action: "Visualizar" },
        { id: "informe-rendimentos", title: "Informe de Rendimentos", desc: "Emita o informe anual para declaração de Imposto de Renda com valores pagos e retidos.", cat: "informe", sla: "Imediato", online: true, featured: false, action: "Emitir" },
        { id: "comprovante", title: "Comprovante de Rendimentos", desc: "Documento simplificado para comprovação de renda em processos internos ou externos.", cat: "informe", sla: "Até 1 dia útil", online: true, featured: false, action: "Solicitar" },
        { id: "carta-consignacao", title: "Carta de Consignação", desc: "Consulte margem consignável e emita carta para empréstimos e convênios autorizados.", cat: "documento", sla: "Até 2 dias úteis", online: true, featured: false, action: "Emitir" },
        { id: "fgts", title: "FGTS e Encargos", desc: "Resumo de depósitos de FGTS, INSS e demais encargos vinculados ao seu contrato.", cat: "consulta", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "descontos", title: "Descontos em Folha", desc: "Detalhamento de plano de saúde, vale-transporte, empréstimos consignados e outros descontos.", cat: "consulta", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "segunda-via", title: "Solicitar 2ª Via", desc: "Peça reemissão de holerite de competências anteriores quando o documento original não estiver acessível.", cat: "documento", sla: "Até 3 dias úteis", online: false, featured: false, action: "Solicitar" },
        { id: "duvidas-rubricas", title: "Dúvidas sobre Rubricas", desc: "Orientações sobre códigos, siglas e regras de cálculo aplicadas na sua folha de pagamento.", cat: "consulta", sla: "Até 2 dias úteis", online: true, featured: false, action: "Consultar" }
      ];

      function renderItem(item) {
        const featuredClass = item.featured ? " is-featured" : "";
        const catBadgeClass = item.cat !== "holerite" ? " pay-card__cat--" + item.cat : "";
        const onlineBadge = item.online ? '<span class="pay-card__badge pay-card__badge--online">Online</span>' : "";
        const viewActions = ["Visualizar", "Consultar", "Emitir", "Abrir"];
        const downloadActions = ["Baixar"];
        let actionIcon = "fa-solid fa-paper-plane";
        if (viewActions.indexOf(item.action) !== -1) actionIcon = "fa-regular fa-eye";
        if (downloadActions.indexOf(item.action) !== -1) actionIcon = "fa-solid fa-download";
        return `
          <article class="pay-card${featuredClass}" data-cat="${item.cat}">
            <div class="pay-card__head">
              <div class="pay-card__icon pay-card__icon--${item.cat}" aria-hidden="true">
                <i class="fa-solid ${catIcons[item.cat] || "fa-file-invoice"}"></i>
              </div>
              <div class="pay-card__main">
                <h2 class="pay-card__title">${item.title}</h2>
                <p class="pay-card__desc">${item.desc}</p>
              </div>
            </div>
            <div class="pay-card__tags">
              <span class="pay-card__cat${catBadgeClass}">${catLabels[item.cat] || item.cat}</span>
              ${onlineBadge}
            </div>
            <div class="pay-card__meta">
              <span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${item.sla}</span>
            </div>
            <div class="pay-card__footer">
              <a class="pay-card__open" href="#"><i class="${actionIcon}" aria-hidden="true"></i> ${item.action}</a>
              <div class="pay-card__actions">
                <a class="pay-card__btn" href="#" aria-label="Ajuda ${item.title}"><i class="fa-regular fa-circle-question" aria-hidden="true"></i></a>
                <a class="pay-card__btn" href="#" aria-label="Salvar ${item.title}"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></a>
              </div>
            </div>
          </article>`;
      }

      const root = document.getElementById("pay-root");
      const countEl = document.getElementById("pay-count");
      const filters = document.getElementById("pay-filters");
      if (!root) return;
      root.innerHTML = items.map(renderItem).join("");
      function applyFilter(filter) {
        let visible = 0;
        root.querySelectorAll(".pay-card").forEach(function (card) {
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