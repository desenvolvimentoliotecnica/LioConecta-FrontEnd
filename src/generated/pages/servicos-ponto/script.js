(function () {
      const catLabels = {
        registro: "Registro",
        consulta: "Consulta",
        ajuste: "Ajuste",
        relatorio: "Relatório",
        integracao: "Integração"
      };

      const catIcons = {
        registro: "fa-fingerprint",
        consulta: "fa-clock-rotate-left",
        ajuste: "fa-pen-to-square",
        relatorio: "fa-chart-column",
        integracao: "fa-mobile-screen-button"
      };

      const items = [
        { id: "registrar-ponto", title: "Registrar Ponto", desc: "Marque entrada, saída e intervalos pelo portal ou app mobile. A última marcação registrada hoje foi às 13:02.", cat: "registro", sla: "Imediato", online: true, featured: true, action: "Registrar" },
        { id: "espelho-ponto", title: "Espelho de Ponto", desc: "Visualize marcações do mês com totais de horas normais, extras, faltas e inconsistências pendentes.", cat: "consulta", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "historico-marcacoes", title: "Histórico de Marcações", desc: "Linha do tempo detalhada dos últimos 90 dias com origem da marcação (web, app ou relógio).", cat: "consulta", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "banco-horas", title: "Banco de Horas", desc: "Consulte saldo, créditos, débitos e projeção de compensação conforme política de jornada.", cat: "consulta", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "ajuste-ponto", title: "Solicitar Ajuste de Ponto", desc: "Corrija esquecimentos ou inconsistências informando data, horário e justificativa para aprovação do gestor.", cat: "ajuste", sla: "Até 2 dias úteis", online: true, featured: false, action: "Solicitar" },
        { id: "justificar-falta", title: "Justificar Falta no Ponto", desc: "Registre motivo de ausência não marcada no dia, com anexos quando exigido pela política interna.", cat: "ajuste", sla: "Até 24 horas", online: true, featured: false, action: "Registrar" },
        { id: "horario-trabalho", title: "Horário de Trabalho", desc: "Consulte escala, jornada contratual, tolerâncias e regras de intervalo do seu vínculo.", cat: "consulta", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "horas-extras", title: "Horas Extras", desc: "Relatório de horas extras por período, percentuais aplicáveis e status de aprovação pelo gestor.", cat: "relatorio", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "intervalo-refeicao", title: "Intervalo e Refeição", desc: "Registre início e fim de intervalo intrajornada conforme política de refeição e descanso.", cat: "registro", sla: "Imediato", online: true, featured: false, action: "Registrar" },
        { id: "marcacao-remota", title: "Marcação Remota", desc: "Ponto para trabalho remoto ou externo com validação de localização e registro de atividade.", cat: "registro", sla: "Imediato", online: true, featured: false, action: "Registrar" },
        { id: "aprovar-equipe", title: "Aprovar Pontos da Equipe", desc: "Gestores validam ajustes, justificativas e pendências de marcação dos colaboradores do time.", cat: "ajuste", sla: "Até 2 dias úteis", online: true, featured: false, action: "Aprovar" },
        { id: "app-relogio", title: "App e Relógio de Ponto", desc: "Download do app mobile, cadastro de biometria, QR Code e suporte técnico dos equipamentos.", cat: "integracao", sla: "Conforme TI", online: false, featured: false, action: "Abrir" }
      ];

      function renderItem(item) {
        const featuredClass = item.featured ? " is-featured" : "";
        const catBadgeClass = item.cat !== "registro" ? " time-card__cat--" + item.cat : "";
        const onlineBadge = item.online ? '<span class="time-card__badge time-card__badge--online">Online</span>' : "";
        const actionIcon = item.action === "Consultar" || item.action === "Abrir" ? "fa-regular fa-eye" : item.action === "Aprovar" ? "fa-solid fa-check" : "fa-solid fa-paper-plane";
        return `
          <article class="time-card${featuredClass}" data-cat="${item.cat}">
            <div class="time-card__head">
              <div class="time-card__icon time-card__icon--${item.cat}" aria-hidden="true">
                <i class="fa-solid ${catIcons[item.cat] || "fa-clock"}"></i>
              </div>
              <div class="time-card__main">
                <h2 class="time-card__title">${item.title}</h2>
                <p class="time-card__desc">${item.desc}</p>
              </div>
            </div>
            <div class="time-card__tags">
              <span class="time-card__cat${catBadgeClass}">${catLabels[item.cat] || item.cat}</span>
              ${onlineBadge}
            </div>
            <div class="time-card__meta">
              <span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${item.sla}</span>
            </div>
            <div class="time-card__footer">
              <a class="time-card__open" href="#"><i class="${actionIcon}" aria-hidden="true"></i> ${item.action}</a>
              <div class="time-card__actions">
                <a class="time-card__btn" href="#" aria-label="Ajuda ${item.title}"><i class="fa-regular fa-circle-question" aria-hidden="true"></i></a>
                <a class="time-card__btn" href="#" aria-label="Salvar ${item.title}"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></a>
              </div>
            </div>
          </article>`;
      }

      const root = document.getElementById("time-root");
      const countEl = document.getElementById("time-count");
      const filters = document.getElementById("time-filters");
      if (!root) return;
      root.innerHTML = items.map(renderItem).join("");
      function applyFilter(filter) {
        let visible = 0;
        root.querySelectorAll(".time-card").forEach(function (card) {
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