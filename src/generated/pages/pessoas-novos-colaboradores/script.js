(function () {
      const root = document.getElementById("newcomers-root");
      const countEl = document.getElementById("newcomers-count");
      const filters = document.getElementById("newcomers-filters");
      let activeFilter = "all";
      const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];

      if (!root) return;

      function escapeHtml(text) {
        return String(text || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/"/g, "&quot;");
      }

      function photoUrl(url) {
        if (!url) return "/avatar-ti.png";
        if (/^(https?:|data:|blob:)/i.test(url)) return url;
        return url.startsWith("/") ? url : "/" + url;
      }

      function slugify(value) {
        return String(value || "sem-departamento")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "sem-departamento";
      }

      function formatHireDate(hireDate) {
        if (!hireDate) return "—";
        var parts = hireDate.split("-");
        if (parts.length !== 3) return hireDate;
        return parts[2].padStart(2, "0") + " " + monthNames[Number(parts[1]) - 1].toLowerCase() + " " + parts[0];
      }

      function buildCohorts(people) {
        var cohorts = {};
        people.forEach(function (person) {
          if (!person.hireDate) return;
          var key = person.hireDate.slice(0, 7);
          var month = Number(person.hireDate.split("-")[1]);
          var year = person.hireDate.split("-")[0];
          if (!cohorts[key]) {
            cohorts[key] = {
              id: key,
              name: monthNames[month - 1] + " " + year,
              people: []
            };
          }
          cohorts[key].people.push({
            name: person.name,
            role: person.title || "Colaborador",
            dept: person.departmentName || "",
            deptId: slugify(person.departmentName),
            start: formatHireDate(person.hireDate),
            slug: person.slug,
            photoUrl: person.photoUrl
          });
        });
        return Object.keys(cohorts).sort().reverse().map(function (key) { return cohorts[key]; });
      }

      function renderPerson(person) {
        var avatar = photoUrl(person.photoUrl);
        var profileHref = "/pessoas/perfil?id=" + encodeURIComponent(person.slug);
        return (
          '<article class="person-card" data-dept="' + person.deptId + '">' +
          '<img class="person-card__avatar" src="' + avatar + '" alt="" />' +
          '<h2 class="person-card__name">' + escapeHtml(person.name) + "</h2>" +
          '<p class="person-card__role">' + escapeHtml(person.role) + "</p>" +
          '<span class="person-card__dept">' + escapeHtml(person.dept) + "</span>" +
          '<p class="person-card__start">Início: ' + escapeHtml(person.start) + "</p>" +
          '<div class="person-card__actions">' +
          '<a class="person-card__btn" href="#" aria-label="Dar boas-vindas a ' + escapeHtml(person.name) + '"><i class="fa-regular fa-hand-peace" aria-hidden="true"></i></a>' +
          '<a class="person-card__btn" href="' + profileHref + '" aria-label="Ver perfil de ' + escapeHtml(person.name) + '"><i class="fa-regular fa-user" aria-hidden="true"></i></a>' +
          "</div></article>"
        );
      }

      function renderCohort(cohort) {
        return (
          '<section class="dept-group" data-cohort="' + cohort.id + '" aria-label="' + escapeHtml(cohort.name) + '">' +
          '<div class="dept-group__header">' +
          '<h2 class="dept-group__title">' + escapeHtml(cohort.name) + "</h2>" +
          '<span class="dept-group__count">' + cohort.people.length + " admissões</span>" +
          "</div>" +
          '<div class="directory-grid">' + cohort.people.map(renderPerson).join("") + "</div></section>"
        );
      }

      function updateCount(visibleTotal, groupCount) {
        if (!countEl) return;
        countEl.textContent = activeFilter === "all"
          ? "Exibindo " + visibleTotal + " novos colaboradores em " + groupCount + " meses"
          : "Exibindo " + visibleTotal + " novos colaboradores";
      }

      function applyFilter(filter) {
        activeFilter = filter;
        var visibleTotal = 0;
        var groupCount = 0;
        root.querySelectorAll(".dept-group").forEach(function (group) {
          var cohortId = group.getAttribute("data-cohort");
          var visibleInGroup = 0;
          group.querySelectorAll(".person-card").forEach(function (card) {
            var deptId = card.getAttribute("data-dept");
            var match = filter === "all" || filter === cohortId || filter === deptId;
            card.hidden = !match;
            if (match) visibleInGroup += 1;
          });
          group.hidden = visibleInGroup === 0;
          if (visibleInGroup > 0) {
            groupCount += 1;
            visibleTotal += visibleInGroup;
          }
        });
        updateCount(visibleTotal, groupCount);
      }

      if (filters) {
        filters.addEventListener("click", function (event) {
          var chip = event.target.closest(".filter-chip");
          if (!chip) return;
          filters.querySelectorAll(".filter-chip").forEach(function (btn) {
            btn.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          applyFilter(chip.getAttribute("data-filter") || "all");
        });
      }

      root.innerHTML = '<p class="page-empty-note">Carregando novos colaboradores...</p>';

      if (!window.LioApi || window.LioApi.useMock) {
        root.innerHTML = '<p class="page-empty-note">API indisponível. Ative o backend e desabilite VITE_USE_MOCK.</p>';
        return;
      }

      window.LioApi.get("/people/new-hires?days=180")
        .then(function (people) {
          var cohorts = buildCohorts(people || []);
          if (!cohorts.length) {
            root.innerHTML = '<p class="page-empty-note">Nenhuma admissão recente. Execute os workers Graph e TOTVS.</p>';
            return;
          }
          root.innerHTML = cohorts.map(renderCohort).join("");
          applyFilter("all");
        })
        .catch(function () {
          root.innerHTML = '<p class="page-empty-note">Não foi possível carregar novos colaboradores.</p>';
        });
    })();
