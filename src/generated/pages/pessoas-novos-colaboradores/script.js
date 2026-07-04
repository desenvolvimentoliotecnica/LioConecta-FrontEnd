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

      const cohorts = [
        {
          id: "jul-2026",
          name: "Julho 2026",
          people: [
            { name: "Otávio Ribeiro", role: "Analista de Produto", dept: "Produto", deptId: "produto", start: "01 jul 2026" },
            { name: "Paula Mendes", role: "Designer UI", dept: "Produto", deptId: "produto", start: "03 jul 2026" },
            { name: "Rafael Costa", role: "Analista de RH", dept: "Recursos Humanos", deptId: "rh", start: "07 jul 2026" },
            { name: "Simone Alves", role: "Analista de Marketing", dept: "Marketing", deptId: "marketing", start: "08 jul 2026" },
            { name: "Tiago Nunes", role: "Desenvolvedor Frontend", dept: "TI", deptId: "ti", start: "10 jul 2026" },
            { name: "Una Ferreira", role: "Executiva Comercial", dept: "Comercial", deptId: "comercial", start: "14 jul 2026" },
            { name: "Vicente Lima", role: "Analista Financeiro", dept: "Financeiro", deptId: "financeiro", start: "15 jul 2026" }
          ]
        },
        {
          id: "jun-2026",
          name: "Junho 2026",
          people: [
            { name: "William Souza", role: "DevOps Engineer", dept: "TI", deptId: "ti", start: "02 jun 2026" },
            { name: "Xavier Dias", role: "SDR", dept: "Comercial", deptId: "comercial", start: "09 jun 2026" },
            { name: "Yasmin Teixeira", role: "Analista de Social Media", dept: "Marketing", deptId: "marketing", start: "16 jun 2026" },
            { name: "Zilda Campos", role: "Assistente de RH", dept: "Recursos Humanos", deptId: "rh", start: "18 jun 2026" },
            { name: "Amanda Rocha", role: "UX Researcher", dept: "Produto", deptId: "produto", start: "23 jun 2026" },
            { name: "Bernardo Pires", role: "Analista de QA", dept: "TI", deptId: "ti", start: "30 jun 2026" }
          ]
        }
      ];

      let avatarIndex = 0;

      function nextAvatar() {
        const avatar = avatars[avatarIndex % avatars.length];
        avatarIndex += 1;
        return avatar;
      }

      function renderPerson(person) {
        const avatar = nextAvatar();
        return `
          <article class="person-card" data-dept="${person.deptId}">
            <img class="person-card__avatar" src="${avatar}" alt="" />
            <h2 class="person-card__name">${person.name}</h2>
            <p class="person-card__role">${person.role}</p>
            <span class="person-card__dept">${person.dept}</span>
            <p class="person-card__start">Início: ${person.start}</p>
            <div class="person-card__actions">
              <a class="person-card__btn" href="#" aria-label="Dar boas-vindas a ${person.name}"><i class="fa-regular fa-hand-peace" aria-hidden="true"></i></a>
              <a class="person-card__btn" href="#" aria-label="Enviar mensagem para ${person.name}"><i class="fa-regular fa-comment" aria-hidden="true"></i></a>
              <a class="person-card__btn" href="#" aria-label="Ver perfil de ${person.name}"><i class="fa-regular fa-user" aria-hidden="true"></i></a>
            </div>
          </article>
        `;
      }

      function renderCohort(cohort) {
        const cards = cohort.people.map(renderPerson).join("");
        return `
          <section class="dept-group" data-cohort="${cohort.id}" aria-label="${cohort.name}">
            <div class="dept-group__header">
              <h2 class="dept-group__title">${cohort.name}</h2>
              <span class="dept-group__count">${cohort.people.length} admissões</span>
            </div>
            <div class="directory-grid">
              ${cards}
            </div>
          </section>
        `;
      }

      const root = document.getElementById("newcomers-root");
      const countEl = document.getElementById("newcomers-count");
      const filters = document.getElementById("newcomers-filters");
      let activeFilter = "all";

      if (!root) return;

      root.innerHTML = cohorts.map(renderCohort).join("");

      function updateCount(visibleTotal, groupCount) {
        if (!countEl) return;
        if (activeFilter === "all") {
          countEl.textContent = "Exibindo " + visibleTotal + " novos colaboradores em " + groupCount + " meses";
        } else {
          countEl.textContent = "Exibindo " + visibleTotal + " novos colaboradores";
        }
      }

      function applyFilter(filter) {
        activeFilter = filter;
        let visibleTotal = 0;
        let groupCount = 0;

        root.querySelectorAll(".dept-group").forEach(function (group) {
          const cohortId = group.getAttribute("data-cohort");
          let visibleInGroup = 0;

          group.querySelectorAll(".person-card").forEach(function (card) {
            const deptId = card.getAttribute("data-dept");
            const match =
              filter === "all" ||
              filter === cohortId ||
              filter === deptId;
            card.hidden = !match;
            if (match) visibleInGroup += 1;
          });

          group.hidden = visibleInGroup === 0;
          if (visibleInGroup > 0) {
            groupCount += 1;
            visibleTotal += visibleInGroup;
            const countLabel = group.querySelector(".dept-group__count");
            if (countLabel && cohort) {
              countLabel.textContent = visibleInGroup + " admissões";
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