(function () {
      const root = document.getElementById("birthday-root");
      const countEl = document.getElementById("birthday-count");
      const filters = document.getElementById("birthday-filters");
      let activeFilter = "all";
      const monthNames = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
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

      function formatBirthLabel(birthDate) {
        if (!birthDate) return "";
        var parts = birthDate.split("-");
        if (parts.length !== 3) return birthDate;
        return Number(parts[2]) + " de " + monthNames[Number(parts[1]) - 1];
      }

      function daysUntilBirthday(birthDate, today) {
        var parts = birthDate.split("-");
        var month = Number(parts[1]);
        var day = Number(parts[2]);
        var next = new Date(today.getFullYear(), month - 1, day);
        if (next < today) {
          next = new Date(today.getFullYear() + 1, month - 1, day);
        }
        return Math.round((next - today) / 86400000);
      }

      function buildGroups(people) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var groups = [
          { id: "today", name: "Hoje", people: [] },
          { id: "week", name: "Esta semana", people: [] },
          { id: "month", name: "Este mês", people: [] }
        ];
        var byMonth = {};

        people.forEach(function (person) {
          if (!person.birthDate) return;
          var days = daysUntilBirthday(person.birthDate, today);
          var entry = {
            name: person.name,
            role: person.title || "Colaborador",
            dept: person.departmentName || "",
            deptId: slugify(person.departmentName || "sem-departamento"),
            day: Number(person.birthDate.split("-")[2]),
            month: Number(person.birthDate.split("-")[1]),
            label: formatBirthLabel(person.birthDate),
            slug: person.slug,
            photoUrl: person.photoUrl
          };

          if (days === 0) groups[0].people.push(entry);
          else if (days <= 7) groups[1].people.push(entry);
          else if (days <= 30) groups[2].people.push(entry);

          var monthKey = person.birthDate.slice(0, 7);
          if (!byMonth[monthKey]) {
            byMonth[monthKey] = {
              id: "month-" + monthKey,
              name: monthNames[entry.month - 1] + " (aniversários)",
              people: []
            };
          }
          byMonth[monthKey].people.push(entry);
        });

        var result = groups.filter(function (g) { return g.people.length; });
        Object.keys(byMonth).sort().forEach(function (key) {
          if (byMonth[key].people.length) result.push(byMonth[key]);
        });
        return result;
      }

      function slugify(value) {
        return String(value || "sem-departamento")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "sem-departamento";
      }

      function isToday(person) {
        var today = new Date();
        return person.day === today.getDate() && person.month === today.getMonth() + 1;
      }

      function renderPerson(person) {
        var avatar = photoUrl(person.photoUrl);
        var todayClass = isToday(person) ? " is-today" : "";
        var todayBadge = isToday(person) ? '<span class="person-card__today-badge">Hoje</span>' : "";
        var profileHref = "/pessoas/perfil?id=" + encodeURIComponent(person.slug);
        return (
          '<article class="person-card' + todayClass + '" data-day="' + person.day + '" data-month="' + person.month + '">' +
          todayBadge +
          '<img class="person-card__avatar" src="' + avatar + '" alt="" />' +
          '<h2 class="person-card__name">' + escapeHtml(person.name) + "</h2>" +
          '<p class="person-card__role">' + escapeHtml(person.role) + "</p>" +
          '<span class="person-card__dept">' + escapeHtml(person.dept) + "</span>" +
          '<p class="person-card__birthday">' + escapeHtml(person.label) + "</p>" +
          '<div class="person-card__actions">' +
          '<a class="person-card__btn" href="#" aria-label="Parabenizar ' + escapeHtml(person.name) + '"><i class="fa-regular fa-gift" aria-hidden="true"></i></a>' +
          '<a class="person-card__btn" href="' + profileHref + '" aria-label="Ver perfil de ' + escapeHtml(person.name) + '"><i class="fa-regular fa-user" aria-hidden="true"></i></a>' +
          "</div></article>"
        );
      }

      function renderGroup(group) {
        return (
          '<section class="dept-group" data-group="' + group.id + '" aria-label="' + escapeHtml(group.name) + '">' +
          '<div class="dept-group__header">' +
          '<h2 class="dept-group__title">' + escapeHtml(group.name) + "</h2>" +
          '<span class="dept-group__count">' + group.people.length + " aniversariantes</span>" +
          "</div>" +
          '<div class="directory-grid">' + group.people.map(renderPerson).join("") + "</div></section>"
        );
      }

      function updateCount(visibleTotal, groupCount) {
        if (!countEl) return;
        countEl.textContent = activeFilter === "all"
          ? "Exibindo " + visibleTotal + " aniversariantes em " + groupCount + " períodos"
          : "Exibindo " + visibleTotal + " aniversariantes";
      }

      function cardMatchesFilter(card, filter, groupId) {
        if (filter === "all") return true;
        if (filter === groupId) return true;
        if (filter === "today") {
          var today = new Date();
          return Number(card.getAttribute("data-day")) === today.getDate()
            && Number(card.getAttribute("data-month")) === today.getMonth() + 1;
        }
        if (filter === "week") {
          return groupId === "week" || groupId === "today";
        }
        if (filter === "month") {
          return groupId === "month" || groupId === "week" || groupId === "today";
        }
        return false;
      }

      function applyFilter(filter) {
        activeFilter = filter;
        var visibleTotal = 0;
        var groupCount = 0;
        root.querySelectorAll(".dept-group").forEach(function (group) {
          var groupId = group.getAttribute("data-group");
          var visibleInGroup = 0;
          group.querySelectorAll(".person-card").forEach(function (card) {
            var match = cardMatchesFilter(card, filter, groupId);
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

      root.innerHTML = '<p class="page-empty-note">Carregando aniversariantes...</p>';

      if (!window.LioApi || window.LioApi.useMock) {
        root.innerHTML = '<p class="page-empty-note">API indisponível. Ative o backend e desabilite VITE_USE_MOCK.</p>';
        return;
      }

      window.LioApi.get("/people/birthdays?days=60")
        .then(function (people) {
          var groups = buildGroups(people || []);
          if (!groups.length) {
            root.innerHTML = '<p class="page-empty-note">Nenhum aniversariante nos próximos 60 dias. Execute os workers Graph e TOTVS.</p>';
            return;
          }
          root.innerHTML = groups.map(renderGroup).join("");
          applyFilter("all");
        })
        .catch(function () {
          root.innerHTML = '<p class="page-empty-note">Não foi possível carregar aniversariantes.</p>';
        });
    })();
