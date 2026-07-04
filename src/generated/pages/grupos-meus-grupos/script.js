(function () {
      const typeLabels = {
        departamental: "Departamental",
        projeto: "Projeto",
        interesse: "Interesse",
        comunidade: "Comunidade"
      };

      const typeIcons = {
        departamental: "fa-building",
        projeto: "fa-diagram-project",
        interesse: "fa-heart",
        comunidade: "fa-users"
      };

      const groups = [
        {
          id: "produto-inovacao",
          name: "Produto & Inovação",
          desc: "Discussões de roadmap, discovery e entregas do time de produto.",
          type: "departamental",
          members: 24,
          activity: "Ativo hoje",
          unread: 5,
          favorite: true
        },
        {
          id: "rh-conecta",
          name: "RH Conecta",
          desc: "Comunicados de people, benefícios, vagas internas e cultura.",
          type: "departamental",
          members: 18,
          activity: "Ontem",
          unread: 2,
          favorite: true
        },
        {
          id: "projeto-nexora",
          name: "Projeto Nexora",
          desc: "Squad multidisciplinar da iniciativa Nexora — sprints e releases.",
          type: "projeto",
          members: 12,
          activity: "Ativo hoje",
          unread: 8,
          favorite: true
        },
        {
          id: "marketing-digital",
          name: "Marketing Digital",
          desc: "Campanhas, calendário editorial e performance de canais.",
          type: "departamental",
          members: 15,
          activity: "2 dias",
          unread: 0,
          favorite: false
        },
        {
          id: "ti-infra",
          name: "TI Infraestrutura",
          desc: "Operações, incidentes, deploys e monitoramento de sistemas.",
          type: "departamental",
          members: 11,
          activity: "Ativo hoje",
          unread: 3,
          favorite: false
        },
        {
          id: "clube-livro",
          name: "Clube do Livro",
          desc: "Leituras mensais, indicações e encontros de discussão.",
          type: "interesse",
          members: 32,
          activity: "Semana passada",
          unread: 0,
          favorite: false
        },
        {
          id: "running-lio",
          name: "Running Lio",
          desc: "Grupo de corrida e bem-estar — treinos e eventos esportivos.",
          type: "interesse",
          members: 28,
          activity: "Ontem",
          unread: 1,
          favorite: false
        },
        {
          id: "comercial-vendas",
          name: "Comercial Vendas",
          desc: "Pipeline, metas, playbooks e celebração de wins comerciais.",
          type: "departamental",
          members: 19,
          activity: "Ativo hoje",
          unread: 4,
          favorite: false
        },
        {
          id: "onboarding-2026",
          name: "Onboarding 2026",
          desc: "Integração de novos colaboradores admitidos neste ciclo.",
          type: "projeto",
          members: 9,
          activity: "3 dias",
          unread: 0,
          favorite: false
        },
        {
          id: "diversidade",
          name: "Diversidade & Inclusão",
          desc: "Comitê de D&I — ações, eventos e pautas de representatividade.",
          type: "comunidade",
          members: 41,
          activity: "Ontem",
          unread: 2,
          favorite: false
        },
        {
          id: "sustentabilidade",
          name: "Sustentabilidade",
          desc: "Iniciativas ESG, campanhas verdes e indicadores ambientais.",
          type: "interesse",
          members: 22,
          activity: "Semana passada",
          unread: 0,
          favorite: false
        },
        {
          id: "financeiro-gestao",
          name: "Financeiro Gestão",
          desc: "Fechamentos, budget e alinhamentos da área financeira.",
          type: "departamental",
          members: 8,
          activity: "4 dias",
          unread: 0,
          favorite: false
        }
      ];

      function renderGroup(group) {
        const favoriteClass = group.favorite ? " is-favorite" : "";
        const iconClass = group.type === "comunidade" ? "community" : group.type === "projeto" ? "project" : group.type === "interesse" ? "interest" : "dept";
        const unreadBadge = group.unread > 0
          ? `<span class="group-card__unread">${group.unread} novas</span>`
          : "";

        return `
          <article class="group-card${favoriteClass}" data-type="${group.type}" data-favorite="${group.favorite ? "true" : "false"}">
            <div class="group-card__head">
              <div class="group-card__icon group-card__icon--${iconClass}" aria-hidden="true">
                <i class="fa-solid ${typeIcons[group.type] || "fa-users"}"></i>
              </div>
              <div class="group-card__main">
                <h2 class="group-card__name">${group.name}</h2>
                <p class="group-card__desc">${group.desc}</p>
              </div>
            </div>
            <div class="group-card__tags">
              <span class="group-card__type">${typeLabels[group.type] || group.type}</span>
              ${unreadBadge}
            </div>
            <div class="group-card__meta">
              <span><i class="fa-solid fa-user" aria-hidden="true"></i> ${group.members} membros</span>
              <span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${group.activity}</span>
            </div>
            <div class="group-card__footer">
              <a class="group-card__enter" href="#">Entrar no grupo <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
              <div class="group-card__actions">
                <a class="group-card__btn" href="#" aria-label="Silenciar ${group.name}"><i class="fa-regular fa-bell" aria-hidden="true"></i></a>
                <a class="group-card__btn" href="#" aria-label="Configurações de ${group.name}"><i class="fa-solid fa-gear" aria-hidden="true"></i></a>
              </div>
            </div>
          </article>
        `;
      }

      const root = document.getElementById("groups-root");
      const countEl = document.getElementById("groups-count");
      const filters = document.getElementById("groups-filters");

      if (!root) return;

      root.innerHTML = groups.map(renderGroup).join("");

      function applyFilter(filter) {
        let visible = 0;

        root.querySelectorAll(".group-card").forEach(function (card) {
          const type = card.getAttribute("data-type");
          const favorite = card.getAttribute("data-favorite") === "true";
          let match = filter === "all";

          if (filter === "favoritos") {
            match = favorite;
          } else if (filter !== "all") {
            match = type === filter;
          }

          card.hidden = !match;
          if (match) visible += 1;
        });

        if (countEl) {
          countEl.textContent = "Exibindo " + visible + " grupo" + (visible === 1 ? "" : "s");
        }
      }

      applyFilter("all");

      if (filters) {
        filters.addEventListener("click", function (event) {
          const chip = event.target.closest(".filter-chip");
          if (!chip) return;

          filters.querySelectorAll(".filter-chip").forEach(function (btn) {
            btn.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          applyFilter(chip.getAttribute("data-filter") || "all");
        });
      }
    })();