(function () {
      const avatars = [
        "avatar-maria-silva.png",
        "avatar-carlos-mendes.png",
        "avatar-julia-santos.png",
        "avatar-rh.png",
        "avatar-marketing.png",
        "avatar-ti.png",
        "avatar-alejandro-lopez.png",
        "avatar-nexora-news.png"
      ];

      const REF_DAY = 4;
      const REF_MONTH = 7;
      const REF_YEAR = 2026;

      const groups = [
        {
          id: "today",
          name: "Hoje — 4 de julho",
          month: 7,
          people: [
            { name: "Carlos Mendes", role: "Gerente de Produto", dept: "Produto", deptId: "produto", day: 4, month: 7, label: "4 de julho" },
            { name: "Fernanda Lopes", role: "Analista de Comunicação", dept: "Marketing", deptId: "marketing", day: 4, month: 7, label: "4 de julho" }
          ]
        },
        {
          id: "week",
          name: "Esta semana — 1 a 6 de julho",
          month: 7,
          people: [
            { name: "Helena Prado", role: "Coordenadora de RH", dept: "Recursos Humanos", deptId: "rh", day: 1, month: 7, label: "1 de julho" },
            { name: "Igor Martins", role: "Tech Lead", dept: "TI", deptId: "ti", day: 2, month: 7, label: "2 de julho" },
            { name: "João Pereira", role: "Executivo Comercial", dept: "Comercial", deptId: "comercial", day: 6, month: 7, label: "6 de julho" }
          ]
        },
        {
          id: "jul-rest",
          name: "Restante de julho 2026",
          month: 7,
          people: [
            { name: "Luciana Dias", role: "Product Owner", dept: "Produto", deptId: "produto", day: 9, month: 7, label: "9 de julho" },
            { name: "Marcos Vieira", role: "Analista Financeiro", dept: "Financeiro", deptId: "financeiro", day: 12, month: 7, label: "12 de julho" },
            { name: "Natália Rocha", role: "Designer UX", dept: "Produto", deptId: "produto", day: 15, month: 7, label: "15 de julho" },
            { name: "Otávio Ribeiro", role: "Analista de Produto", dept: "Produto", deptId: "produto", day: 18, month: 7, label: "18 de julho" },
            { name: "Patrícia Nunes", role: "Analista de RH", dept: "Recursos Humanos", deptId: "rh", day: 21, month: 7, label: "21 de julho" },
            { name: "Rafael Costa", role: "Desenvolvedor Backend", dept: "TI", deptId: "ti", day: 24, month: 7, label: "24 de julho" },
            { name: "Simone Alves", role: "Analista de Marketing", dept: "Marketing", deptId: "marketing", day: 27, month: 7, label: "27 de julho" },
            { name: "Tiago Nunes", role: "Desenvolvedor Frontend", dept: "TI", deptId: "ti", day: 30, month: 7, label: "30 de julho" }
          ]
        },
        {
          id: "ago-2026",
          name: "Agosto 2026",
          month: 8,
          people: [
            { name: "Una Ferreira", role: "Executiva Comercial", dept: "Comercial", deptId: "comercial", day: 3, month: 8, label: "3 de agosto" },
            { name: "Vicente Lima", role: "Analista Financeiro", dept: "Financeiro", deptId: "financeiro", day: 8, month: 8, label: "8 de agosto" },
            { name: "William Souza", role: "DevOps Engineer", dept: "TI", deptId: "ti", day: 14, month: 8, label: "14 de agosto" }
          ]
        }
      ];

      let avatarIndex = 0;

      function nextAvatar() {
        const avatar = avatars[avatarIndex % avatars.length];
        avatarIndex += 1;
        return avatar;
      }

      function isToday(person) {
        return person.day === REF_DAY && person.month === REF_MONTH;
      }

      function renderPerson(person) {
        const avatar = nextAvatar();
        const todayClass = isToday(person) ? " is-today" : "";
        const todayBadge = isToday(person)
          ? '<span class="person-card__today-badge">Hoje</span>'
          : "";

        return `
          <article class="person-card${todayClass}" data-dept="${person.deptId}" data-day="${person.day}" data-month="${person.month}">
            <img class="person-card__avatar" src="${avatar}" alt="" />
            <h2 class="person-card__name">${person.name}</h2>
            <p class="person-card__role">${person.role}</p>
            <span class="person-card__dept">${person.dept}</span>
            <p class="person-card__birthday">${person.label}${todayBadge}</p>
            <div class="person-card__actions">
              <a class="person-card__btn" href="#" aria-label="Parabenizar ${person.name}"><i class="fa-solid fa-gift" aria-hidden="true"></i></a>
              <a class="person-card__btn" href="#" aria-label="Enviar mensagem para ${person.name}"><i class="fa-regular fa-comment" aria-hidden="true"></i></a>
              <a class="person-card__btn" href="#" aria-label="Ver perfil de ${person.name}"><i class="fa-regular fa-user" aria-hidden="true"></i></a>
            </div>
          </article>
        `;
      }

      function renderGroup(group) {
        const cards = group.people.map(renderPerson).join("");
        return `
          <section class="dept-group" data-group="${group.id}" data-month="${group.month}" aria-label="${group.name}">
            <div class="dept-group__header">
              <h2 class="dept-group__title">${group.name}</h2>
              <span class="dept-group__count">${group.people.length} aniversariantes</span>
            </div>
            <div class="directory-grid">
              ${cards}
            </div>
          </section>
        `;
      }

      const root = document.getElementById("birthday-root");
      const countEl = document.getElementById("birthday-count");
      const filters = document.getElementById("birthday-filters");
      let activeFilter = "all";

      if (!root) return;

      root.innerHTML = groups.map(renderGroup).join("");

      function updateCount(visibleTotal, groupCount) {
        if (!countEl) return;
        if (activeFilter === "all") {
          countEl.textContent = "Exibindo " + visibleTotal + " aniversariantes em " + groupCount + " períodos";
        } else {
          countEl.textContent = "Exibindo " + visibleTotal + " aniversariantes";
        }
      }

      function cardMatchesFilter(card, filter, groupId) {
        const day = Number(card.getAttribute("data-day"));
        const month = Number(card.getAttribute("data-month"));

        if (filter === "all") return true;
        if (filter === "today") {
          return day === REF_DAY && month === REF_MONTH;
        }
        if (filter === "week") {
          return month === REF_MONTH && day >= 1 && day <= 6;
        }
        if (filter === "jul-2026") {
          return month === 7;
        }
        if (filter === "ago-2026") {
          return month === 8;
        }
        return filter === groupId;
      }

      function applyFilter(filter) {
        activeFilter = filter;
        let visibleTotal = 0;
        let groupCount = 0;

        root.querySelectorAll(".dept-group").forEach(function (group) {
          const groupId = group.getAttribute("data-group");
          let visibleInGroup = 0;

          group.querySelectorAll(".person-card").forEach(function (card) {
            const match = cardMatchesFilter(card, filter, groupId);
            card.hidden = !match;
            if (match) visibleInGroup += 1;
          });

          group.hidden = visibleInGroup === 0;
          if (visibleInGroup > 0) {
            groupCount += 1;
            visibleTotal += visibleInGroup;
            const countLabel = group.querySelector(".dept-group__count");
            if (countLabel) {
              countLabel.textContent = visibleInGroup + " aniversariantes";
            }
          }
        });

        updateCount(visibleTotal, groupCount);
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