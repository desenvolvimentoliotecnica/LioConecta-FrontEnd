(function () {
      const catLabels = {
        solicitacao: "Solicitação",
        despesa: "Despesa",
        aprovacao: "Aprovação",
        relatorio: "Relatório",
        consulta: "Consulta"
      };

      const catIcons = {
        solicitacao: "fa-file-circle-plus",
        despesa: "fa-wallet",
        aprovacao: "fa-check-double",
        relatorio: "fa-chart-line",
        consulta: "fa-circle-question"
      };

      const catStyles = {
        solicitacao: "",
        despesa: "",
        aprovacao: "",
        relatorio: "",
        consulta: ""
      };

      const items = [
        { id: "nova", title: "Nova Solicitação de Reembolso", desc: "Abra um pedido informando data, valor, categoria da despesa e anexe notas fiscais ou recibos para análise do financeiro.", cat: "solicitacao", sla: "Protocolo imediato", online: true, featured: true, action: "Solicitar" },
        { id: "alimentacao", title: "Despesas de Alimentação", desc: "Reembolso de refeições em viagens ou eventos externos conforme limites diários da política de despesas.", cat: "despesa", sla: "Até 5 dias úteis", online: true, featured: false, action: "Solicitar" },
        { id: "transporte", title: "Transporte e Táxi", desc: "Deslocamentos a trabalho com taxi, app ou transporte por aplicativo, com comprovante e justificativa.", cat: "despesa", sla: "Até 5 dias úteis", online: true, featured: false, action: "Solicitar" },
        { id: "hospedagem", title: "Hospedagem", desc: "Estadias em viagens corporativas dentro do teto por cidade e categoria aprovada pela empresa.", cat: "despesa", sla: "Até 7 dias úteis", online: true, featured: false, action: "Solicitar" },
        { id: "material", title: "Material e Escritório", desc: "Compras pontuais de insumos ou materiais para uso profissional com aprovação prévia quando exigido.", cat: "despesa", sla: "Até 5 dias úteis", online: true, featured: false, action: "Solicitar" },
        { id: "comprovantes", title: "Anexar Comprovantes", desc: "Inclua ou substitua notas fiscais, cupons e recibos em solicitações já abertas aguardando documentação.", cat: "solicitacao", sla: "Até 24 horas", online: true, featured: false, action: "Anexar" },
        { id: "status", title: "Acompanhar Status", desc: "Consulte em qual etapa está cada pedido: análise, aprovação gerencial, financeiro ou pagamento.", cat: "aprovacao", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "aprovar-equipe", title: "Aprovar Reembolsos da Equipe", desc: "Gestores validam despesas dos colaboradores do time antes do encaminhamento ao financeiro.", cat: "aprovacao", sla: "Até 2 dias úteis", online: true, featured: false, action: "Aprovar" },
        { id: "politica", title: "Política de Reembolso", desc: "Limites por categoria, prazos para solicitação, documentos aceitos e regras de aprovação vigentes.", cat: "consulta", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "extrato", title: "Extrato de Reembolsos", desc: "Histórico de valores solicitados, aprovados e pagos nos últimos 24 meses com exportação.", cat: "relatorio", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "prestacao", title: "Prestação de Contas", desc: "Finalize viagens ou projetos informando saldo utilizado e devolução de valores não usados.", cat: "solicitacao", sla: "Até 3 dias úteis", online: true, featured: false, action: "Enviar" },
        { id: "duvidas", title: "Dúvidas Financeiras", desc: "Orientações sobre categorias elegíveis, prazos de pagamento e documentação exigida pelo financeiro.", cat: "consulta", sla: "Até 2 dias úteis", online: true, featured: false, action: "Consultar" }
      ];

      function renderItem(item) {
        const featuredClass = item.featured ? " is-featured" : "";
        const catBadgeClass = item.cat !== "solicitacao" ? " reimb-card__cat--" + item.cat : "";
        const onlineBadge = item.online ? '<span class="reimb-card__badge reimb-card__badge--online">Online</span>' : "";
        const viewActions = ["Consultar", "Abrir", "Simular"];
        const actionIcon = viewActions.indexOf(item.action) !== -1 ? "fa-regular fa-eye" : "fa-solid fa-paper-plane";
        const style = catStyles[item.cat] || "";
        return `
          <article class="reimb-card${featuredClass}" data-cat="${item.cat}">
            <div class="reimb-card__head">
              <div class="reimb-card__icon reimb-card__icon--${item.cat}${style ? " " + style : ""}" aria-hidden="true">
                <i class="fa-solid ${catIcons[item.cat] || "fa-file"}"></i>
              </div>
              <div class="reimb-card__main">
                <h2 class="reimb-card__title">${item.title}</h2>
                <p class="reimb-card__desc">${item.desc}</p>
              </div>
            </div>
            <div class="reimb-card__tags">
              <span class="reimb-card__cat${catBadgeClass}">${catLabels[item.cat] || item.cat}</span>
              ${onlineBadge}
            </div>
            <div class="reimb-card__meta">
              <span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${item.sla}</span>
            </div>
            <div class="reimb-card__footer">
              <a class="reimb-card__open" href="#"><i class="${actionIcon}" aria-hidden="true"></i> ${item.action}</a>
              <div class="reimb-card__actions">
                <a class="reimb-card__btn" href="#" aria-label="Ajuda ${item.title}"><i class="fa-regular fa-circle-question" aria-hidden="true"></i></a>
                <a class="reimb-card__btn" href="#" aria-label="Salvar ${item.title}"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></a>
              </div>
            </div>
          </article>`;
      }

      const root = document.getElementById("reimb-root");
      const countEl = document.getElementById("reimb-count");
      const filters = document.getElementById("reimb-filters");
      if (!root) return;
      root.innerHTML = items.map(renderItem).join("");
      function applyFilter(filter) {
        let visible = 0;
        root.querySelectorAll(".reimb-card").forEach(function (card) {
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