(function () {
      const catLabels = {
        recebida: "Do RH",
        enviada: "Minha solicitação",
        documento: "Documento",
        acompanhamento: "Acompanhamento"
      };

      const catIcons = {
        recebida: "fa-inbox",
        enviada: "fa-paper-plane",
        documento: "fa-file-signature",
        acompanhamento: "fa-list-check"
      };

      const items = [
        { id: "pendencias", title: "Central de Pendências", desc: "Visão unificada de solicitações abertas nos dois sentidos: o que o RH enviou para você responder e o que você enviou aguardando retorno.", cat: "acompanhamento", dir: "in", dirLabel: "Mão dupla", sla: "Imediato", online: true, pending: true, featured: true, action: "Abrir" },
        { id: "assinar-termo", title: "Assinar Termo Aditivo", desc: "O RH enviou termo aditivo de contrato para leitura e assinatura eletrônica. Prazo: 5 dias úteis.", cat: "documento", dir: "in", dirLabel: "RH → Você", sla: "Até 5 dias úteis", online: true, pending: true, featured: false, action: "Responder" },
        { id: "atualizar-cadastro-rh", title: "Atualizar Dados Cadastrais", desc: "Solicitação do RH para revisar endereço, contatos de emergência e dependentes no cadastro.", cat: "recebida", dir: "in", dirLabel: "RH → Você", sla: "Até 3 dias úteis", online: true, pending: true, featured: false, action: "Responder" },
        { id: "enviar-docs-rh", title: "Enviar Documentos ao RH", desc: "O RH solicitou cópia de documentos pendentes (RG, comprovante de residência ou certidões).", cat: "documento", dir: "in", dirLabel: "RH → Você", sla: "Até 7 dias úteis", online: true, pending: false, featured: false, action: "Enviar" },
        { id: "confirmar-beneficios", title: "Confirmar Opção de Benefícios", desc: "Campanha de eleição de plano de saúde e dependentes enviada pelo RH para confirmação.", cat: "recebida", dir: "in", dirLabel: "RH → Você", sla: "Até 10 dias úteis", online: true, pending: false, featured: false, action: "Confirmar" },
        { id: "pesquisa-clima", title: "Responder Pesquisa do RH", desc: "Questionário de clima ou onboarding enviado pelo time de RH. Respostas são confidenciais.", cat: "recebida", dir: "in", dirLabel: "RH → Você", sla: "Até 15 dias", online: true, pending: false, featured: false, action: "Responder" },
        { id: "nova-solicitacao", title: "Abrir Nova Solicitação ao RH", desc: "Inicie um pedido formal ao RH: alteração cadastral, declarações, transferências ou dúvidas sobre políticas.", cat: "enviada", dir: "out", dirLabel: "Você → RH", sla: "Protocolo imediato", online: true, pending: false, featured: false, action: "Solicitar" },
        { id: "declaracao-vinculo", title: "Solicitar Declaração de Vínculo", desc: "Peça declaração de vínculo empregatício, salarial ou estágio para uso externo.", cat: "enviada", dir: "out", dirLabel: "Você → RH", sla: "Até 3 dias úteis", online: true, pending: false, featured: false, action: "Solicitar" },
        { id: "alteracao-dados", title: "Alteração de Dados Pessoais", desc: "Solicite ao RH atualização de nome, estado civil, conta bancária ou dependentes.", cat: "enviada", dir: "out", dirLabel: "Você → RH", sla: "Até 5 dias úteis", online: true, pending: true, featured: false, action: "Solicitar" },
        { id: "transferencia", title: "Solicitar Transferência Interna", desc: "Formalize interesse em mudança de área, unidade ou cidade conforme política de mobilidade.", cat: "enviada", dir: "out", dirLabel: "Você → RH", sla: "Até 10 dias úteis", online: false, pending: false, featured: false, action: "Solicitar" },
        { id: "historico", title: "Histórico de Solicitações", desc: "Linha do tempo com todos os protocolos enviados e recebidos, status, prazos e anexos trocados.", cat: "acompanhamento", dir: "in", dirLabel: "Mão dupla", sla: "Imediato", online: true, pending: false, featured: false, action: "Consultar" },
        { id: "protocolo", title: "Acompanhar por Protocolo", desc: "Consulte andamento de uma solicitação específica informando número de protocolo ou tipo de pedido.", cat: "acompanhamento", dir: "out", dirLabel: "Você → RH", sla: "Imediato", online: true, pending: false, featured: false, action: "Consultar" }
      ];

      function renderItem(item) {
        const featuredClass = item.featured ? " is-featured" : "";
        const catBadgeClass = " rhreq-card__cat--" + item.cat;
        const dirClass = item.dir === "out" ? " rhreq-card__direction--out" : " rhreq-card__direction--in";
        const onlineBadge = item.online ? '<span class="rhreq-card__badge rhreq-card__badge--online">Online</span>' : "";
        const pendingBadge = item.pending ? '<span class="rhreq-card__badge rhreq-card__badge--pending">Pendente</span>' : "";
        const openClass = item.dir === "out" && item.cat === "enviada" ? " rhreq-card__open--out" : "";
        const actionIcon = item.action === "Consultar" || item.action === "Abrir" ? "fa-regular fa-eye" : item.action === "Responder" || item.action === "Confirmar" ? "fa-solid fa-reply" : item.action === "Enviar" ? "fa-solid fa-upload" : "fa-solid fa-paper-plane";
        return `
          <article class="rhreq-card${featuredClass}" data-cat="${item.cat}">
            <div class="rhreq-card__head">
              <div class="rhreq-card__icon rhreq-card__icon--${item.cat}" aria-hidden="true">
                <i class="fa-solid ${catIcons[item.cat] || "fa-envelope"}"></i>
              </div>
              <div class="rhreq-card__main">
                <h2 class="rhreq-card__title">${item.title}</h2>
                <p class="rhreq-card__desc">${item.desc}</p>
              </div>
            </div>
            <div class="rhreq-card__tags">
              <span class="rhreq-card__direction${dirClass}"><i class="fa-solid ${item.dir === "out" ? "fa-arrow-up" : "fa-arrow-down"}" aria-hidden="true"></i> ${item.dirLabel}</span>
              <span class="rhreq-card__cat${catBadgeClass}">${catLabels[item.cat] || item.cat}</span>
              ${onlineBadge}
              ${pendingBadge}
            </div>
            <div class="rhreq-card__meta">
              <span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${item.sla}</span>
            </div>
            <div class="rhreq-card__footer">
              <a class="rhreq-card__open${openClass}" href="#"><i class="${actionIcon}" aria-hidden="true"></i> ${item.action}</a>
              <div class="rhreq-card__actions">
                <a class="rhreq-card__btn" href="#" aria-label="Ajuda ${item.title}"><i class="fa-regular fa-circle-question" aria-hidden="true"></i></a>
                <a class="rhreq-card__btn" href="#" aria-label="Salvar ${item.title}"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></a>
              </div>
            </div>
          </article>`;
      }

      const root = document.getElementById("rhreq-root");
      const countEl = document.getElementById("rhreq-count");
      const filters = document.getElementById("rhreq-filters");
      if (!root) return;
      root.innerHTML = items.map(renderItem).join("");
      function applyFilter(filter) {
        let visible = 0;
        root.querySelectorAll(".rhreq-card").forEach(function (card) {
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