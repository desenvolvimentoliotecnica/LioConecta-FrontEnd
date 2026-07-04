(function () {
      const catLabels = {
        cartao: "Cartão",
        rota: "Rota",
        solicitacao: "Solicitação",
        desconto: "Desconto",
        consulta: "Consulta"
      };

      const catIcons = {
        cartao: "fa-bus",
        rota: "fa-route",
        solicitacao: "fa-file-circle-plus",
        desconto: "fa-percent",
        consulta: "fa-circle-question"
      };

      const items = [
        { id: "saldo-vt", title: "Consultar Saldo do VT", desc: "Visualize créditos disponíveis no cartão, valor provisionado para o mês e última recarga processada pela empresa.", cat: "cartao", sla: "Imediato", online: true, featured: true, action: "Consultar" },
        { id: "recarga", title: "Solicitar Recarga", desc: "Peça recarga complementar quando houver alteração de rota, jornada ou necessidade extraordinária aprovada pelo RH.", cat: "cartao", sla: "Até 3 dias úteis", online: true, featured: false, action: "Solicitar" },
        { id: "segunda-via", title: "2ª Via do Cartão", desc: "Solicite reemissão do cartão de transporte em caso de perda, roubo ou dano. Taxas podem ser descontadas conforme política.", cat: "solicitacao", sla: "Até 5 dias úteis", online: true, featured: false, action: "Solicitar" },
        { id: "cadastrar-rota", title: "Cadastrar Rota Casa–Trabalho", desc: "Informe origem, destino, linhas utilizadas e tipo de transporte para cálculo do benefício conforme legislação.", cat: "rota", sla: "Até 5 dias úteis", online: true, featured: false, action: "Cadastrar" },
        { id: "alterar-rota", title: "Alterar Itinerário", desc: "Atualize linhas, operadoras ou endereço residencial quando houver mudança de trajeto ou emprego interno.", cat: "rota", sla: "Até 5 dias úteis", online: true, featured: false, action: "Alterar" },
        { id: "incluir-vt", title: "Solicitar Inclusão no VT", desc: "Opte pelo vale-transporte informando modal de deslocamento e autorizando desconto em folha de até 6%.", cat: "solicitacao", sla: "Até 3 dias úteis", online: true, featured: false, action: "Solicitar" },
        { id: "renunciar-vt", title: "Renunciar ao Vale-Transporte", desc: "Formalize a opção por não receber o benefício quando utilizar transporte próprio ou outro meio não elegível.", cat: "solicitacao", sla: "Até 5 dias úteis", online: false, featured: false, action: "Solicitar" },
        { id: "simular-desconto", title: "Simular Desconto em Folha", desc: "Estime o valor descontado do salário com base nas tarifas da sua rota e no teto legal de 6% da remuneração.", cat: "desconto", sla: "Imediato", online: true, featured: false, action: "Simular" },
        { id: "extrato", title: "Extrato de Utilização", desc: "Histórico de recargas, passagens estimadas e movimentações do cartão nos últimos 12 meses.", cat: "consulta", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "operadoras", title: "Operadoras e Linhas", desc: "Consulte operadoras conveniadas, tipos de transporte elegíveis e orientações para integração tarifária.", cat: "consulta", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "perda-roubo", title: "Comunicar Perda ou Roubo", desc: "Bloqueie o cartão e abra protocolo para reemissão informando data e circunstâncias do incidente.", cat: "solicitacao", sla: "Até 24 horas", online: true, featured: false, action: "Comunicar" },
        { id: "duvidas", title: "Dúvidas sobre Vale-Transporte", desc: "Orientações sobre elegibilidade, prazos de recarga, integrações e regras do benefício na empresa.", cat: "consulta", sla: "Até 2 dias úteis", online: true, featured: false, action: "Consultar" }
      ];

      function renderItem(item) {
        const featuredClass = item.featured ? " is-featured" : "";
        const catBadgeClass = item.cat !== "cartao" ? " vt-card__cat--" + item.cat : "";
        const onlineBadge = item.online ? '<span class="vt-card__badge vt-card__badge--online">Online</span>' : "";
        const viewActions = ["Consultar", "Simular"];
        const actionIcon = viewActions.indexOf(item.action) !== -1 ? "fa-regular fa-eye" : item.action === "Comunicar" ? "fa-solid fa-triangle-exclamation" : "fa-solid fa-paper-plane";
        return `
          <article class="vt-card${featuredClass}" data-cat="${item.cat}">
            <div class="vt-card__head">
              <div class="vt-card__icon vt-card__icon--${item.cat}" aria-hidden="true">
                <i class="fa-solid ${catIcons[item.cat] || "fa-bus"}"></i>
              </div>
              <div class="vt-card__main">
                <h2 class="vt-card__title">${item.title}</h2>
                <p class="vt-card__desc">${item.desc}</p>
              </div>
            </div>
            <div class="vt-card__tags">
              <span class="vt-card__cat${catBadgeClass}">${catLabels[item.cat] || item.cat}</span>
              ${onlineBadge}
            </div>
            <div class="vt-card__meta">
              <span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${item.sla}</span>
            </div>
            <div class="vt-card__footer">
              <a class="vt-card__open" href="#"><i class="${actionIcon}" aria-hidden="true"></i> ${item.action}</a>
              <div class="vt-card__actions">
                <a class="vt-card__btn" href="#" aria-label="Ajuda ${item.title}"><i class="fa-regular fa-circle-question" aria-hidden="true"></i></a>
                <a class="vt-card__btn" href="#" aria-label="Salvar ${item.title}"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></a>
              </div>
            </div>
          </article>`;
      }

      const root = document.getElementById("vt-root");
      const countEl = document.getElementById("vt-count");
      const filters = document.getElementById("vt-filters");
      if (!root) return;
      root.innerHTML = items.map(renderItem).join("");
      function applyFilter(filter) {
        let visible = 0;
        root.querySelectorAll(".vt-card").forEach(function (card) {
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