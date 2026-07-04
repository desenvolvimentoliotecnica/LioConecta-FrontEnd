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
          id: "engenharia-qualidade",
          name: "Engenharia de Qualidade",
          desc: "Padrões de QA, testes automatizados e boas práticas de entrega contínua.",
          type: "departamental",
          members: 37,
          posts: "120+ posts",
          popular: true,
          recent: false,
          access: "open"
        },
        {
          id: "data-analytics",
          name: "Data & Analytics",
          desc: "Dashboards, indicadores, BI e cultura data-driven na LioConecta.",
          type: "departamental",
          members: 29,
          posts: "86 posts",
          popular: true,
          recent: false,
          access: "approval"
        },
        {
          id: "customer-success",
          name: "Customer Success",
          desc: "Retenção, NPS, jornada do cliente e playbooks de suporte.",
          type: "departamental",
          members: 21,
          posts: "54 posts",
          popular: false,
          recent: false,
          access: "open"
        },
        {
          id: "hackathon-2026",
          name: "Hackathon 2026",
          desc: "Inscrições, squads, desafios e cronograma do hackathon interno.",
          type: "projeto",
          members: 64,
          posts: "12 posts",
          popular: true,
          recent: true,
          access: "open"
        },
        {
          id: "mentorias-lio",
          name: "Mentorias Lio",
          desc: "Programa de mentoria cruzada entre áreas e trilhas de desenvolvimento.",
          type: "comunidade",
          members: 48,
          posts: "31 posts",
          popular: false,
          recent: true,
          access: "approval"
        },
        {
          id: "fotografia-corp",
          name: "Fotografia Corporativa",
          desc: "Registros de eventos, ensaios internos e banco de imagens da marca.",
          type: "interesse",
          members: 17,
          posts: "22 posts",
          popular: false,
          recent: false,
          access: "open"
        },
        {
          id: "voluntariado-lio",
          name: "Voluntariado Lio",
          desc: "Ações sociais, campanhas de doação e projetos com ONGs parceiras.",
          type: "comunidade",
          members: 56,
          posts: "44 posts",
          popular: true,
          recent: false,
          access: "open"
        },
        {
          id: "agile-coaches",
          name: "Agile Coaches",
          desc: "Cerimônias, frameworks ágeis, facilitação e troca entre Scrum Masters.",
          type: "interesse",
          members: 26,
          posts: "67 posts",
          popular: false,
          recent: false,
          access: "approval"
        },
        {
          id: "expansao-latam",
          name: "Expansão LATAM",
          desc: "Operação internacional, localização e alinhamentos da expansão regional.",
          type: "projeto",
          members: 14,
          posts: "18 posts",
          popular: false,
          recent: true,
          access: "approval"
        },
        {
          id: "wellbeing-saude",
          name: "Wellbeing & Saúde",
          desc: "Saúde mental, ergonomia, pausas ativas e iniciativas de bem-estar.",
          type: "interesse",
          members: 39,
          posts: "9 posts",
          popular: false,
          recent: true,
          access: "open"
        },
        {
          id: "privacidade-lgpd",
          name: "Privacidade e LGPD",
          desc: "Governança de dados, políticas de privacidade e conformidade regulatória.",
          type: "departamental",
          members: 13,
          posts: "41 posts",
          popular: false,
          recent: false,
          access: "approval"
        },
        {
          id: "inovacao-aberta",
          name: "Inovação Aberta",
          desc: "Parcerias externas, POCs, labs de inovação e desafios abertos.",
          type: "projeto",
          members: 33,
          posts: "27 posts",
          popular: false,
          recent: false,
          access: "open"
        }
      ];

      function renderGroup(group) {
        const highlightClass = group.popular || group.recent ? " is-highlight" : "";
        const iconClass = group.type === "comunidade" ? "community" : group.type === "projeto" ? "project" : group.type === "interesse" ? "interest" : "dept";

        let highlightBadge = "";
        if (group.popular) {
          highlightBadge = '<span class="group-card__highlight">Popular</span>';
        } else if (group.recent) {
          highlightBadge = '<span class="group-card__highlight group-card__highlight--new">Novo</span>';
        }

        const accessLabel = group.access === "open" ? "Aberto" : "Aprovação";
        const accessClass = group.access === "open" ? " group-card__access--open" : "";
        const joinLabel = group.access === "open" ? "Participar" : "Solicitar entrada";
        const joinClass = group.access === "open" ? "group-card__join" : "group-card__join group-card__join--approval";

        return `
          <article class="group-card${highlightClass}" data-type="${group.type}" data-popular="${group.popular ? "true" : "false"}" data-recent="${group.recent ? "true" : "false"}" data-access="${group.access}">
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
              ${highlightBadge}
              <span class="group-card__access${accessClass}">${accessLabel}</span>
            </div>
            <div class="group-card__meta">
              <span><i class="fa-solid fa-user" aria-hidden="true"></i> ${group.members} membros</span>
              <span><i class="fa-regular fa-message" aria-hidden="true"></i> ${group.posts}</span>
            </div>
            <div class="group-card__footer">
              <a class="${joinClass}" href="#">${joinLabel}</a>
              <div class="group-card__actions">
                <a class="group-card__btn" href="#" aria-label="Ver detalhes de ${group.name}"><i class="fa-regular fa-eye" aria-hidden="true"></i></a>
                <a class="group-card__btn" href="#" aria-label="Salvar ${group.name}"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></a>
              </div>
            </div>
          </article>
        `;
      }

      const root = document.getElementById("explore-root");
      const countEl = document.getElementById("explore-count");
      const filters = document.getElementById("explore-filters");

      if (!root) return;

      root.innerHTML = groups.map(renderGroup).join("");

      function applyFilter(filter) {
        let visible = 0;

        root.querySelectorAll(".group-card").forEach(function (card) {
          const type = card.getAttribute("data-type");
          const popular = card.getAttribute("data-popular") === "true";
          const recent = card.getAttribute("data-recent") === "true";
          const access = card.getAttribute("data-access");
          let match = filter === "all";

          if (filter === "popular") match = popular;
          else if (filter === "recent") match = recent;
          else if (filter === "abertos") match = access === "open";
          else if (filter !== "all") match = type === filter;

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