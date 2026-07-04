(function () {
      const catLabels = {
        ferias: "Férias",
        licenca: "Licença",
        afastamento: "Afastamento",
        consulta: "Consulta",
        banco: "Banco de horas"
      };

      const catIcons = {
        ferias: "fa-umbrella-beach",
        licenca: "fa-baby",
        afastamento: "fa-briefcase-medical",
        consulta: "fa-clock-rotate-left",
        banco: "fa-hourglass-half"
      };

      const items = [
        { id: "solicitar-ferias", title: "Solicitar Férias", desc: "Informe período desejado, dias a usufruir e substituto. A solicitação segue para aprovação do gestor e registro no RH.", cat: "ferias", sla: "Até 3 dias úteis", online: true, featured: true, action: "Solicitar" },
        { id: "saldo-ferias", title: "Consultar Saldo de Férias", desc: "Visualize dias adquiridos, disponíveis, programados e vencidos conforme seu vínculo e período aquisitivo.", cat: "ferias", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "abono", title: "Abono Pecuniário", desc: "Converta até 10 dias de férias em pagamento conforme política vigente e acordo com o gestor.", cat: "ferias", sla: "Até 5 dias úteis", online: true, featured: false, action: "Solicitar" },
        { id: "lic-maternidade", title: "Licença Maternidade", desc: "Registro de afastamento por nascimento ou adoção, com envio de documentos e acompanhamento pelo RH.", cat: "licenca", sla: "Até 2 dias úteis", online: false, featured: false, action: "Solicitar" },
        { id: "lic-paternidade", title: "Licença Paternidade", desc: "Solicitação de licença paternidade conforme legislação e política interna de parentalidade.", cat: "licenca", sla: "Até 2 dias úteis", online: true, featured: false, action: "Solicitar" },
        { id: "lic-gala", title: "Licença Gala / Nojo", desc: "Afastamento por casamento ou falecimento de familiar, com comprovação documental quando aplicável.", cat: "licenca", sla: "Até 1 dia útil", online: true, featured: false, action: "Solicitar" },
        { id: "atestado", title: "Registrar Atestado Médico", desc: "Envie atestados para justificar ausências por motivo de saúde e alimentar o controle de ponto.", cat: "afastamento", sla: "Até 24 horas", online: true, featured: false, action: "Registrar" },
        { id: "afast-inss", title: "Afastamento INSS", desc: "Acompanhamento de afastamentos previdenciários, documentação e retorno ao trabalho.", cat: "afastamento", sla: "Conforme INSS", online: false, featured: false, action: "Consultar" },
        { id: "falta-justificada", title: "Falta Justificada", desc: "Registre ausências pontuais com motivo e anexos, sujeitas à validação do gestor.", cat: "afastamento", sla: "Até 2 dias úteis", online: true, featured: false, action: "Registrar" },
        { id: "banco-horas", title: "Banco de Horas", desc: "Consulte saldo, créditos, débitos e solicite compensação de horas extras acumuladas.", cat: "banco", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "historico", title: "Histórico de Ausências", desc: "Linha do tempo com férias gozadas, licenças, atestados e demais registros dos últimos 24 meses.", cat: "consulta", sla: "Imediato", online: true, featured: false, action: "Consultar" },
        { id: "calendario-equipe", title: "Calendário da Equipe", desc: "Visualize férias e ausências aprovadas dos colegas do seu time para facilitar o planejamento.", cat: "consulta", sla: "Imediato", online: true, featured: false, action: "Abrir" }
      ];

      function renderItem(item) {
        const featuredClass = item.featured ? " is-featured" : "";
        const catBadgeClass = item.cat !== "ferias" ? " leave-card__cat--" + item.cat : "";
        const onlineBadge = item.online ? '<span class="leave-card__badge leave-card__badge--online">Online</span>' : "";
        const actionIcon = item.action === "Consultar" || item.action === "Abrir" ? "fa-regular fa-eye" : "fa-solid fa-paper-plane";
        return `
          <article class="leave-card${featuredClass}" data-cat="${item.cat}">
            <div class="leave-card__head">
              <div class="leave-card__icon leave-card__icon--${item.cat}" aria-hidden="true">
                <i class="fa-solid ${catIcons[item.cat] || "fa-calendar"}"></i>
              </div>
              <div class="leave-card__main">
                <h2 class="leave-card__title">${item.title}</h2>
                <p class="leave-card__desc">${item.desc}</p>
              </div>
            </div>
            <div class="leave-card__tags">
              <span class="leave-card__cat${catBadgeClass}">${catLabels[item.cat] || item.cat}</span>
              ${onlineBadge}
            </div>
            <div class="leave-card__meta">
              <span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${item.sla}</span>
            </div>
            <div class="leave-card__footer">
              <a class="leave-card__open" href="#"><i class="${actionIcon}" aria-hidden="true"></i> ${item.action}</a>
              <div class="leave-card__actions">
                <a class="leave-card__btn" href="#" aria-label="Ajuda ${item.title}"><i class="fa-regular fa-circle-question" aria-hidden="true"></i></a>
                <a class="leave-card__btn" href="#" aria-label="Salvar ${item.title}"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></a>
              </div>
            </div>
          </article>`;
      }

      const root = document.getElementById("leave-root");
      const countEl = document.getElementById("leave-count");
      const filters = document.getElementById("leave-filters");
      if (!root) return;
      root.innerHTML = items.map(renderItem).join("");
      function applyFilter(filter) {
        let visible = 0;
        root.querySelectorAll(".leave-card").forEach(function (card) {
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